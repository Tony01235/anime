import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import fs from "fs";
import path from "path";
import { apiResponseSchema, animeDetailSchema, animeRatingSchema, animeSearchResultSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

// API Constants
const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4";
const ANILIST_API_URL = "https://graphql.anilist.co";

// Add delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function registerRoutes(app: Express): Promise<Server> {
  // Search anime from Jikan API
  app.get("/api/anime/search", async (req, res) => {
    try {
      const { query, page = "1", limit = "12" } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      // Add a small delay to avoid rate limiting
      await delay(300);

      const response = await axios.get(`${JIKAN_API_BASE_URL}/anime`, {
        params: {
          q: query,
          page,
          limit,
          sfw: true,
        },
      });

      const validatedData = apiResponseSchema.parse(response.data);
      res.json(validatedData);
    } catch (error) {
      console.error("Error searching anime:", error);
      
      if (error instanceof ZodError) {
        return res.status(500).json({ message: "Invalid API response format", error: error.message });
      }
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        return res.status(status).json({ message });
      }
      
      res.status(500).json({ message: "Failed to search anime" });
    }
  });

  // Get anime details from Jikan API
  app.get("/api/anime/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Anime ID is required" });
      }

      // Add a longer delay to avoid rate limiting
      await delay(1000);

      let animeData;
      
      try {
        const response = await axios.get(`${JIKAN_API_BASE_URL}/anime/${id}/full`);
        animeData = response.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.log("Rate limited by Jikan API, retrying with longer delay...");
          // Add even longer delay on rate limit
          await delay(2000);
          const retryResponse = await axios.get(`${JIKAN_API_BASE_URL}/anime/${id}/full`);
          animeData = retryResponse.data.data;
        } else {
          throw error;
        }
      }
      
      // Validate data format
      const validatedData = animeDetailSchema.parse(animeData);
      res.json(validatedData);
    } catch (error) {
      console.error("Error fetching anime details:", error);
      
      if (error instanceof ZodError) {
        return res.status(500).json({ message: "Invalid API response format", error: error.message });
      }
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        return res.status(status).json({ message });
      }
      
      res.status(500).json({ message: "Failed to fetch anime details" });
    }
  });

  // Get anime recommendations from AniList API
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { animeIds, limit = "10" } = req.query;
      
      if (!animeIds || typeof animeIds !== "string") {
        return res.status(400).json({ message: "animeIds parameter is required" });
      }
      
      const malIds = animeIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      
      if (malIds.length === 0) {
        return res.status(400).json({ message: "No valid anime IDs provided" });
      }
      
      // Convert MAL IDs to titles for AniList search
      const titlesPromises = malIds.map(async (id) => {
        try {
          const response = await axios.get(`${JIKAN_API_BASE_URL}/anime/${id}`);
          return response.data.data.title;
        } catch (error) {
          console.error(`Error fetching title for anime ID ${id}:`, error);
          return null;
        }
      });
      
      // Add delays between requests to avoid rate limiting
      const titles = (await Promise.all(titlesPromises)).filter(Boolean);
      
      if (titles.length === 0) {
        return res.status(404).json({ message: "Could not find titles for any of the provided anime IDs" });
      }
      
      // Get recommendations using AniList GraphQL API
      const query = `
        query ($search: String) {
          Page(page: 1, perPage: ${limit}) {
            media(type: ANIME, search: $search) {
              id
              idMal
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                medium
              }
              bannerImage
              format
              status
              episodes
              genres
              averageScore
              description
              startDate {
                year
              }
              studios {
                nodes {
                  name
                }
              }
            }
          }
        }
      `;
      
      // Get genres of the rated animes to find similar ones
      const genresPromises = malIds.map(async (id) => {
        try {
          const response = await axios.get(`${JIKAN_API_BASE_URL}/anime/${id}`);
          // Extract genres from the anime
          return response.data.data.genres?.map((g: any) => g.name) || [];
        } catch (error) {
          console.error(`Error fetching genres for anime ID ${id}:`, error);
          return [];
        }
      });
      
      // Add delays between requests to avoid rate limiting
      const genresArrays = (await Promise.all(genresPromises)).filter(arr => arr.length > 0);
      
      // Flatten and get unique genres
      const allGenres = Array.from(new Set(genresArrays.flat()));
      
      // Choose a random genre if available, otherwise use a random title
      let searchQuery;
      if (allGenres.length > 0) {
        const randomGenre = allGenres[Math.floor(Math.random() * allGenres.length)];
        searchQuery = randomGenre; // Search by genre
      } else {
        // Fallback to title search if no genres available
        searchQuery = titles[Math.floor(Math.random() * titles.length)];
      }
      
      console.log("Using search query for recommendations:", searchQuery);
      
      const anilistResponse = await axios.post(ANILIST_API_URL, {
        query,
        variables: {
          search: searchQuery
        }
      });
      
      // Convert AniList response to Jikan format for compatibility
      const anilistData = anilistResponse.data.data.Page.media;
      
      // Map AniList data to Jikan format
      const recommendations = anilistData
        .filter((anime: any) => anime.idMal && !malIds.includes(anime.idMal))
        .slice(0, parseInt(limit as string))
        .map((anime: any) => ({
          mal_id: anime.idMal,
          title: anime.title.english || anime.title.romaji,
          images: {
            jpg: {
              image_url: anime.coverImage.medium,
              small_image_url: anime.coverImage.medium,
              large_image_url: anime.coverImage.large
            }
          },
          type: anime.format,
          episodes: anime.episodes,
          year: anime.startDate?.year,
          score: anime.averageScore / 10, // AniList uses 100 scale, MAL uses 10
          synopsis: anime.description,
          studios: anime.studios?.nodes?.map((studio: any) => ({ name: studio.name })) || [],
          aired: {
            from: anime.startDate ? `${anime.startDate.year}-01-01` : null
          },
          genres: anime.genres?.map((genre: any) => ({ name: genre })) || []
        }));
      
      // Validate with our schema
      const validatedRecommendations = recommendations.map((rec: any) => animeSearchResultSchema.parse(rec));
      
      res.json({ recommendations: validatedRecommendations });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      
      if (error instanceof ZodError) {
        return res.status(500).json({ message: "Invalid API response format", error: error.message });
      }
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        return res.status(status).json({ message });
      }
      
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Save or update rating
  app.post("/api/ratings", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from auth
      const ratingData = animeRatingSchema.parse(req.body);
      
      if (!ratingData.id || !ratingData.animeId || !ratingData.animeTitle) {
        return res.status(400).json({ message: "Missing required rating data" });
      }

      const rating = {
        ...ratingData,
        createdAt: ratingData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedRating = await storage.saveRating(rating, userId);
      res.json(savedRating);
    } catch (error) {
      console.error("Error saving rating:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save rating" });
    }
  });

  // Get user ratings
  app.get("/api/ratings", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from auth
      const ratings = await storage.getRatings(userId);
      res.json(ratings || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // Delete rating
  app.delete("/api/ratings/:id", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from auth
      const { id } = req.params;
      const success = await storage.deleteRating(id, userId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Rating not found" });
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      res.status(500).json({ message: "Failed to delete rating" });
    }
  });

  // Get rating categories from JSON file
  app.get("/api/rating-categories", (req, res) => {
    try {
      // Versuchen wir einen absoluten Pfad
      const categoriesPath = path.resolve("server/rating-categories.json");
      
      console.log("Trying to load categories from:", categoriesPath);
      
      if (!fs.existsSync(categoriesPath)) {
        console.error("Categories file not found at:", categoriesPath);
        return res.status(404).json({ message: "Rating categories file not found" });
      }
      
      const categoriesData = fs.readFileSync(categoriesPath, "utf-8");
      console.log("Categories data loaded:", categoriesData.substring(0, 50) + "...");
      
      const categories = JSON.parse(categoriesData);
      
      // Validate the format
      if (!categories || !Array.isArray(categories.categories)) {
        console.error("Invalid categories format:", categories);
        return res.status(500).json({ message: "Invalid rating categories format" });
      }
      
      console.log("Successfully loaded categories:", categories.categories.length);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching rating categories:", error);
      res.status(500).json({ message: "Failed to fetch rating categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}