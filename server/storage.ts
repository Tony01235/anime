import { AnimeRating, User, InsertUser } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RATINGS_FILE = path.join(__dirname, "ratings.json");
const USERS_FILE = path.join(__dirname, "users.json");

// Hilfsfunktionen zum Lesen und Schreiben der Dateien
const initializeJsonFile = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8');
    }
  } catch (error) {
    console.error(`Error initializing file ${filePath}:`, error);
  }
};

const readJsonFile = (filePath: string) => {
  try {
    initializeJsonFile(filePath);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return {};
  }
};

const writeJsonFile = (filePath: string, data: any) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating>;
  getRatings(userId: number): Promise<AnimeRating[]>;
  deleteRating(id: string, userId: number): Promise<boolean>;
}

export class FileStorage implements IStorage {
  private users: { [key: number]: User };
  private ratings: { [key: string]: AnimeRating };
  currentId: number;

  constructor() {
    try {
      if (fs.existsSync(RATINGS_FILE)) {
        const data = readJsonFile(RATINGS_FILE);
        this.ratings = data.ratings || {};
      } else {
        this.ratings = {};
        writeJsonFile(RATINGS_FILE, { ratings: {} });
      }
    } catch (error) {
      console.error("Error initializing ratings:", error);
      this.ratings = {};
    }

    try {
      if (fs.existsSync(USERS_FILE)) {
        this.users = readJsonFile(USERS_FILE);
      } else {
        this.users = {};
        writeJsonFile(USERS_FILE, {});
      }
    } catch (error) {
      console.error("Error initializing users:", error);
      this.users = {};
    }

    this.currentId = Math.max(0, ...Object.keys(this.users).map(Number)) + 1;
  }

  async saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating> {
    try {
      if (!rating || !rating.id) {
        throw new Error("Rating data is invalid");
      }

      const newRating = {
        ...rating,
        updatedAt: new Date().toISOString()
      };

      this.ratings[rating.id] = newRating;
      await writeJsonFile(RATINGS_FILE, {ratings: this.ratings});
      return newRating;
    } catch (error) {
      console.error("Error saving rating:", error);
      throw error;
    }
  }

  async getRatings(userId: number): Promise<AnimeRating[]> {
    try {
      this.ratings = readJsonFile(RATINGS_FILE).ratings || {};
      return Object.values(this.ratings);
    } catch (error) {
      console.error("Error getting ratings:", error);
      return [];
    }
  }

  async deleteRating(id: string, userId: number): Promise<boolean> {
    try {
      if (this.ratings[id]) {
        delete this.ratings[id];
        return writeJsonFile(RATINGS_FILE, {ratings: this.ratings});
      }
      return false;
    } catch (error) {
      console.error("Error deleting rating:", error);
      return false;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Object.values(this.users).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users[id] = user;
    writeJsonFile(USERS_FILE, this.users);
    return user;
  }
}

export const storage = new FileStorage();