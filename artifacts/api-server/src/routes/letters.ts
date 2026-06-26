import { Router } from "express";
import { db } from "@workspace/db";
import { lettersTable, letterTypesTable } from "@workspace/db";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";
import {
  CreateLetterBody,
  GetLetterParams,
  DeleteLetterParams,
  GetLettersQueryParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichLetter(letter: typeof lettersTable.$inferSelect) {
  const [type] = await db
    .select()
    .from(letterTypesTable)
    .where(eq(letterTypesTable.id, letter.letterTypeId))
    .limit(1);
  return {
    ...letter,
    letterTypeCode: type?.code ?? "",
    letterTypeNameAr: type?.nameAr ?? "",
    letterTypeNameEn: type?.nameEn ?? "",
    createdAt: letter.createdAt.toISOString(),
    pdfUrl: letter.pdfUrl ?? null,
  };
}

router.get("/", async (req, res) => {
  const parsed = GetLettersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const conditions = [];
  if (params.letterTypeId) {
    conditions.push(eq(lettersTable.letterTypeId, Number(params.letterTypeId)));
  }
  if (params.dateFrom) {
    conditions.push(gte(lettersTable.bookDate, params.dateFrom));
  }
  if (params.dateTo) {
    conditions.push(lte(lettersTable.bookDate, params.dateTo));
  }
  const letters = await db
    .select()
    .from(lettersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(lettersTable.createdAt);

  let filtered = letters;
  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = letters.filter(
      (l) =>
        l.employeeFullName.toLowerCase().includes(s) ||
        l.employeeId.toLowerCase().includes(s) ||
        l.department.toLowerCase().includes(s)
    );
  }

  const types = await db.select().from(letterTypesTable);
  const typeMap = new Map(types.map((t) => [t.id, t]));

  const result = filtered.map((letter) => {
    const type = typeMap.get(letter.letterTypeId);
    return {
      ...letter,
      letterTypeCode: type?.code ?? "",
      letterTypeNameAr: type?.nameAr ?? "",
      letterTypeNameEn: type?.nameEn ?? "",
      createdAt: letter.createdAt.toISOString(),
      pdfUrl: letter.pdfUrl ?? null,
    };
  });

  res.json(result);
});

router.post("/", async (req, res) => {
  const parsed = CreateLetterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [created] = await db
    .insert(lettersTable)
    .values({
      letterTypeId: parsed.data.letterTypeId,
      employeeId: parsed.data.employeeId,
      employeeFullName: parsed.data.employeeFullName,
      jobTitle: parsed.data.jobTitle,
      department: parsed.data.department,
      bookDate: parsed.data.bookDate,
      pdfUrl: parsed.data.pdfUrl ?? null,
    })
    .returning();
  const enriched = await enrichLetter(created);
  res.status(201).json(enriched);
});

router.get("/:id", async (req, res) => {
  const parsed = GetLetterParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [letter] = await db
    .select()
    .from(lettersTable)
    .where(eq(lettersTable.id, parsed.data.id))
    .limit(1);
  if (!letter) {
    res.status(404).json({ error: "Letter not found" });
    return;
  }
  res.json(await enrichLetter(letter));
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteLetterParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(lettersTable).where(eq(lettersTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
