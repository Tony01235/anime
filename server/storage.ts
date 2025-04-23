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
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist, creating...`);
      fs.writeFileSync(filePath, JSON.stringify({ ratings: {} }), 'utf-8');
      return { ratings: {} };
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    if (!data || data.trim() === '') {
      console.log(`File ${filePath} is empty, initializing...`);
      const initialData = { ratings: {} };
      fs.writeFileSync(filePath, JSON.stringify(initialData), 'utf-8');
      return initialData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { ratings: {} };
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
  private ratingsArray: AnimeRating[]; // Array of ratings instead of object
  currentId: number;

  constructor() {
    // Initialize ratings as array
    try {
      if (fs.existsSync(RATINGS_FILE)) {
        const data = readJsonFile(RATINGS_FILE);
        this.ratingsArray = Array.isArray(data.ratings) ? data.ratings : [];
        
        // Log successful initialization
        console.log(`Initialized with ${this.ratingsArray.length} ratings from file`);
      } else {
        this.ratingsArray = [];
        writeJsonFile(RATINGS_FILE, { ratings: [] });
        console.log("Created new empty ratings file");
      }
    } catch (error) {
      console.error("Error initializing ratings:", error);
      this.ratingsArray = [];
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

      // Update in-memory array first
      const index = this.ratingsArray.findIndex(r => r.id === rating.id);
      if (index !== -1) {
        this.ratingsArray[index] = newRating;
      } else {
        this.ratingsArray.push(newRating);
      }

      // Save to file
      const success = await writeJsonFile(RATINGS_FILE, { ratings: this.ratingsArray });
      if (!success) {
        throw new Error("Failed to write ratings to file");
      }
      
      console.log(`Saved rating for anime ${rating.animeTitle} (ID: ${rating.id})`);
      return newRating;
    } catch (error) {
      console.error("Error saving rating:", error);
      throw error;
    }
  }

  async getRatings(userId: number): Promise<AnimeRating[]> {
    try {
      // Return the in-memory array which should already be initialized from the file
      console.log(`Returning ${this.ratingsArray.length} ratings from memory`);
      return this.ratingsArray;
    } catch (error) {
      console.error("Error getting ratings:", error);
      return [];
    }
  }

  async deleteRating(id: string, userId: number): Promise<boolean> {
    try {
      const initialLength = this.ratingsArray.length;
      this.ratingsArray = this.ratingsArray.filter(rating => rating.id !== id);
      
      if (initialLength !== this.ratingsArray.length) {
        // Rating was found and removed
        const success = await writeJsonFile(RATINGS_FILE, { ratings: this.ratingsArray });
        console.log(`Rating ${id} deleted successfully`);
        return success;
      }
      
      console.log(`Rating ${id} not found for deletion`);
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