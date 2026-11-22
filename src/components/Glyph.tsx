/* Typographic frames for projects without a photo: an authored figure that
   shows what the project does instead of a stock picture. */

export function Glyph({ kind }: { kind: string }) {
  if (kind === 'count') return <PillCount />;
  if (kind === 'ledger') return <Ledger />;
  return <div className="glyph" />;
}

function PillCount() {
  // A deterministic scatter of "pills"; detected ones get a box and a count.
  const pills = [
    [38, 40, 0], [92, 30, 22], [150, 52, -14], [212, 34, 40], [262, 58, 8],
    [60, 98, 60], [118, 108, -30], [178, 96, 12], [238, 112, -48],
    [36, 150, 18], [96, 160, -8], [160, 152, 34], [222, 160, -20], [276, 146, 70],
  ];
  return (
    <svg className="glyph" viewBox="0 0 300 200" role="img" aria-label="Pills on a tray, each one boxed and numbered by a detector">
      <rect width="300" height="200" fill="currentColor" opacity="0" />
      {pills.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <rect x="-15" y="-7" width="30" height="14" rx="7" fill="none" stroke="#1b1816" strokeWidth="1.6" />
          <line x1="0" y1="-7" x2="0" y2="7" stroke="#1b1816" strokeWidth="1.2" />
        </g>
      ))}
      {pills.map(([x, y], i) => (
        <g key={`b${i}`}>
          <rect x={x - 21} y={y - 15} width="42" height="30" fill="none" stroke="#c2321b" strokeWidth="1.2" strokeDasharray={i % 5 === 3 ? '3 3' : undefined} />
          <text x={x - 20} y={y - 18} fontSize="9" fontFamily="Martian Mono Variable, monospace" fill="#c2321b">
            {i + 1}
          </text>
        </g>
      ))}
      <text x="292" y="194" textAnchor="end" fontSize="11" fontFamily="Martian Mono Variable, monospace" fill="#1b1816">
        COUNT = 14
      </text>
    </svg>
  );
}

function Ledger() {
  const rows = [
    ['Rent', 'all 3', '−'],
    ['Internet', 'R · M', '−'],
    ['Groceries', 'all 3', '−'],
    ['Gas bill', 'M · S', '−'],
  ];
  return (
    <svg className="glyph" viewBox="0 0 300 200" role="img" aria-label="A shared-expense ledger settling who owes whom">
      <g fontFamily="Archivo Variable, sans-serif" fill="#1b1816">
        <text x="22" y="34" fontSize="13" fontWeight="700">Shared bills</text>
        {rows.map(([a, b], i) => (
          <g key={a} transform={`translate(0 ${58 + i * 24})`}>
            <text x="22" y="0" fontSize="11.5">{a}</text>
            <text x="130" y="0" fontSize="10" opacity="0.7">{b}</text>
            <line x1="22" y1="8" x2="278" y2="8" stroke="#1b1816" strokeOpacity="0.2" />
          </g>
        ))}
        <text x="22" y="172" fontSize="12" fontWeight="700">Settle up</text>
      </g>
      <g fill="none" stroke="#c2321b" strokeWidth="1.6" strokeLinecap="round">
        <path d="M104 168 C140 150 186 150 222 166" />
        <path d="M214 160 L223 167 L213 172" />
      </g>
      <text x="230" y="172" fontSize="11" fontFamily="Martian Mono Variable, monospace" fill="#c2321b">S → R</text>
    </svg>
  );
}
