import { Router } from "express";
import { db } from "@workspace/db";
import { employeesTable } from "@workspace/db";
import { eq, or, ilike } from "drizzle-orm";
import {
  CreateEmployeeBody,
  ImportEmployeesBody,
  LookupEmployeeParams,
  GetEmployeesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = GetEmployeesQueryParams.safeParse(req.query);
  const search = parsed.success ? parsed.data.search : undefined;
  let employees;
  if (search) {
    employees = await db
      .select()
      .from(employeesTable)
      .where(
        or(
          ilike(employeesTable.fullName, `%${search}%`),
          ilike(employeesTable.employeeId, `%${search}%`),
          ilike(employeesTable.department, `%${search}%`)
        )
      )
      .orderBy(employeesTable.id);
  } else {
    employees = await db.select().from(employeesTable).orderBy(employeesTable.id);
  }
  res.json(employees);
});

router.post("/", async (req, res) => {
  const parsed = CreateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [created] = await db.insert(employeesTable).values(parsed.data).returning();
  res.status(201).json(created);
});

router.post("/import", async (req, res) => {
  const parsed = ImportEmployeesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { employees } = parsed.data;
  let imported = 0;
  for (const emp of employees) {
    try {
      await db
        .insert(employeesTable)
        .values(emp)
        .onConflictDoUpdate({
          target: employeesTable.employeeId,
          set: {
            fullName: emp.fullName,
            jobTitle: emp.jobTitle,
            department: emp.department,
          },
        });
      imported++;
    } catch {
      // skip
    }
  }
  res.json({ imported, total: employees.length });
});

router.delete("/clear", async (req, res) => {
  await db.delete(employeesTable);
  res.json({ message: "All employees cleared" });
});

router.get("/:employeeId/lookup", async (req, res) => {
  const parsed = LookupEmployeeParams.safeParse({ employeeId: req.params.employeeId });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.employeeId, parsed.data.employeeId))
    .limit(1);
  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json(employee);
});

export default router;
