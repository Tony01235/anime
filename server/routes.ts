import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { apiResponseSchema, animeDetailSchema, animeRatingSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4";

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

      // Add a small delay to avoid rate limiting
      await delay(300);

      const response = await axios.get(`${JIKAN_API_BASE_URL}/anime/${id}/full`);
      
      const validatedData = animeDetailSchema.parse(response.data.data);
      res.json(validatedData);
    } catch (error) {
      console.error("Error fetching anime details:", error);
      
      if (error instanceof ZodError) {

  // Save or update rating
  app.post("/api/ratings", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from auth
      const rating = animeRatingSchema.parse(req.body);
      const savedRating = await storage.saveRating(rating, userId);
      res.json(savedRating);
    } catch (error) {
      console.error("Error saving rating:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid rating data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to save rating",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user ratings
  app.get("/api/ratings", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from auth
      const ratings = await storage.getRatings(userId);
      if (!ratings) {
        return res.json([]);
      }
      res.json(ratings);
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

  const httpServer = createServer(app);
  return httpServer;
}
