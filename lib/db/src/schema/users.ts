import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  username: text("username").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull(),
  employeeId: text("employee_id").notNull(),
  phone: text("phone").notNull(),
  avatarUrl: text("avatar_url"),
  status: text("status").notNull().default("active"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ status: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
