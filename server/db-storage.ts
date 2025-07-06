import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { 
  euroMillionsDraws, 
  predictions, 
  mlModels,
  type Draw, 
  type InsertDraw,
  type Prediction, 
  type InsertPrediction,
  type MLModel,
  type InsertModel
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for database storage");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  // Draw operations
  async createDraw(draw: InsertDraw): Promise<Draw> {
    const [result] = await this.db.insert(euroMillionsDraws).values(draw).returning();
    return result;
  }

  async getAllDraws(): Promise<Draw[]> {
    return await this.db.select().from(euroMillionsDraws).orderBy(desc(euroMillionsDraws.createdAt));
  }

  async getDrawsByDateRange(startDate: string, endDate: string): Promise<Draw[]> {
    return await this.db.select().from(euroMillionsDraws)
      .where(
        // Add date range filter here if needed
      )
      .orderBy(desc(euroMillionsDraws.createdAt));
  }

  // Prediction operations
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [result] = await this.db.insert(predictions).values(prediction).returning();
    return result;
  }

  async getLatestPrediction(): Promise<Prediction | undefined> {
    const [result] = await this.db.select().from(predictions)
      .orderBy(desc(predictions.createdAt))
      .limit(1);
    return result;
  }

  async getAllPredictions(): Promise<Prediction[]> {
    return await this.db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }

  // ML Model operations
  async createModel(model: InsertModel): Promise<MLModel> {
    const [result] = await this.db.insert(mlModels).values(model).returning();
    return result;
  }

  async getActiveModel(): Promise<MLModel | undefined> {
    const [result] = await this.db.select().from(mlModels)
      .where(eq(mlModels.isActive, "true"))
      .orderBy(desc(mlModels.lastTrained))
      .limit(1);
    return result;
  }

  async updateModelAccuracy(id: number, accuracy: number): Promise<MLModel> {
    const [result] = await this.db.update(mlModels)
      .set({ 
        accuracy, 
        lastTrained: new Date() 
      })
      .where(eq(mlModels.id, id))
      .returning();
    return result;
  }

  async getAllModels(): Promise<MLModel[]> {
    return await this.db.select().from(mlModels).orderBy(desc(mlModels.lastTrained));
  }

  async clearAllData(): Promise<void> {
    // Delete all data from tables
    await this.db.delete(euroMillionsDraws);
    await this.db.delete(predictions);
    await this.db.delete(mlModels);
    
    // Create a default active model
    await this.db.insert(mlModels).values({
      version: "v2.4.1",
      accuracy: 75.0,
      trainingData: 0,
      isActive: "true"
    });
  }
}