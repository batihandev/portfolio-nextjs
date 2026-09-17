const MODULE = 4;
const QUIET = 4;

// Black on white whatever the theme, since cameras struggle with inverted codes.
export const QrCode = ({ rows }: { rows: string[] }) => {
  const size = rows.length + QUIET * 2;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      style={{ width: size * MODULE, height: size * MODULE }}
      className="mx-auto mt-3.5 block bg-white fill-black"
      role="img"
      aria-label="QR code"
    >
      {rows.flatMap((row, y) =>
        Array.from(row.matchAll(/1+/g), (run) => (
          <rect key={`${y}-${run.index}`} x={run.index + QUIET} y={y + QUIET} width={run[0].length} height="1" />
        )),
      )}
    </svg>
  );
};
