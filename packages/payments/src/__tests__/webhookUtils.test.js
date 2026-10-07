import { describe, it, expect } from "vitest";
import {
  getWebhookSignatureHeader,
  extractSignature,
} from "../helpers/webhookUtils.js";
import { PaymentError } from "../errors/PaymentError.js";

describe("webhookUtils", () => {
  describe("getWebhookSignatureHeader", () => {
    it("returns stripe-signature for stripe", () => {
      expect(getWebhookSignatureHeader("stripe")).toBe("stripe-signature");
    });

    it("returns x-signature for lemonsqueezy", () => {
      expect(getWebhookSignatureHeader("lemonsqueezy")).toBe("x-signature");
    });

    it("throws PaymentError for unknown provider", () => {
      expect(() => getWebhookSignatureHeader("unknown")).toThrow(PaymentError);
      expect(() => getWebhookSignatureHeader("unknown")).toThrowError(expect.objectContaining({
        code: "CONFIG_ERROR",
      }));
    });
  });

  describe("extractSignature", () => {
    it("returns header value when present", () => {
      const req = {
        headers: {
          "stripe-signature": "t=123,v1=abc",
        },
      };
      expect(extractSignature(req, "stripe")).toBe("t=123,v1=abc");
    });

    it("throws WEBHOOK_INVALID when header missing", () => {
      const req = {
        headers: {},
      };
      expect(() => extractSignature(req, "stripe")).toThrow(PaymentError);
      expect(() => extractSignature(req, "stripe")).toThrowError(expect.objectContaining({
        code: "WEBHOOK_INVALID",
        statusCode: 401,
      }));
    });
  });
});
