import { Router } from "express";
import { db } from "@workspace/db";
import { employeesTable, letterTypesTable, lettersTable } from "@workspace/db";
import { count, countDistinct } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const [[empCount], [typeCount], [deptCount], [letterCount]] = await Promise.all([
    db.select({ cnt: count() }).from(employeesTable),
    db.select({ cnt: count() }).from(letterTypesTable),
    db.select({ cnt: countDistinct(lettersTable.department) }).from(lettersTable),
    db.select({ cnt: count() }).from(lettersTable),
  ]);
  res.json({
    totalEmployees: Number(empCount?.cnt ?? 0),
    totalTypes: Number(typeCount?.cnt ?? 0),
    totalDepartments: Number(deptCount?.cnt ?? 0),
    totalLetters: Number(letterCount?.cnt ?? 0),
  });
});

export default router;
