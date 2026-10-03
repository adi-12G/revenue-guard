export function detectUsageUndercounting(
  rows: any[]
) {
  console.log(
    "USAGE DETECTOR ROW SAMPLE:",
    rows[0]
  );

  return rows
    .filter(
      (row) =>
        Number(row.actual_usage) >
        Number(row.billed_usage)
    )
    .map((row) => {
      const actualUsage =
        Number(row.actual_usage) || 0;

      const billedUsage =
        Number(row.billed_usage) || 0;

      const usageGap =
        actualUsage - billedUsage;

      /*
       * Try every common name that the normalized
       * CSV might contain for unit price.
       */
      const unitPrice =
        Number(row.unit_price_inr) ||
        Number(row.unit_price) ||
        Number(row.price_per_unit_inr) ||
        Number(row.price_per_unit) ||
        Number(row.rate_per_unit_inr) ||
        Number(row.rate_per_unit) ||
        0;

      /*
       * If CSV already contains monthly loss,
       * use it.
       *
       * Otherwise calculate:
       *
       * usage gap × unit price
       */
      const monthlyLoss =
        Number(row.monthly_loss_inr) || 0;

      const loss =
        monthlyLoss > 0
          ? monthlyLoss
          : usageGap * unitPrice;

      const undercountingPercent =
        actualUsage > 0
          ? Number(
              (
                (usageGap / actualUsage) *
                100
              ).toFixed(2)
            )
          : 0;

      const metric =
        row.metric_name ||
        "units";

      console.log(
        "USAGE CALCULATION:",
        {
          actualUsage,
          billedUsage,
          usageGap,
          unitPrice,
          monthlyLoss,
          finalLoss: loss,
        }
      );

      return {
        customer:
          row.company_name,

        leakType:
          "Usage Undercounting",

        loss,

        metric,

        actualUsage,

        billedUsage,

        undercountingPercent,

        detail:
          `${actualUsage.toLocaleString(
            "en-IN"
          )} ${metric} used vs ${billedUsage.toLocaleString(
            "en-IN"
          )} billed (${undercountingPercent}% undercounted)`,

        suggestedAction:
          "Review usage metering and update billing to reflect actual consumption",
      };
    });
}
