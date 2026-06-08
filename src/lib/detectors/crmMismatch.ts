export function detectCrmMismatch(
  rows: any[]
) {
  return rows
    .filter(
      (row) =>
        row.in_crm?.toLowerCase() === "yes" &&
        row.in_stripe?.toLowerCase() === "no"
    )
    .map((row) => ({
      customer: row.company_name,

      leakType: "CRM Mismatch",

      loss: Number(row.monthly_loss_inr),

      issueType: row.issue_type,
    }));
}