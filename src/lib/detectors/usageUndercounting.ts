export function detectUsageUndercounting(
  rows: any[]
) {
  return rows
    .filter(
      (row) =>
        Number(row.actual_usage) >
        Number(row.billed_usage)
    )
    .map((row) => ({
      customer: row.company_name,

      leakType: "Usage Undercounting",

      loss: Number(row.monthly_loss_inr),

      metric: row.metric_name,

      undercountingPercent: Number(
        row.undercounting_percent
      ),
    }));
}
