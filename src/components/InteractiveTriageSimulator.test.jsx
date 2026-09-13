import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InteractiveTriageSimulator from "./InteractiveTriageSimulator.jsx";

// The last of the three stage timeouts fires at 1500 ms. 600 ms is part-way through a run: the
// first stage has advanced and two timeouts are still pending.
const MID_RUN_MS = 600;
const FULL_RUN_MS = 1500;

function clickRun() {
  fireEvent.click(screen.getByRole("button", { name: /run decision engine/i }));
}

function clickReset() {
  fireEvent.click(screen.getByRole("button", { name: /reset simulator/i }));
}

function advanceBy(milliseconds) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

describe("InteractiveTriageSimulator", () => {
  it("labels the sample tickets as an illustrative example with fictional data", () => {
    render(<InteractiveTriageSimulator />);

    expect(screen.getAllByText(/illustrative example/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/fictional/i).length).toBeGreaterThanOrEqual(1);
  });

  describe("stage timers", () => {
    beforeEach(() => {
      // Only the timeout functions are faked, so React's own scheduling never shows up in the
      // timer count.
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("clears its pending timers on unmount and on reset", () => {
      it("when unmounted mid-run", () => {
        const { unmount } = render(<InteractiveTriageSimulator />);
        clickRun();
        advanceBy(MID_RUN_MS);

        unmount();

        expect(vi.getTimerCount()).toBe(0);
      });

      it("when Reset is clicked mid-run", () => {
        render(<InteractiveTriageSimulator />);
        clickRun();
        advanceBy(MID_RUN_MS);

        clickReset();

        expect(vi.getTimerCount()).toBe(0);
      });
    });

    it("leaves no timer when unmounted before the first stage", () => {
      const { unmount } = render(<InteractiveTriageSimulator />);
      clickRun();

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });

    it("logs no update after unmount", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const { unmount } = render(<InteractiveTriageSimulator />);
      clickRun();
      advanceBy(MID_RUN_MS);

      unmount();
      advanceBy(FULL_RUN_MS);

      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
