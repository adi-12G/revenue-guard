export function detectCrmMismatch(rows: any[]) {
  return rows
    .filter(
      (row) =>
        row.in_crm?.toLowerCase() === "yes" &&
        row.in_stripe?.toLowerCase() === "no"
    )
    .map((row) => {
      const loss =
        Number(row.monthly_loss_inr) || 0;

      const issueType =
        row.issue_type || "Missing in billing";

      return {
        customer: row.company_name,

        leakType: "CRM Mismatch",

        loss,

        issueType,

        detail:
          `${issueType} — CRM record exists but billing record is missing`,

        suggestedAction:
          "Review the CRM account and create or restore the corresponding billing record",
      };
    });
}
