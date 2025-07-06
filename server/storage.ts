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
      accuracy: 94.2,
      trainingData: 1247,
      isActive: "true"
    });
    
    // Initialize with some sample historical data for demonstration
    this.initializeSampleData();
  }
  
  private async initializeSampleData() {
    const sampleDraws = [
      {
        date: "2025-07-04",
        drawNumber: 1851,
        mainNumbers: [3, 16, 23, 38, 47],
        luckyStars: [7, 11],
        jackpotAmount: 64000000,
        jackpotWon: "No"
      },
      {
        date: "2025-06-29",
        drawNumber: 1850,
        mainNumbers: [8, 19, 27, 34, 42],
        luckyStars: [2, 9],
        jackpotAmount: 58000000,
        jackpotWon: "No"
      },
      {
        date: "2025-06-25",
        drawNumber: 1849,
        mainNumbers: [12, 21, 29, 35, 44],
        luckyStars: [4, 8],
        jackpotAmount: 52000000,
        jackpotWon: "No"
      },
      {
        date: "2025-06-20",
        drawNumber: 1848,
        mainNumbers: [5, 14, 28, 39, 46],
        luckyStars: [1, 6],
        jackpotAmount: 47000000,
        jackpotWon: "No"
      },
      {
        date: "2025-06-16",
        drawNumber: 1847,
        mainNumbers: [7, 18, 25, 31, 49],
        luckyStars: [3, 10],
        jackpotAmount: 41000000,
        jackpotWon: "No"
      }
    ];
    
    for (const draw of sampleDraws) {
      await this.createDraw(draw);
    }
  }

  async createDraw(insertDraw: InsertDraw): Promise<Draw> {
    const id = this.currentDrawId++;
    const draw: Draw = { 
      ...insertDraw, 
      id, 
      createdAt: new Date() 
    };
    this.draws.set(id, draw);
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
}

export const storage = new MemStorage();
