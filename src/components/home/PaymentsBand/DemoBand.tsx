import { loadDemoSnapshot } from "@/lib/payments-demo/load";
import { PaymentsBand } from "./PaymentsBand";

export async function DemoBand() {
  return <PaymentsBand snapshot={await loadDemoSnapshot()} />;
}
