import { pgTable, text, serial, integer, json, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define budget item schema
export const budgetItemSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  amount: z.number().min(0),
  category: z.enum(["needs", "wants", "savings"]),
});

export type BudgetItem = z.infer<typeof budgetItemSchema>;

// Define budget schema
export const budgetSchema = z.object({
  income: z.number().min(0),
  additionalIncome: z.number().min(0),
  needs: z.array(budgetItemSchema).optional(),
  wants: z.array(budgetItemSchema).optional(),
  savings: z.array(budgetItemSchema).optional(),
  userId: z.string().optional(),
  createdAt: z.date().optional(),
  calculations: z.any().optional(), // Add calculations field to handle dynamic calculation results
});

export type Budget = z.infer<typeof budgetSchema>;

// Define the database schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  income: real("income").notNull(),
  additionalIncome: real("additional_income").default(0),
  needs: json("needs").$type<BudgetItem[]>(),
  wants: json("wants").$type<BudgetItem[]>(),
  savings: json("savings").$type<BudgetItem[]>(),
  userId: text("user_id"),
  createdAt: real("created_at"),
});

// Define the email report schema
export const emailReportSchema = z.object({
  email: z.string().email(),
  budget: budgetSchema,
});

export type EmailReport = z.infer<typeof emailReportSchema>;

// Define insert schemas
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type BudgetSelect = typeof budgets.$inferSelect;

// Define user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define Wix database user schema for storing user submissions
export const wixBudgetUsers = pgTable("wix_budget_users", {
  id: serial("id").primaryKey(),
  _id: text("wix_id").unique(), // Wix-compatible unique ID
  name: text("name").notNull(),
  email: text("email").notNull(),
  budget_json: text("budget_json").notNull(),
  timestamp: text("timestamp").notNull(),
  source: text("source"),
  consent: boolean("consent"),
  _createdDate: text("created_date"),
  _updatedDate: text("updated_date"),
});

// Define insert schema for Wix budget users
export const insertWixBudgetUserSchema = createInsertSchema(wixBudgetUsers).omit({ id: true });
export type InsertWixBudgetUser = z.infer<typeof insertWixBudgetUserSchema>;
export type WixBudgetUserSelect = typeof wixBudgetUsers.$inferSelect;
