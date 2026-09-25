// Renders a case-study `table` block (ADR 0006): a column header row with `<th scope="col">`, and
// body rows whose `emphasis` flag bolds the row (used for the configuration that shipped).

/** `columns` is `[{ label, numeric? }]`, `rows` is `[{ cells, emphasis? }]`. */
export default function CaseStudyTable({ columns, rows }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-rule">
          {columns.map((column) => (
            <th
              key={column.label}
              scope="col"
              className={`px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-muted ${
                column.numeric ? 'text-right' : 'text-left'
              }`}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowClasses(row)}>
            {row.cells.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={`px-3 py-3 text-sm ${columns[cellIndex]?.numeric ? 'text-right tabular-nums' : 'text-left'}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function rowClasses(row) {
  const base = 'border-b border-border text-body';
  return row.emphasis ? `${base} font-semibold text-ink` : base;
}
