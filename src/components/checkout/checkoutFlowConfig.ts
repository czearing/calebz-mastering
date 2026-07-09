import type { Cart } from "@/lib/checkout";
import type { Step } from "./useCheckout";

export const STEP_LABELS: Record<Step, string> = {
  package: "Package",
  addons: "Add-ons",
  tracks: "Tracks",
  summary: "Review",
  details: "Details",
  upload: "Upload",
  notes: "Notes",
  payment: "Pay",
  confirm: "Done",
};

export type CheckoutFlowProps = {
  initialCart?: Cart;
  flow?: Step[];
  contactHref?: string;
  orderId?: string;
  persist?: boolean;
};
