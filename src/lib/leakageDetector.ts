import { Invoice } from "@/types/invoice";

export function detectLeakage(invoice: Invoice) {
  if (invoice.billed === 0) {
    return "Missing Invoice";
  }

  if (invoice.billed < invoice.expected) {
    return "Underbilling";
  }

  if (invoice.billed > invoice.expected) {
    return "Overbilling";
  }

  return "Healthy";
}
