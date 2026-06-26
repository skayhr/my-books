import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const letterTypesTable = pgTable("letter_types", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
});

export const insertLetterTypeSchema = createInsertSchema(letterTypesTable).omit({ id: true });
export type InsertLetterType = z.infer<typeof insertLetterTypeSchema>;
export type LetterType = typeof letterTypesTable.$inferSelect;
