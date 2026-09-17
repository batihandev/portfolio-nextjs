// Client-only state for the hero receipt: the print time and a visit counter, counted once per browser session.
export type Print = { at: Date; visit: number | null; run: number };

const VISITS_KEY = "visits";
const listeners = new Set<() => void>();
let current: Print | null = null;

const countVisit = () => {
  try {
    const counted = sessionStorage.getItem(VISITS_KEY);
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? 0) + (counted ? 0 : 1);
    localStorage.setItem(VISITS_KEY, String(visits));
    sessionStorage.setItem(VISITS_KEY, "1");
    return visits;
  } catch {
    return null;
  }
};

export const printer = {
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  },
  getSnapshot: () => (current ??= { at: new Date(), visit: countVisit(), run: 0 }),
  getServerSnapshot: (): Print | null => null,
  reset() {
    current = null;
  },
  reprint() {
    if (!current) return;
    current = { ...current, at: new Date(), run: current.run + 1 };
    listeners.forEach((notify) => notify());
  },
};
