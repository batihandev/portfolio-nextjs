import type { ReactNode } from "react";
import { formatRange } from "@/lib/dates";
import type { Role } from "@/types";

// One row of a work-history receipt: title, company and dates, then whatever the page shows for it.
export const RoleEntry = ({ role, children }: { role: Role; children: ReactNode }) => (
  <div className="border-line grid gap-x-4 gap-y-1 border-b-[1.5px] border-dashed py-3 last:border-0 sm:grid-cols-[1fr_auto]">
    <b className="font-sans text-base">
      {role.title}
      {role.company && ` · ${role.company}`}
    </b>
    <span className="text-muted whitespace-nowrap">{formatRange(role.start, role.end)}</span>
    <div className="text-muted font-sans text-[15px] sm:col-span-2">{children}</div>
  </div>
);
