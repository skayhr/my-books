import express from "express";
import cors from "cors";
import pino from "pino-http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { eq, sql, ilike, and, or, desc } from "drizzle-orm";

const app = express();
const port = process.env.PORT || 5000;

// --- إعدادات رفع الملفات ---
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.use(pino({ logger: { level: "info" } }));
app.use(cors());
app.use(express.json());

// --- مسارات خدمة الملفات ورفعها ---
app.use("/uploads", express.static(UPLOADS_DIR));

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ─── stats ────────────────────────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const totalEmployees = await db.select({ count: sql`count(*)` }).from(schema.employees);
    const totalTypes = await db.select({ count: sql`count(*)` }).from(schema.letterTypes);
    const totalLetters = await db.select({ count: sql`count(*)` }).from(schema.letters);
    const totalDepartments = await db.select({ count: sql`count(distinct "department")` }).from(schema.employees);

    res.json({
      totalEmployees: Number(totalEmployees[0].count),
      totalTypes: Number(totalTypes[0].count),
      totalLetters: Number(totalLetters[0].count),
      totalDepartments: Number(totalDepartments[0].count),
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error fetching stats");
  }
});

// ─── letter types ─────────────────────────────────────────────────────────────
app.get("/api/letter-types", async (req, res) => {
  try {
    const types = await db.query.letterTypes.findMany({
      with: {
        letters: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [desc(schema.letterTypes.id)],
    });
    const result = types.map(t => ({
      ...t,
      letterCount: t.letters.length,
    }));
    res.json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error fetching letter types");
  }
});

app.post("/api/letter-types", async (req, res) => {
  try {
    const newType = await db.insert(schema.letterTypes).values(req.body).returning();
    res.status(201).json(newType[0]);
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error creating letter type");
  }
});

app.delete("/api/letter-types/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(schema.letterTypes).where(eq(schema.letterTypes.id, id));
    res.status(204).send();
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error deleting letter type");
  }
});

// ─── employees ────────────────────────────────────────────────────────────────
app.get("/api/employees", async (req, res) => {
  try {
    const { search } = req.query;
    const query = db.select().from(schema.employees);
    if (search) {
      const s = `%${search}%`;
      query.where(or(
        ilike(schema.employees.employeeId, s),
        ilike(schema.employees.fullName, s),
        ilike(schema.employees.department, s)
      ));
    }
    const employees = await query.orderBy(desc(schema.employees.id));
    res.json(employees);
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error fetching employees");
  }
});

app.post("/api/employees/import", async (req, res) => {
  try {
    const { employees } = req.body;
    if (!Array.isArray(employees)) return res.status(400).send("Invalid data");
    const result = await db.insert(schema.employees).values(employees).onConflictDoNothing().returning();
    res.status(201).json({ imported: result.length });
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error importing employees");
  }
});

app.post("/api/employees/clear", async (req, res) => {
  try {
    await db.delete(schema.employees);
    res.status(204).send();
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error clearing employees");
  }
});

app.get("/api/employees/lookup/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await db.query.employees.findFirst({
      where: eq(schema.employees.employeeId, id),
    });
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).send("Employee not found");
    }
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error looking up employee");
  }
});

// ─── letters ──────────────────────────────────────────────────────────────────
app.get("/api/letters", async (req, res) => {
  try {
    const { search, letterTypeId, dateFrom, dateTo } = req.query;
    let conditions = [];
    if (search) {
      const s = `%${search}%`;
      conditions.push(or(
        ilike(schema.letters.employeeId, s),
        ilike(schema.letters.employeeFullName, s),
        ilike(schema.letters.department, s)
      ));
    }
    if (letterTypeId) conditions.push(eq(schema.letters.letterTypeId, Number(letterTypeId)));
    if (dateFrom) conditions.push(sql`${schema.letters.bookDate} >= ${dateFrom}`);
    if (dateTo) conditions.push(sql`${schema.letters.bookDate} <= ${dateTo}`);

    const letters = await db.query.letters.findMany({
      where: and(...conditions),
      with: {
        letterType: true,
      },
      orderBy: [desc(schema.letters.id)],
    });

    const result = letters.map(l => ({
      ...l,
      letterTypeCode: l.letterType.code,
      letterTypeNameEn: l.letterType.nameEn,
      letterTypeNameAr: l.letterType.nameAr,
    }));
    res.json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error fetching letters");
  }
});

app.post("/api/letters", async (req, res) => {
  try {
    const newLetter = await db.insert(schema.letters).values(req.body).returning();
    res.status(201).json(newLetter[0]);
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error creating letter");
  }
});

app.delete("/api/letters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(schema.letters).where(eq(schema.letters.id, id));
    res.status(204).send();
  } catch (error) {
    req.log.error(error);
    res.status(500).send("Error deleting letter");
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});