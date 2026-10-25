// Renders an `architecture` case-study block: named lanes that run left to right through the same
// columns (where data comes from, where it is kept, what works on it, how it is reached). On a
// phone each lane stacks top to bottom, with every column's name above its boxes.

/**
 * `columns` names the stages in order. Each lane is `{ label, cells }`, where `cells[i]` is the
 * list of `{ title, note?, dashed? }` nodes in column i. Nodes in the `engine` column (an index
 * into `columns`) are drawn dark, as the parts that do the work. `note` is one closing line.
 */
export default function CaseStudyArchitecture({ columns, lanes, engine, note, caption }) {
  return (
    <figure className="flex flex-col gap-4">
      <div className="hidden gap-2 px-[13px] font-mono text-xs uppercase tracking-widest text-muted md:grid md:grid-cols-[1fr_16px_1fr_16px_1fr_16px_1fr]">
        {columns.map((column, index) => (
          <span key={column} style={{ gridColumn: index * 2 + 1 }}>
            {column}
          </span>
        ))}
      </div>
      <ol className="flex flex-col gap-5">
        {lanes.map((lane) => (
          <li key={lane.label} className="flex flex-col gap-2 rounded-[12px] border border-line p-3">
            <p className="font-display text-sm font-semibold text-ink">{lane.label}</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_16px_1fr_16px_1fr_16px_1fr] md:items-center">
              {lane.cells.flatMap((nodes, index) => {
                const cell = (
                  <div key={`c${index}`} className="flex flex-col gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted md:hidden">{columns[index]}</span>
                    {nodes.map((node) => (
                      <ArchitectureNode key={node.title} node={node} dark={index === engine} />
                    ))}
                  </div>
                );
                if (index === 0) return [cell];
                return [
                  <span key={`a${index}`} aria-hidden="true" className="text-center font-mono text-xs text-muted">
                    <span className="md:hidden">{'↓'}</span>
                    <span className="hidden md:inline">{'→'}</span>
                  </span>,
                  cell,
                ];
              })}
            </div>
          </li>
        ))}
      </ol>
      {note && <p className="text-sm text-muted">{note}</p>}
      {caption && <figcaption className="font-mono text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

function ArchitectureNode({ node, dark }) {
  const tone = dark ? 'border-ink bg-dark text-dark-ink' : 'border-line bg-surface text-ink';
  const style = node.dashed ? 'border-dashed' : '';
  return (
    <div className={`flex min-w-0 flex-col gap-1 rounded-lg border p-3 ${tone} ${style}`}>
      <span className="font-display text-sm font-semibold break-words">{node.title}</span>
      {node.note && <span className={`text-xs ${dark ? 'text-dark-muted' : 'text-muted'}`}>{node.note}</span>}
    </div>
  );
}
