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

export interface IStorage {
  // Draw operations
  createDraw(draw: InsertDraw): Promise<Draw>;
  getAllDraws(): Promise<Draw[]>;
  getDrawsByDateRange(startDate: string, endDate: string): Promise<Draw[]>;
  
  // Prediction operations
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getLatestPrediction(): Promise<Prediction | undefined>;
  getAllPredictions(): Promise<Prediction[]>;
  
  // ML Model operations
  createModel(model: InsertModel): Promise<MLModel>;
  getActiveModel(): Promise<MLModel | undefined>;
  updateModelAccuracy(id: number, accuracy: number): Promise<MLModel>;
  getAllModels(): Promise<MLModel[]>;
  
  // Data management
  clearAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private draws: Map<number, Draw>;
  private predictionsList: Map<number, Prediction>;
  private models: Map<number, MLModel>;
  private currentDrawId: number;
  private currentPredictionId: number;
  private currentModelId: number;

  constructor() {
    this.draws = new Map();
    this.predictionsList = new Map();
    this.models = new Map();
    this.currentDrawId = 1;
    this.currentPredictionId = 1;
    this.currentModelId = 1;
    
    // Initialize with a default active model
    this.createModel({
      version: "v2.4.1",
      accuracy: 75.0,
      trainingData: 0,
      isActive: "true"
    });
  }
  
  

  async createDraw(insertDraw: InsertDraw): Promise<Draw> {
    const id = this.currentDrawId++;
    const draw: Draw = { 
      ...insertDraw, 
      id, 
      createdAt: new Date() 
    };
    this.draws.set(id, draw);
    
    // Update active model training data count
    const activeModel = await this.getActiveModel();
    if (activeModel) {
      const totalDraws = this.draws.size;
      const updatedModel = { 
        ...activeModel, 
        trainingData: totalDraws,
        lastTrained: new Date(),
        accuracy: Math.min(98.5, 85 + (totalDraws / 100) * 2)
      };
      this.models.set(activeModel.id, updatedModel);
    }
    
    return draw;
  }

  async getAllDraws(): Promise<Draw[]> {
    return Array.from(this.draws.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getDrawsByDateRange(startDate: string, endDate: string): Promise<Draw[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Array.from(this.draws.values()).filter(draw => {
      const drawDate = new Date(draw.date);
      return drawDate >= start && drawDate <= end;
    });
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = { 
      ...insertPrediction, 
      id, 
      createdAt: new Date() 
    };
    this.predictionsList.set(id, prediction);
    return prediction;
  }

  async getLatestPrediction(): Promise<Prediction | undefined> {
    const predictions = Array.from(this.predictionsList.values());
    return predictions.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }

  async getAllPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictionsList.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createModel(insertModel: InsertModel): Promise<MLModel> {
    const id = this.currentModelId++;
    const model: MLModel = { 
      ...insertModel, 
      id, 
      lastTrained: new Date() 
    };
    this.models.set(id, model);
    return model;
  }

  async getActiveModel(): Promise<MLModel | undefined> {
    return Array.from(this.models.values()).find(model => model.isActive === "true");
  }

  async updateModelAccuracy(id: number, accuracy: number): Promise<MLModel> {
    const model = this.models.get(id);
    if (!model) {
      throw new Error(`Model with id ${id} not found`);
    }
    const updatedModel = { ...model, accuracy, lastTrained: new Date() };
    this.models.set(id, updatedModel);
    return updatedModel;
  }

  async getAllModels(): Promise<MLModel[]> {
    return Array.from(this.models.values()).sort((a, b) => 
      b.lastTrained.getTime() - a.lastTrained.getTime()
    );
  }

  async clearAllData(): Promise<void> {
    this.draws.clear();
    this.predictionsList.clear();
    this.models.clear();
    this.currentDrawId = 1;
    this.currentPredictionId = 1;
    this.currentModelId = 1;
    
    // Reinitialize with a default active model
    await this.createModel({
      version: "v2.4.1",
      accuracy: 75.0,
      trainingData: 0,
      isActive: "true"
    });
  }
}

import { DatabaseStorage } from "./db-storage";

// Use database storage if DATABASE_URL is available, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
