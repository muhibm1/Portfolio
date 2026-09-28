// Renders two of the case-study content blocks from ADR 0006: the default export draws a `flow`
// block (a row of step boxes, one gate or dashed step at most changing its style) and the named
// export `CaseStudyHubDiagram` draws a `link-diagram` block (one hub connected to a left node and
// a column of right-hand nodes).

// Literal Tailwind class names, one per supported `columns` value, so Tailwind's scanner sees
// them at build time. A `style={{ gridTemplateColumns }}` here would override the mobile
// `grid-cols-*` classes below at every breakpoint, not just the desktop one (R-review HIGH).
const FLOW_DESKTOP_COLUMNS_CLASS = {
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  8: 'md:grid-cols-8',
};

/** A `flow` block: `columns` sets the grid width, each step is `{ title, note, gate?, dashed? }`. */
export default function CaseStudyFlowDiagram({ columns, steps }) {
  const desktopColumnsClass = FLOW_DESKTOP_COLUMNS_CLASS[columns] ?? 'md:grid-cols-4';
  return (
    <ol className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${desktopColumnsClass}`}>
      {steps.map((step, index) => (
        <li key={index} className={stepClasses(step)}>
          <span className="font-display text-sm font-semibold">{step.title}</span>
          <span className={`text-xs ${step.gate ? 'text-on-dark-tertiary' : 'text-muted'}`}>{step.note}</span>
        </li>
      ))}
    </ol>
  );
}

function stepClasses(step) {
  const base = 'flex min-w-0 flex-col gap-1 rounded-lg border p-3';
  const tone = step.gate ? 'border-ink bg-ink text-on-dark' : 'border-border bg-surface text-ink';
  const style = step.dashed ? 'border-dashed' : '';
  return [base, tone, style].filter(Boolean).join(' ');
}

/** A `link-diagram` block: `left` and `hub` are `{ title, note }`, `right` is `[{ title, note? }]`. */
export function CaseStudyHubDiagram({ left, edge, hub, right }) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[2fr_auto_1fr_auto_2fr]">
      <DiagramNode title={left.title} note={left.note} />
      <span className="text-center font-mono text-xs text-muted">{edge}</span>
      <DiagramNode title={hub.title} note={hub.note} dark />
      <span className="text-center font-mono text-xs text-muted">{edge}</span>
      <ul className="flex flex-col gap-2">
        {right.map((node) => (
          <li key={node.title}>
            <DiagramNode title={node.title} note={node.note} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiagramNode({ title, note, dark }) {
  return (
    <div className={`rounded-lg border p-4 ${dark ? 'border-ink bg-ink text-on-dark' : 'border-border bg-surface text-ink'}`}>
      <span className="block font-display text-sm font-semibold">{title}</span>
      {note && <span className={`block text-xs ${dark ? 'text-on-dark-tertiary' : 'text-muted'}`}>{note}</span>}
    </div>
  );
}
