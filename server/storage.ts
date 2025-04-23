import { users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Rating methods
  saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating>;
  getRatings(userId: number): Promise<AnimeRating[]>;
  deleteRating(id: string, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ratings: Map<string, AnimeRating>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.ratings = new Map();
    this.currentId = 1;
  }

  async saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating> {
    try {
      this.ratings.set(rating.id, rating);
      return rating;
    } catch (error) {
      console.error("Storage error while saving rating:", error);
      throw error;
    }
  }

  async getRatings(userId: number): Promise<AnimeRating[]> {
    try {
      return Array.from(this.ratings.values());
    } catch (error) {
      console.error("Storage error while fetching ratings:", error);
      return [];
    }
  }

  async deleteRating(id: string, userId: number): Promise<boolean> {
    try {
      return this.ratings.delete(id);
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
      (user) => user.username === username,
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
