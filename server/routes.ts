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

  // Get anime recommendations from Jikan API
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
      
      // Choose a random anime ID to get recommendations for
      const randomAnimeId = malIds[Math.floor(Math.random() * malIds.length)];
      
      // Get recommendations directly from Jikan API
      await delay(1000); // Add delay to avoid rate limiting
      
      let recommendationsResponse;
      try {
        console.log(`Getting recommendations for anime ID: ${randomAnimeId}`);
        recommendationsResponse = await axios.get(
          `${JIKAN_API_BASE_URL}/anime/${randomAnimeId}/recommendations`
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.log("Rate limited by Jikan API, retrying with longer delay...");
          await delay(2000);
          recommendationsResponse = await axios.get(
            `${JIKAN_API_BASE_URL}/anime/${randomAnimeId}/recommendations`
          );
        } else {
          throw error;
        }
      }
      
      const jikanRecommendations = recommendationsResponse.data.data;
      
      // Filter out recommendations that are already in the user's rated anime list and any hentai content
      const filteredRecommendations = jikanRecommendations
        .filter((rec: any) => {
          // Filter out already rated anime
          if (malIds.includes(rec.entry.mal_id)) {
            return false;
          }
          
          // Filter out hentai/adult content by checking genres (if available)
          const isAdultContent = rec.entry.genres?.some((genre: any) => 
            genre.name.toLowerCase() === "hentai" || 
            genre.name.toLowerCase() === "ecchi"
          );
          
          return !isAdultContent;
        })
        .slice(0, parseInt(limit as string));
      
      // Need to get full details for each recommendation
      const detailPromises = filteredRecommendations.map(async (rec: any) => {
        await delay(300); // Add delay between requests
        try {
          const detailResponse = await axios.get(`${JIKAN_API_BASE_URL}/anime/${rec.entry.mal_id}`);
          return detailResponse.data.data;
        } catch (error) {
          console.error(`Error fetching details for anime ID ${rec.entry.mal_id}:`, error);
          return null;
        }
      });
      
      const animeDetails = (await Promise.all(detailPromises)).filter(Boolean);
      
      // Validate with our schema
      const validatedRecommendations = animeDetails.map((anime: any) => animeSearchResultSchema.parse(anime));
      
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