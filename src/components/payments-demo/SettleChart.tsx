import type { DemoDay } from "@/lib/payments-demo/types";
import { duration } from "@/components/home/PaymentsBand/format";

/** How many days the chart shows, ending at the newest day the API sent. */
export const CHART_DAYS = 14;
const DAY_MS = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The plot's own units. The SVG scales evenly with its width, so the marks keep their shape.
const WIDTH = 280;
const HEIGHT = 110;
const PAD = 8;
const BAR_HEIGHT = 28;
/** Round tops for the time axis, in seconds. */
const STEPS = [5, 10, 15, 30, 60, 120, 180, 300, 600, 900, 1800, 3600];

type Point = { day: string; ms: number | null; settled: number };

const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** "Oct 24", from a UTC day; written out so the server and browser agree. */
export const shortDay = (day: string) => {
  const [, month, date] = day.split("-").map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${date}`;
};

/** The last 14 calendar days up to the newest one sent; a day the API left out has no value. */
export function chartWindow(days: DemoDay[]): Point[] {
  const last = days.at(-1);
  if (!last) return [];
  const byDay = new Map(days.map((day) => [day.day, day]));
  const end = Date.parse(`${last.day}T00:00:00Z`);
  return Array.from({ length: CHART_DAYS }, (_, i) => {
    const day = dayKey(end - (CHART_DAYS - 1 - i) * DAY_MS);
    const found = byDay.get(day);
    return {
      day,
      ms: found?.averageTimeToSettleMs ?? null,
      settled: found?.settled ?? 0,
    };
  });
}

/** Runs of neighbouring days that both have a value; only these are joined by a line. */
export function chartRuns(points: Point[]): number[][] {
  const runs: number[][] = [];
  let run: number[] = [];
  points.forEach((point, i) => {
    if (point.ms === null) {
      if (run.length > 1) runs.push(run);
      run = [];
      return;
    }
    run.push(i);
  });
  if (run.length > 1) runs.push(run);
  return runs;
}

function axisTop(maxMs: number): number {
  const seconds = maxMs / 1000;
  const step = STEPS.find((top) => top >= seconds);
  return (step ?? Math.ceil(seconds / 3600) * 3600) * 1000;
}

const x = (i: number) => ((i + 0.5) * WIDTH) / CHART_DAYS;

const describe = (point: Point) =>
  `${shortDay(point.day)}: ${point.ms === null ? "nothing settled" : `${point.settled} settled, ${duration(point.ms)} on average`}`;

/** Average time to settle per UTC day as dots, with the day's settled count as small bars under it. */
export const SettleChart = ({ days }: { days: DemoDay[] }) => {
  const points = chartWindow(days);
  const values = points.flatMap((point) => (point.ms === null ? [] : [point.ms]));
  const top = axisTop(Math.max(1, ...values));
  const y = (ms: number) => HEIGHT - PAD - (ms / top) * (HEIGHT - 2 * PAD);
  const mostSettled = Math.max(1, ...points.map((point) => point.settled));
  const total = points.reduce((sum, point) => sum + point.settled, 0);

  return (
    <figure className="bg-paper shadow-paper px-4 pt-3.5 pb-3 font-mono">
      <figcaption className="text-muted text-[11px] tracking-[0.08em] uppercase">
        Average time to settle, last {CHART_DAYS} days
      </figcaption>
      <div className="mt-2 grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-2">
        <div aria-hidden="true" className="text-muted flex flex-col justify-between text-right text-[11px] leading-4">
          <span>{duration(top)}</span>
          <span>0 s</span>
        </div>
        <div className="relative">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
            <line
              x1={0}
              x2={WIDTH}
              y1={PAD}
              y2={PAD}
              className="stroke-line"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={0}
              x2={WIDTH}
              y1={HEIGHT - PAD}
              y2={HEIGHT - PAD}
              className="stroke-line"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            {chartRuns(points).map((run) => (
              <polyline
                key={run[0]}
                data-testid="settle-line"
                data-days={run.map((i) => points[i]!.day).join(" ")}
                points={run.map((i) => `${x(i)},${y(points[i]!.ms!)}`).join(" ")}
                fill="none"
                className="stroke-accent"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {points.map((point, i) =>
              point.ms === null ? null : (
                <g key={point.day} data-testid="settle-dot">
                  <title>{describe(point)}</title>
                  <circle cx={x(i)} cy={y(point.ms)} r={9} fill="transparent" />
                  <circle cx={x(i)} cy={y(point.ms)} r={4.5} className="fill-accent stroke-paper" strokeWidth={2} />
                </g>
              ),
            )}
          </svg>
          {!values.length && (
            <p className="text-muted absolute inset-0 grid place-items-center text-center text-[13px]">
              Nothing settled in these {CHART_DAYS} days.
            </p>
          )}
        </div>

        <div aria-hidden="true" className="text-muted self-end text-right text-[11px] leading-4">
          Settled
        </div>
        <svg viewBox={`0 0 ${WIDTH} ${BAR_HEIGHT}`} className="mt-2 block h-auto w-full" aria-hidden="true">
          {points.map((point, i) => {
            const height = point.settled ? Math.max(2, (point.settled / mostSettled) * BAR_HEIGHT) : 0;
            return (
              <g key={point.day}>
                <title>{describe(point)}</title>
                <rect x={x(i) - 5} y={0} width={10} height={BAR_HEIGHT} fill="transparent" />
                {height > 0 && (
                  <rect x={x(i) - 4} y={BAR_HEIGHT - height} width={8} height={height} rx={2} className="fill-muted" />
                )}
              </g>
            );
          })}
        </svg>

        <div />
        <div aria-hidden="true" className="text-muted mt-1 flex justify-between text-[11px] leading-4">
          <span>{points[0] && shortDay(points[0].day)}</span>
          <span>{points.at(-1) && shortDay(points.at(-1)!.day)}</span>
        </div>
      </div>
      <p className="text-muted mt-2 text-[11px] leading-4">
        Days in UTC. {total} settled in all; a day without a dot had none.
      </p>
      {/* A table ignores the sr-only box, so a wrapper hides it. */}
      <div className="sr-only">
        <table>
          <caption>Settled payments and average time to settle per day</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Settled</th>
              <th scope="col">Average time to settle</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.day}>
                <th scope="row">{shortDay(point.day)}</th>
                <td>{point.settled}</td>
                <td>{point.ms === null ? "none" : duration(point.ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
};
