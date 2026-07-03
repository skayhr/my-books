import express from "express";
import { getAuthUser, getPublicUser, updateUser } from "../lib/auth-store.js";

const router = express.Router();

router.get("/me", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json(getPublicUser(user));
});

router.put("/me", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const updates = req.body ?? {};
  const updated = await updateUser(user.username, updates as any);
  return res.json(getPublicUser(updated));
});

export default router;