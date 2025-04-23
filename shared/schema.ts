import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Ratings table schema
export const ratings = pgTable("ratings", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  animeId: integer("anime_id").notNull(),
  animeTitle: text("anime_title").notNull(),
  animeImage: text("anime_image").notNull(),
  categories: jsonb("categories").notNull(),
  overallRating: integer("overall_rating").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Rating category base schema (from the JSON file)
export const ratingCategoryBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
});

// Rating category with value schema (used in ratings)
export const ratingCategorySchema = ratingCategoryBaseSchema.extend({
  value: z.number().min(0).max(10).step(0.5),
});

export type RatingCategoryBase = z.infer<typeof ratingCategoryBaseSchema>;
export type RatingCategory = z.infer<typeof ratingCategorySchema>;

// Anime rating schema
export const animeRatingSchema = z.object({
  id: z.string(),
  animeId: z.number(),
  animeTitle: z.string(),
  animeImage: z.string(),
  categories: z.array(ratingCategorySchema),
  overallRating: z.number().min(0).max(5).step(0.5),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AnimeRating = z.infer<typeof animeRatingSchema>;

// Anime search result from Jikan API
export const animeSearchResultSchema = z.object({
  mal_id: z.number(),
  title: z.string(),
  images: z.object({
    jpg: z.object({
      image_url: z.string(),
      small_image_url: z.string(),
      large_image_url: z.string(),
    }),
  }),
  type: z.string().optional().nullable(),
  episodes: z.number().optional().nullable(),
  year: z.number().optional().nullable(),
  score: z.number().optional().nullable(),
  synopsis: z.string().optional().nullable(),
  studios: z.array(z.object({
    name: z.string(),
  })).optional().default([]),
  aired: z.object({
    from: z.string().optional().nullable(),
  }).optional().default({from: null}),
});

export type AnimeSearchResult = z.infer<typeof animeSearchResultSchema>;

// Anime detail from Jikan API
export const animeDetailSchema = animeSearchResultSchema.extend({
  genres: z.array(z.object({
    name: z.string(),
  })).optional().default([]),
  duration: z.string().optional().nullable(),
  rating: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
});

export type AnimeDetail = z.infer<typeof animeDetailSchema>;

// API response type
export const apiResponseSchema = z.object({
  data: z.array(animeSearchResultSchema),
  pagination: z.object({
    last_visible_page: z.number(),
    has_next_page: z.boolean(),
  }),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;
