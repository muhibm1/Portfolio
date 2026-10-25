import { useEffect, useRef, useState } from 'react';

// Renders an `architecture` case-study block: a system diagram laid out like a drawing (boxes at
// fixed places, joined by arrows) but built from live page text, so it takes the site's type and
// both themes. The drawing is one SVG whose boxes are HTML inside foreignObject, so it scales
// with the column as a whole; Enlarge opens the same drawing at reading size, scrollable on a
// phone. Every word comes from the block in portfolioData.

/**
 * `viewBox` frames the drawing; `labels` are column headings `{ x, y, text }`; `boxes` are
 * `{ x, y, w, h, kind, parts }` where kind is data, code, retrieval, agent, plain or bare; `edges`
 * are `{ d, kind, dashed?, both? }` SVG paths; `edgeLabels` are `{ x, y, text, kind? }`. A box's
 * `parts` are read in order: `{ title, accent? }`, `{ mono }`, `{ text }` (a string, or a list of
 * strings and `{ mono }` runs), `{ pairs }`, `{ section }`, `{ rule: true }`, `{ chips }` and
 * `{ inner: { kind, parts } }`.
 */
export default function CaseStudyArchitecture({ block }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <figure className="arch flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="arch-legend">
          {block.legend.map((item) => (
            <li key={item.kind}>
              <i aria-hidden="true" className={`arch-swatch arch-${item.kind}`} />
              {item.label}
            </li>
          ))}
        </ul>
        <button type="button" className="arch-enlarge" onClick={() => setOpen(true)}>
          {block.enlarge}
        </button>
      </div>
      <div className="arch-card">
        <Drawing block={block} />
      </div>
      {block.note && <figcaption className="text-sm text-muted">{block.note}</figcaption>}

      {open && (
        <div className="arch-overlay" role="dialog" aria-modal="true" aria-label={block.label}>
          <div className="arch-overlay-bar">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">{block.label}</span>
            <button ref={closeRef} type="button" className="arch-enlarge" onClick={() => setOpen(false)}>
              {block.close}
            </button>
          </div>
          <div className="arch-overlay-body">
            <div className="arch-card arch-card-large">
              <Drawing block={block} />
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}

function Drawing({ block }) {
  const [, , vw, vh] = block.viewBox;
  return (
    <svg viewBox={block.viewBox.join(' ')} className="arch-svg" role="group" aria-label={block.label} style={{ aspectRatio: `${vw} / ${vh}` }}>
      <defs>
        {['line', 'retrieval', 'agent', 'code'].map((kind) => (
          <marker key={kind} id={`arch-head-${kind}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" className={`arch-head-${kind}`} />
          </marker>
        ))}
      </defs>
      {block.labels.map((label) => (
        <text key={label.text} x={label.x} y={label.y} className="arch-col">
          {label.text}
        </text>
      ))}
      {block.boxes.map((box) => (
        <foreignObject key={`${box.x}-${box.y}`} x={box.x} y={box.y} width={box.w} height={box.h}>
          <div className={`arch-box arch-${box.kind}`} data-kind={box.kind}>
            <Parts parts={box.parts} />
          </div>
        </foreignObject>
      ))}
      {block.edges.map((edge) => {
        const kind = edge.kind ?? 'line';
        return (
          <path
            key={edge.d}
            d={edge.d}
            className={`arch-edge arch-edge-${kind}${edge.dashed ? ' arch-dashed' : ''}`}
            markerEnd={edge.end === false ? undefined : `url(#arch-head-${kind})`}
            markerStart={edge.both ? `url(#arch-head-${kind})` : undefined}
          />
        );
      })}
      {block.edgeLabels.map((label) => (
        <text key={label.text} x={label.x} y={label.y} className={`arch-edge-label arch-edge-label-${label.kind ?? 'line'}`}>
          {label.text}
        </text>
      ))}
    </svg>
  );
}

function Parts({ parts }) {
  return parts.map((part, index) => <Part key={index} part={part} />);
}

function Part({ part }) {
  if (part.title) {
    return (
      <p className={`arch-title${part.accent ? ' arch-accent' : ''}`}>
        {part.title}
        {part.titleMono && <span className="arch-mono"> {part.titleMono}</span>}
      </p>
    );
  }
  if (part.mono) return <p className="arch-mono">{part.mono}</p>;
  if (part.section) return <p className="arch-section">{part.section}</p>;
  if (part.rule) return <hr className="arch-rule" />;
  if (part.sub) return <p className="arch-sub">{part.sub}</p>;
  if (part.pairs) {
    return (
      <dl className="arch-pairs">
        {part.pairs.map(([term, meaning]) => (
          <div key={term}>
            <dt className="arch-mono">{term}</dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
    );
  }
  if (part.chips) {
    return (
      <ol className="arch-chips">
        {part.chips.map((chip) => (
          <li key={chip.top} className={chip.strong ? 'arch-chip-strong' : undefined}>
            <span className={chip.strong ? 'arch-mono' : undefined}>{chip.top}</span>
            <span>{chip.bottom}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (part.inner) {
    return (
      <div className={`arch-inner arch-inner-${part.inner.kind ?? 'plain'}`}>
        <Parts parts={part.inner.parts} />
      </div>
    );
  }
  const runs = Array.isArray(part.text) ? part.text : [part.text];
  return (
    <p className={`arch-text${part.gap ? ' arch-gap' : ''}`}>
      {runs.map((run, index) =>
        typeof run === 'string' ? run : (
          <span key={index} className="arch-mono">
            {run.mono}
          </span>
        ),
      )}
    </p>
  );
}
