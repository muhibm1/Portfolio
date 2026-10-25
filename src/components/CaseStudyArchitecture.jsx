// Renders an `architecture` case-study block: a system drawn as live page content in the site's own
// boxes and type, so it follows the theme and the column like every other block. The top row reads
// left to right as stages joined by arrows; the second row holds the parts that sit under them.
// On a phone every column stacks, and the arrows turn downward.

// Literal Tailwind classes per node kind, so the scanner sees them. The retrieval path is the one
// drawn dark, as the sheet this came from drew it in its accent colour.
const KIND_CLASS = {
  data: 'border-dashed border-line bg-transparent text-ink',
  code: 'border-line bg-surface text-ink',
  retrieval: 'border-ink bg-dark text-dark-ink',
  agent: 'border-ink bg-surface text-ink',
  model: 'border-dashed border-ink bg-transparent text-ink',
};

const SWATCH_CLASS = {
  data: 'border-dashed border-line bg-transparent',
  code: 'border-line bg-surface',
  retrieval: 'border-ink bg-dark',
  agent: 'border-ink bg-surface',
  model: 'border-dashed border-ink bg-transparent',
};

// Grid spans for the second row, written out for the same reason.
const SPAN_CLASS = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' };

/**
 * `legend` is `[{ kind, label }]`; `columns` is the top row, `[{ label, nodes }]`; `lower` is the
 * second row, `[{ span, nodes }]` on a six-column grid; `note` closes the figure. A node is
 * `{ kind, title, mono?, lines?, groups?, chips? }`: `lines` are short plain lines, `groups` are
 * `{ label, items }` lists of tool names, and `chips` is a row of steps joined by arrows.
 */
export default function CaseStudyArchitecture({ legend, columns, lower, note, label }) {
  return (
    <figure className="flex flex-col gap-5" aria-label={label}>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        {legend.map((item) => (
          <li key={item.kind} className="flex items-center gap-2">
            <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-[3px] border ${SWATCH_CLASS[item.kind]}`} />
            {item.label}
          </li>
        ))}
      </ul>

      <ol className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_14px_1fr_14px_1fr_14px_1.1fr_14px_1fr]">
        {columns.flatMap((column, index) => {
          const cell = (
            <li key={column.label} className="flex min-w-0 flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{column.label}</span>
              {column.nodes.map((node) => (
                <ArchitectureNode key={node.title} node={node} />
              ))}
            </li>
          );
          if (index === 0) return [cell];
          return [
            <li key={`${column.label}-arrow`} aria-hidden="true" className="flex items-center justify-center font-mono text-xs text-muted">
              <span className="lg:hidden">{'↓'}</span>
              <span className="hidden lg:inline">{'→'}</span>
            </li>,
            cell,
          ];
        })}
      </ol>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-6">
        {lower.map((cell) => (
          <div key={cell.nodes[0].title} className={`flex min-w-0 flex-col gap-2 ${SPAN_CLASS[cell.span] ?? ''}`}>
            {cell.nodes.map((node) => (
              <ArchitectureNode key={node.title} node={node} />
            ))}
          </div>
        ))}
      </div>

      {note && <figcaption className="text-sm text-muted">{note}</figcaption>}
    </figure>
  );
}

function ArchitectureNode({ node }) {
  const dark = node.kind === 'retrieval';
  const soft = dark ? 'text-dark-muted' : 'text-muted';
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 rounded-[10px] border p-3 ${KIND_CLASS[node.kind]}`} data-kind={node.kind}>
      <p className="font-display text-sm font-semibold break-words">{node.title}</p>
      {node.mono && <p className={`font-mono text-[11px] break-words ${soft}`}>{node.mono}</p>}
      {node.lines?.map((line) => (
        <p key={line} className={`text-xs ${soft}`}>
          {line}
        </p>
      ))}
      {node.groups?.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <span className={`font-mono text-[10px] uppercase tracking-widest ${soft}`}>{group.label}</span>
          <span className="font-mono text-[11px] break-words">{group.items.join(' · ')}</span>
        </div>
      ))}
      {node.chips && (
        <ol className="mt-1 flex flex-wrap items-center gap-1.5">
          {node.chips.map((chip, index) => (
            <li key={chip} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className={`font-mono text-xs ${soft}`}>
                  {'→'}
                </span>
              )}
              <span className={`rounded-md border px-2 py-1 font-mono text-[11px] ${dark ? 'border-dark-edge-strong' : 'border-line'}`}>{chip}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
