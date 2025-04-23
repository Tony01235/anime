
import { AnimeRating, User, InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating>;
  getRatings(userId: number): Promise<AnimeRating[]>;
  deleteRating(id: string, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ratings: Map<number, Map<string, AnimeRating>>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.ratings = new Map();
    this.currentId = 1;
    // Initialize ratings for default user
    this.ratings.set(1, new Map());
  }

  private ensureUserRatings(userId: number) {
    if (!this.ratings.has(userId)) {
      this.ratings.set(userId, new Map());
    }
    return this.ratings.get(userId)!;
  }

  async saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating> {
    if (!rating || !rating.id) {
      throw new Error("Invalid rating data");
    }
    
    const userRatings = this.ensureUserRatings(userId);
    const savedRating = { ...rating, updatedAt: new Date().toISOString() };
    userRatings.set(rating.id, savedRating);
    return savedRating;
  }

  async getRatings(userId: number): Promise<AnimeRating[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const userRatings = this.ratings.get(userId);
    if (!userRatings) {
      return [];
    }
    
    return Array.from(userRatings.values());
  }

  async deleteRating(id: string, userId: number): Promise<boolean> {
    try {
      const userRatings = this.ratings.get(userId);
      return userRatings ? userRatings.delete(id) : false;
    } catch (error) {
      console.error("Storage error while deleting rating:", error);
      return false;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
