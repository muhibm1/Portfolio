const DOT = [120, 130, 255];
const NODE_COUNT = 7;

// Returns a smooth 0 to 1 flow value for one point of the dot field at time t.
function flow(x, y, t) {
  const v =
    Math.sin(x * 0.006 + t * 0.35 + Math.sin(y * 0.004 - t * 0.2) * 2) +
    Math.sin(y * 0.009 - t * 0.28 + Math.sin(x * 0.005 + t * 0.15) * 2) +
    Math.sin((x + y) * 0.004 + t * 0.22);
  return (v + 3) / 6;
}

// Returns where one drifting node sits at time t, as a fraction of the canvas.
function nodeAt(i, t) {
  return {
    x: 0.66 + 0.3 * Math.sin(t * (0.07 + i * 0.011) + i * 2.1),
    y: 0.55 + 0.32 * Math.sin(t * (0.09 + i * 0.013) + i * 1.3),
  };
}

// Paints one frame of the footer field: a flowing halftone of dots with a few linked nodes and pulses.
export function drawFooterField(ctx, w, h, t) {
  const step = w < 640 ? 8 : 10;
  ctx.clearRect(0, 0, w, h);

  for (let y = step / 2; y < h; y += step) {
    const rise = 0.25 + 0.75 * (y / h);
    for (let x = step / 2; x < w; x += step) {
      const edge = 0.45 + 0.55 * Math.abs((x / w) * 2 - 1);
      const v = flow(x, y, t) * rise * edge;
      const r = (step / 2) * Math.max(0, (v - 0.22) * 1.9);
      if (r < 0.4) continue;
      ctx.fillStyle = `rgba(${DOT[0]},${DOT[1]},${DOT[2]},${Math.min(0.85, v + 0.1)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.min(r, step / 2), 0, 6.2832);
      ctx.fill();
    }
  }

  // On a phone the text fills the footer, so the nodes would sit on top of it.
  if (w < 640) return;
  const nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
    const n = nodeAt(i, t);
    return { x: n.x * w, y: n.y * h };
  });
  const reach = Math.max(220, w * 0.28);
  ctx.lineWidth = 1;
  for (let i = 0; i < NODE_COUNT; i += 1) {
    for (let j = i + 1; j < NODE_COUNT; j += 1) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d > reach) continue;
      const a = 1 - d / reach;
      ctx.strokeStyle = `rgba(190,200,255,${0.28 * a})`;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.stroke();
      const p = (t * 0.25 + i * 0.37 + j * 0.19) % 1;
      ctx.fillStyle = `rgba(230,235,255,${0.9 * a})`;
      ctx.beginPath();
      ctx.arc(nodes[i].x + (nodes[j].x - nodes[i].x) * p, nodes[i].y + (nodes[j].y - nodes[i].y) * p, 2, 0, 6.2832);
      ctx.fill();
    }
  }
  nodes.forEach((n) => {
    ctx.fillStyle = 'rgba(230,235,255,0.95)';
    ctx.beginPath();
    ctx.arc(n.x, n.y, 3.5, 0, 6.2832);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,200,255,0.35)';
    ctx.beginPath();
    ctx.arc(n.x, n.y, 9, 0, 6.2832);
    ctx.stroke();
  });
}
