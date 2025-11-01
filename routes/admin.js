import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
const router = express.Router();

router.get("/admin", verifyToken, allowRoles("admin"), (req, res) => {
  res.json({ message: "✅ Admin Access Granted", user: req.user });
});

router.get("/moderator", verifyToken, allowRoles("admin", "moderator"), (req, res) => {
  res.json({ message: "✅ Moderator Access Granted", user: req.user });
});

router.get("/user", verifyToken, allowRoles("admin", "moderator", "user"), (req, res) => {
  res.json({ message: "✅ User Access Granted", user: req.user });
});

export default router;
