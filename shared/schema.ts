import { pgTable, text, serial, integer, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const euroMillionsDraws = pgTable("euromillions_draws", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  drawNumber: integer("draw_number").notNull(),
  mainNumbers: json("main_numbers").$type<number[]>().notNull(),
  luckyStars: json("lucky_stars").$type<number[]>().notNull(),
  jackpotAmount: real("jackpot_amount").notNull(),
  jackpotWon: text("jackpot_won").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  mainNumbers: json("main_numbers").$type<number[]>().notNull(),
  luckyStars: json("lucky_stars").$type<number[]>().notNull(),
  confidenceScore: real("confidence_score").notNull(),
  modelVersion: text("model_version").notNull(),
  patternMatch: text("pattern_match").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mlModels = pgTable("ml_models", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  accuracy: real("accuracy").notNull(),
  trainingData: integer("training_data").notNull(),
  lastTrained: timestamp("last_trained").defaultNow().notNull(),
  isActive: text("is_active").notNull().default("true"),
});

export const insertDrawSchema = createInsertSchema(euroMillionsDraws).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertModelSchema = createInsertSchema(mlModels).omit({
  id: true,
  lastTrained: true,
});

export type InsertDraw = z.infer<typeof insertDrawSchema>;
export type Draw = typeof euroMillionsDraws.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type MLModel = typeof mlModels.$inferSelect;
