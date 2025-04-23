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
  private ratings: Map<string, AnimeRating>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.ratings = new Map();
    this.currentId = 1;
  }

  async saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating> {
    if (!rating || !rating.id) {
      throw new Error("Rating data is invalid");
    }

    const newRating = {
      ...rating,
      updatedAt: new Date().toISOString()
    };

    this.ratings.set(rating.id, newRating);
    return newRating;
  }

  async getRatings(userId: number): Promise<AnimeRating[]> {
    return Array.from(this.ratings.values());
  }

  async deleteRating(id: string, userId: number): Promise<boolean> {
    return this.ratings.delete(id);
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