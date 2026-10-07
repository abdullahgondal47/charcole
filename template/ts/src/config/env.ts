import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    CORS_ORIGIN: z.string().default("*"),
    REQUEST_TIMEOUT: z.coerce.number().default(30000),
    PAYMENT_PROVIDER: z.enum(["stripe", "lemonsqueezy"]).optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    LEMONSQUEEZY_API_KEY: z.string().optional(),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
    LEMONSQUEEZY_STORE_ID: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.PAYMENT_PROVIDER) {
      return;
    }

    if (values.PAYMENT_PROVIDER === "stripe") {
      if (!values.STRIPE_SECRET_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["STRIPE_SECRET_KEY"],
          message: "STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER is 'stripe'",
        });
      }

      if (!values.STRIPE_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["STRIPE_WEBHOOK_SECRET"],
          message:
            "STRIPE_WEBHOOK_SECRET is required when PAYMENT_PROVIDER is 'stripe'",
        });
      }
    }

    if (values.PAYMENT_PROVIDER === "lemonsqueezy") {
      if (!values.LEMONSQUEEZY_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["LEMONSQUEEZY_API_KEY"],
          message:
            "LEMONSQUEEZY_API_KEY is required when PAYMENT_PROVIDER is 'lemonsqueezy'",
        });
      }

      if (!values.LEMONSQUEEZY_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["LEMONSQUEEZY_WEBHOOK_SECRET"],
          message:
            "LEMONSQUEEZY_WEBHOOK_SECRET is required when PAYMENT_PROVIDER is 'lemonsqueezy'",
        });
      }

      if (!values.LEMONSQUEEZY_STORE_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["LEMONSQUEEZY_STORE_ID"],
          message:
            "LEMONSQUEEZY_STORE_ID is required when PAYMENT_PROVIDER is 'lemonsqueezy'",
        });
      }
    }
  });

type EnvSchema = z.infer<typeof envSchema>;

const parseEnv = (): EnvSchema => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error("❌ Failed to parse environment variables:", error);
    }
    process.exit(1);
  }
};

const parsedEnv = parseEnv();

export const env = {
  ...parsedEnv,
  isDevelopment: parsedEnv.NODE_ENV === "development",
  isProduction: parsedEnv.NODE_ENV === "production",
  isTest: parsedEnv.NODE_ENV === "test",
} as const;

export type Env = typeof env;
