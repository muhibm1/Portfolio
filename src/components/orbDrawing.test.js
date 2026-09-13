import { describe, expect, it } from "vitest";
import { canvasWidthForViewport, colourForDepth } from "./orbDrawing.js";

const AMBER = "rgb(250, 203, 14)";
const ROSE = "rgb(240, 107, 168)";
const BLUE = "rgb(120, 186, 230)";
const WHITE = "rgb(255, 255, 255)";

describe("colourForDepth", () => {
  it("maps the near, middle and far depths onto the brand stops", () => {
    const far = colourForDepth(-1);
    const middle = colourForDepth(0);
    const near = colourForDepth(1);

    expect(far).toBe(AMBER);
    expect(middle).toBe("rgb(171, 152, 203)");
    expect(near).toBe(WHITE);
  });

  it("places the rose and blue stops at 30% and 65% of the depth range, as the brand gradient does", () => {
    const atThirtyPercent = colourForDepth(-0.4);
    const atSixtyFivePercent = colourForDepth(0.3);

    expect(atThirtyPercent).toBe(ROSE);
    expect(atSixtyFivePercent).toBe(BLUE);
  });

  it("gives depths beyond -1 and 1 the end colours", () => {
    const beyondFar = colourForDepth(-3);
    const beyondNear = colourForDepth(2);

    expect(beyondFar).toBe(AMBER);
    expect(beyondNear).toBe(WHITE);
  });
});

describe("canvasWidthForViewport", () => {
  it("clamps the canvas width to 420 at wide viewports and 280 at narrow ones", () => {
    const widths = [1440, 1024, 700, 468, 320].map(canvasWidthForViewport);

    expect(widths).toEqual([420, 420, 420, 420, 280]);
  });

  it("follows the viewport width minus 48 between 328 and 468", () => {
    const width = canvasWidthForViewport(400);

    expect(width).toBe(352);
  });
});
