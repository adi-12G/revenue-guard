export function detectExpiredDiscounts(rows: any[]) {
  return rows
    .filter(
      (row) =>
        row.still_active?.toLowerCase() === "yes"
    )
    .map((row) => {
      const loss =
        Number(row.monthly_loss_inr) || 0;

      return {
        customer: row.company_name,

        leakType: "Expired Discount",

        loss,

        detail:
          `Discount is still active and causing approximately ₹${loss.toLocaleString(
            "en-IN"
          )} in monthly revenue leakage`,

        suggestedAction:
          "Review the discount expiration and remove or update the discount",
      };
    });
}
