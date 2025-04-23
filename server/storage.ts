
import { AnimeRating, User, InsertUser } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RATINGS_FILE = path.join(__dirname, "ratings.json");
const USERS_FILE = path.join(__dirname, "users.json");

// Hilfsfunktionen zum Lesen und Schreiben der Dateien
const readJsonFile = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}));
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return {};
  }
};

const writeJsonFile = (filePath: string, data: any) => {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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
    this.ratings = readJsonFile(RATINGS_FILE);
    this.users = readJsonFile(USERS_FILE);
    this.currentId = Math.max(0, ...Object.keys(this.users).map(Number)) + 1;
  }

  async saveRating(rating: AnimeRating, userId: number): Promise<AnimeRating> {
    if (!rating || !rating.id) {
      throw new Error("Rating data is invalid");
    }

    const newRating = {
      ...rating,
      updatedAt: new Date().toISOString()
    };

    this.ratings[rating.id] = newRating;
    writeJsonFile(RATINGS_FILE, this.ratings);
    return newRating;
  }

  async getRatings(userId: number): Promise<AnimeRating[]> {
    return Object.values(this.ratings);
  }

  async deleteRating(id: string, userId: number): Promise<boolean> {
    if (this.ratings[id]) {
      delete this.ratings[id];
      writeJsonFile(RATINGS_FILE, this.ratings);
      return true;
    }
    return false;
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
