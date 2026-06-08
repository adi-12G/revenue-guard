export function detectFailedPayments(
  rows: any[]
) {
  return rows
    .filter(
      (row) =>
        row.follow_up_done?.toLowerCase() === "no"
    )
    .map((row) => ({
      customer: row.company_name,

      leakType: "Failed Payment",

      loss: Number(row.invoice_amount_inr),

      failureReason: row.failure_reason,

      daysOutstanding: Number(
        row.days_outstanding
      ),
    }));
}