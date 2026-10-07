import { Router } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import {
  getHealth,
  createItem,
  createItemSchema,
} from "../modules/health/controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import protectedRoutes from "./protected.ts";
import authRoutes from "../modules/auth/auth.routes.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

// Health check
router.get("/health", getHealth);

// Example: Create item with validation
router.post("/items", validateRequest(createItemSchema), createItem);

// 🔐 Auth routes
router.use("/auth", authRoutes);

// 💳 Payment routes — only loaded if the payments module was included during scaffolding
const paymentsRoutesPath = join(
  __dirname,
  "../modules/payments/payments.routes.ts",
);
if (existsSync(paymentsRoutesPath)) {
  try {
    const { default: paymentsRoutes } = await import(paymentsRoutesPath);
    router.use("/payments", paymentsRoutes);
  } catch (err) {
    console.error("Failed to load payments routes:", err);
  }
}

// 🔐 Protected routes (REQUIRED BEARER TOKEN FOR THEM)
router.use("/protected", protectedRoutes);

export default router;
