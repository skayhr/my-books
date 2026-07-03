import express from "express";
import {
  createUser,
  getUser,
  getPublicUser,
  generateToken,
  setToken,
  revokeToken,
  getAuthUser,
} from "../lib/auth-store.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body ?? {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email, and password are required" });
  }

  const existing = await getUser(username);
  if (existing) {
    return res.status(409).json({ error: "Username already exists" });
  }

  await createUser({
    username,
    email,
    password,
    fullName: username,
    jobTitle: "User",
    department: "General",
    employeeId: `EMP-${username}`,
    phone: "",
    avatarUrl: null,
    status: "active",
  });

  return res.status(201).json({ success: true });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  console.info("[AUTH] login attempt", {
    username: typeof username === "string" ? username : undefined,
    password: typeof password === "string" ? "[REDACTED]" : undefined,
    ip: req.ip,
    contentType: req.headers["content-type"],
    body: req.body,
  });

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const user = await getUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken();
  setToken(token, username);
  const publicUser = getPublicUser(user);

  return res.json({ token, ...publicUser });
});

router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? null;
  if (token) {
    revokeToken(token);
  }
  return res.status(204).send();
});

router.get("/me", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json(getPublicUser(user));
});

export default router;