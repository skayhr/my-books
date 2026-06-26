import { Router } from "express";
import { db } from "@workspace/db";
import { letterTypesTable, lettersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  CreateLetterTypeBody,
  DeleteLetterTypeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const types = await db.select().from(letterTypesTable).orderBy(letterTypesTable.code);
  const letterCounts = await db
    .select({ letterTypeId: lettersTable.letterTypeId, cnt: count() })
    .from(lettersTable)
    .groupBy(lettersTable.letterTypeId);
  const countMap = new Map(letterCounts.map((r) => [r.letterTypeId, Number(r.cnt)]));
  const result = types.map((t) => ({
    ...t,
    letterCount: countMap.get(t.id) ?? 0,
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const parsed = CreateLetterTypeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { code, nameAr, nameEn } = parsed.data;
  const [created] = await db
    .insert(letterTypesTable)
    .values({ code, nameAr, nameEn })
    .returning();
  res.status(201).json({ ...created, letterCount: 0 });
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteLetterTypeParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(letterTypesTable).where(eq(letterTypesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
