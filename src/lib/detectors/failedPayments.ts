export function detectFailedPayments(rows: any[]) {
  return rows
    .filter(
      (row) =>
        row.follow_up_done?.toLowerCase() === "no"
    )
    .map((row) => {
      const invoiceAmount =
        Number(row.invoice_amount_inr) || 0;

      const daysOutstanding =
        Number(row.days_outstanding) || 0;

      const failureReason =
        row.failure_reason || "Payment failed";

      return {
        customer: row.company_name,

        leakType: "Failed Payment",

        loss: invoiceAmount,

        failureReason,

        daysOutstanding,

        detail:
          `${failureReason} — ${daysOutstanding} days outstanding`,

        suggestedAction:
          daysOutstanding > 30
            ? "Escalate collection and contact customer immediately"
            : "Follow up with customer and retry payment",
      };
    });
}
