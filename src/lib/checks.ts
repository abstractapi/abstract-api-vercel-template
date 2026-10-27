import type { ProductId } from "@/lib/types";

// The checks every signup runs. Using only one or two Abstract products?
// Remove the others from this list: their form field and their rules go away.
export const CHECKS: ProductId[] = ["email", "phone", "ip"];

export const PRODUCTS: Record<ProductId, { name: string; envVar: string }> = {
  email: {
    name: "Email Intelligence",
    envVar: "ABSTRACT_EMAIL_INTELLIGENCE_API_KEY",
  },
  phone: {
    name: "Phone Intelligence",
    envVar: "ABSTRACT_PHONE_INTELLIGENCE_API_KEY",
  },
  ip: {
    name: "IP Intelligence",
    envVar: "ABSTRACT_IP_INTELLIGENCE_API_KEY",
  },
};
