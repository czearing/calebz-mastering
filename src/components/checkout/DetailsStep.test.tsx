import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetailsStep } from "./DetailsStep";
import { payerDefaults, type PayerInput } from "./payerSchema";

// Mirrors how the flow owns and persists the payer.
function Harness({ onNext }: { onNext: () => void }) {
  const [payer, setPayer] = useState<PayerInput>(payerDefaults);
  return (
    <DetailsStep payer={payer} onPayerChange={setPayer} onBack={() => {}} onNext={onNext} />
  );
}

describe("DetailsStep", () => {
  it("collects name and email and blocks continue until both are valid", async () => {
    const onNext = vi.fn();
    render(<Harness onNext={onNext} />);
    const cta = screen.getByRole("button", { name: "Continue" });
    expect(cta).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    expect(cta).toBeDisabled(); // email still missing

    await userEvent.type(screen.getByLabelText("Email"), "ada@studio.com");
    expect(cta).toBeEnabled();

    await userEvent.click(cta);
    expect(onNext).toHaveBeenCalled();
  });

  it("shows an inline error for a bad email on blur", async () => {
    render(<Harness onNext={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Email"), "nope");
    await userEvent.tab();
    expect(screen.getByText(/valid email/)).toBeInTheDocument();
  });
});
