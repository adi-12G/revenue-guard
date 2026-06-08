export function detectExpiredDiscounts(
  rows: any[]
) {
  console.log(rows[0]);

  return rows
    .filter(
      (row) =>
        row.still_active?.toLowerCase() === "yes"
    )
    .map((row) => ({
      customer: row.company_name,
      leakType: "Expired Discount",
      loss: Number(row.monthly_loss_inr),
    }));
}