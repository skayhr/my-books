import { Router } from "express";
import { db } from "@workspace/db";
import { letterTypesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { lettersTable } from "@workspace/db";
import {
  CreateLetterTypeBody,
  DeleteLetterTypeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const types = await db.select().from(letterTypesTable);
  res.json(types);
});

router.post("/", async (req, res) => {
  const parsed = CreateLetterTypeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { code, nameAr, nameEn, color } = parsed.data as any;
  const [created] = await db
    .insert(letterTypesTable)
    .values({ code, nameAr, nameEn, color })
    .returning();
  res.status(201).json({ ...created, letterCount: 0 });
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteLetterTypeParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  // Delete associated letters first, then the type
  await db.delete(lettersTable).where(eq(lettersTable.letterTypeId, parsed.data.id));
  await db.delete(letterTypesTable).where(eq(letterTypesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
