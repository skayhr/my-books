import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { letterTypesTable } from "./letterTypes";

export const lettersTable = pgTable("letters", {
  id: serial("id").primaryKey(),
  letterTypeId: integer("letter_type_id").notNull().references(() => letterTypesTable.id),
  employeeId: text("employee_id").notNull(),
  employeeFullName: text("employee_full_name").notNull(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull(),
  bookDate: text("book_date").notNull(),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLetterSchema = createInsertSchema(lettersTable).omit({ id: true, createdAt: true });
export type InsertLetter = z.infer<typeof insertLetterSchema>;
export type Letter = typeof lettersTable.$inferSelect;
