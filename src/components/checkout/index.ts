// Barrel for the checkout flow UI. Import from "@/components/checkout".
// The pure pricing/cart core lives in "@/lib/checkout".
export { CheckoutFlow } from "./CheckoutFlow";
export type { CheckoutFlowProps } from "./CheckoutFlow";

export { PackageStep } from "./PackageStep";
export { AddonsStep } from "./AddonsStep";
export { TracksStep } from "./TracksStep";
export { SummaryStep } from "./SummaryStep";
export { UploadStep } from "./UploadStep";
export { PaymentStep } from "./PaymentStep";
export { ConfirmStep } from "./ConfirmStep";

export { AddonChip } from "./AddonChip";
export { Dropzone } from "./Dropzone";
export { StepHeader } from "./StepHeader";
export { StepNav } from "./StepNav";

export { useCheckout, STEPS, FULL_FLOW, SEEDED_FLOW } from "./useCheckout";
export type { Step, CheckoutState } from "./useCheckout";
export { useUpload, isAccepted } from "./useUpload";
export { payerSchema } from "./payerSchema";
export type { PayerInput } from "./payerSchema";
