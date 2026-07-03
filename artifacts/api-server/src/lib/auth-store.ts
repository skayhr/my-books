import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import type { Request } from "express";

export type UserRecord = typeof usersTable.$inferSelect;

const tokens = new Map<string, string>();

export async function getUser(username: string): Promise<UserRecord | null> {
  const user = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  return user[0] ?? null;
}

export async function createUser(user: UserRecord): Promise<void> {
  await db.insert(usersTable).values(user);
}

export async function updateUser(username: string, updates: Partial<UserRecord>): Promise<UserRecord> {
  const existing = await getUser(username);
  if (!existing) {
    throw new Error("User not found");
  }

  const updated: UserRecord = {
    ...existing,
    ...updates,
    username: existing.username,
    password: updates.password ?? existing.password,
  };

  await db.update(usersTable).set({
    ...updated,
    password: updated.password,
  }).where(eq(usersTable.username, username));

  return updated;
}

export function getPublicUser(user: UserRecord) {
  const { password, ...publicUser } = user;
  return publicUser;
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function setToken(token: string, username: string): void {
  tokens.set(token, username);
}

export async function getUserByToken(token: string): Promise<UserRecord | null> {
  const username = tokens.get(token);
  if (!username) return null;
  return getUser(username);
}

export function revokeToken(token: string): void {
  tokens.delete(token);
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function getAuthUser(req: Request): Promise<UserRecord | null> {
  const token = getTokenFromRequest(req);
  return token ? getUserByToken(token) : null;
}
