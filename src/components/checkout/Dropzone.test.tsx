import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "./Dropzone";

function wav(name = "track.wav") {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "audio/wav" });
}

describe("Dropzone", () => {
  beforeEach(() =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ({ json: async () => ({ configured: false }) }) as unknown as Response,
      ),
    ),
  );
  afterEach(() => vi.unstubAllGlobals());

  it("shows the prep guidance and the flat format line at the zone", () => {
    render(<Dropzone orderId="o1" />);
    expect(screen.getByText(/WAV or AIFF\. One file per track/)).toBeInTheDocument();
    expect(screen.getByText(/no master-bus limiter/)).toBeInTheDocument();
  });

  it("switches the guidance for a stem order: multiple files per track", () => {
    render(<Dropzone orderId="o1" needsStems />);
    // A stem order must not say "one file per track": that contradicts the
    // order. It asks for the grouped stems, multiple files per track.
    expect(
      screen.queryByText(/One file per track/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Multiple files per track is expected/),
    ).toBeInTheDocument();
  });

  it("is keyboard operable: the zone is a real button", () => {
    render(<Dropzone orderId="o1" />);
    expect(
      screen.getByRole("button", { name: /Drop your tracks/ }),
    ).toBeInTheDocument();
  });

  it("accepts a WAV and surfaces the storage-not-connected state", async () => {
    render(<Dropzone orderId="o1" />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, wav());
    expect(
      await screen.findByText(/Ready once storage is connected/),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/upload-url", expect.anything());
  });

  it("rejects a non-audio file", async () => {
    render(<Dropzone orderId="o1" />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, new File(["x"], "notes.txt", { type: "text/plain" }));
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("counts the files against the ordered track count", async () => {
    render(<Dropzone orderId="o1" expected={3} />);
    expect(screen.getByText(/0 of 3 tracks added/)).toBeInTheDocument();
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, wav());
    expect(await screen.findByText(/1 of 3 tracks added/)).toBeInTheDocument();
  });

  it("removes a file the customer added by mistake", async () => {
    render(<Dropzone orderId="o1" />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, wav("oops.wav"));
    expect(await screen.findByText("oops.wav")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove oops.wav" }));
    expect(screen.queryByText("oops.wav")).not.toBeInTheDocument();
  });
});
