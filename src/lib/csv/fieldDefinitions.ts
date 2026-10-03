export type FieldKind =
  | "text"
  | "number"
  | "date"
  | "boolean";

export type FieldDefinition = {
  label: string;
  kind: FieldKind;
  aliases: readonly string[];
};

export const detectorFields = {
  invoice: {
    customer: {
      label: "Customer",
      kind: "text",
      aliases: [
        "customer",
        "customer_name",
        "company",
        "company_name",
        "client",
        "client_name",
        "customer_id",
        "cust_id",
        "client_id",
        "account_id",
        "party_name",
        "party name",
        "party",
      ],
    },

    expected: {
      label: "Expected Amount",
      kind: "number",
      aliases: [
        "expected",
        "expected_amount",
        "expected amount",
        "expected_amount_inr",
        "contract_amount",
        "contracted_amount",
        "contract amount",
        "contracted amount",
      ],
    },

    billed: {
      label: "Billed Amount",
      kind: "number",
      aliases: [
        "billed",
        "billed_amount",
        "billed amount",
        "billed_amount_inr",
        "invoice_amount",
        "invoice_amount_inr",
        "invoice amount",
        "amount_billed",
        "amount",
        "total",
      ],
    },
  },

  seat: {
    company_name: {
      label: "Company / Customer",
      kind: "text",
      aliases: [
        "company_name",
        "company",
        "customer",
        "customer_name",
        "client",
        "client_name",
        "customer_id",
        "cust_id",
        "client_id",
        "account_id",
        "party_name",
        "party name",
        "party",
      ],
    },

    actual_seats_used: {
      label: "Actual Seats Used",
      kind: "number",
      aliases: [
        "actual_seats_used",
        "actual_seats",
        "seats_used",
        "used_seats",
        "active_seats",
        "active_users",
        "users",
        "used users",
        "used seats",
      ],
    },

    billed_seats: {
      label: "Billed / Purchased Seats",
      kind: "number",
      aliases: [
        "billed_seats",
        "seats_billed",
        "contracted_seats",
        "purchased_seats",
        "licensed_seats",
        "seats",
        "purchased seats",
        "contracted seats",
        "licensed seats",
      ],
    },

    price_per_seat_inr: {
      label: "Price Per Seat",
      kind: "number",
      aliases: [
        "price_per_seat_inr",
        "price_per_seat",
        "price per seat",
        "seat_price",
        "price_per_user",
        "rate_per_seat",
        "seat_rate",
        "rate per seat",
        "price per user",
      ],
    },
  },

  payment: {
    company_name: {
      label: "Company / Customer",
      kind: "text",
      aliases: [
        "company_name",
        "company",
        "customer",
        "customer_name",
        "client",
        "client_name",
        "customer_id",
        "cust_id",
        "client_id",
        "account_id",
        "party_name",
        "party name",
        "party",
      ],
    },

    invoice_amount_inr: {
      label: "Invoice Amount",
      kind: "number",
      aliases: [
        "invoice_amount_inr",
        "invoice_amount",
        "invoice amount",
        "amount",
        "amount_due",
        "amount due",
        "billed_amount",
        "billed amount",
        "total",
        "total_amount",
        "total amount",
        "gross_amount",
        "net_amount",
      ],
    },

    follow_up_done: {
      label: "Follow Up Done",
      kind: "boolean",
      aliases: [
        "follow_up_done",
        "follow up done",
        "follow_up",
        "followup_done",
        "payment_follow_up",
        "payment follow up",
        "follow_up_status",
        "follow up status",
      ],
    },

    failure_reason: {
      label: "Failure Reason",
      kind: "text",
      aliases: [
        "failure_reason",
        "failure reason",
        "payment_failure_reason",
        "payment failure reason",
        "reason",
        "failure",
        "payment_status",
        "payment status",
      ],
    },

    days_outstanding: {
      label: "Days Outstanding / Overdue",
      kind: "number",
      aliases: [
        "days_outstanding",
        "days outstanding",
        "outstanding_days",
        "outstanding days",
        "days_due",
        "days due",
        "days_overdue",
        "days overdue",
        "overdue_days",
        "overdue days",
      ],
    },
  },

  crm: {
    company_name: {
      label: "Company / Customer",
      kind: "text",
      aliases: [
        "company_name",
        "company",
        "customer",
        "customer_name",
        "client",
        "client_name",
        "customer_id",
        "cust_id",
        "client_id",
        "account_id",
        "party_name",
        "party name",
        "party",
      ],
    },

    in_crm: {
      label: "In CRM",
      kind: "boolean",
      aliases: [
        "in_crm",
        "in crm",
        "crm",
        "crm_present",
        "crm present",
        "exists_in_crm",
        "exists in crm",
      ],
    },

    in_stripe: {
      label: "In Stripe / Billing",
      kind: "boolean",
      aliases: [
        "in_stripe",
        "in stripe",
        "stripe",
        "stripe_present",
        "stripe present",
        "exists_in_stripe",
        "exists in stripe",
        "in_billing",
        "in billing",
        "billing_present",
      ],
    },

    monthly_loss_inr: {
      label: "Monthly Loss",
      kind: "number",
      aliases: [
        "monthly_loss_inr",
        "monthly_loss",
        "monthly loss",
        "revenue_loss",
        "revenue loss",
        "estimated_loss",
        "estimated loss",
        "loss",
        "amount",
      ],
    },

    issue_type: {
      label: "Issue Type",
      kind: "text",
      aliases: [
        "issue_type",
        "issue type",
        "issue",
        "mismatch_type",
        "mismatch type",
        "problem_type",
        "problem type",
      ],
    },
  },

  discount: {
    company_name: {
      label: "Company / Customer",
      kind: "text",
      aliases: [
        "company_name",
        "company",
        "customer",
        "customer_name",
        "client",
        "client_name",
        "customer_id",
        "cust_id",
        "client_id",
        "account_id",
        "party_name",
        "party name",
        "party",
      ],
    },

    still_active: {
      label: "Discount Still Active",
      kind: "boolean",
      aliases: [
        "still_active",
        "still active",
        "discount_active",
        "discount active",
        "active_discount",
        "active discount",
        "discount_status",
        "discount status",
      ],
    },

    monthly_loss_inr: {
      label: "Monthly Loss",
      kind: "number",
      aliases: [
        "monthly_loss_inr",
        "monthly_loss",
        "monthly loss",
        "revenue_loss",
        "revenue loss",
        "estimated_loss",
        "estimated loss",
        "loss",
        "discount_amount",
        "discount amount",
        "amount",
      ],
    },
  },

  usage: {
    company_name: {
      label: "Company / Customer",
      kind: "text",
      aliases: [
        "company_name",
        "company",
        "customer",
        "customer_name",
        "client",
        "client_name",
        "customer_id",
        "cust_id",
        "client_id",
        "account_id",
        "party_name",
        "party name",
        "party",
      ],
    },

    actual_usage: {
      label: "Actual Usage",
      kind: "number",
      aliases: [
        "actual_usage",
        "usage_actual",
        "actual usage",
        "actual_consumption",
        "actual consumption",
        "actual_units",
        "units_used",
        "used_units",
        "hours_delivered",
        "hours delivered",
        "delivered_hours",
        "delivered hours",
      ],
    },

    billed_usage: {
      label: "Billed Usage",
      kind: "number",
      aliases: [
        "billed_usage",
        "usage_billed",
        "billed usage",
        "charged_usage",
        "charged usage",
        "billed_units",
        "units_billed",
        "billed_hours",
        "hours_billed",
        "hours billed",
      ],
    },

    /* =====================================================
       NEW:
       Allows CSV column:

       Unit Price

       to become:

       row.unit_price_inr

       Used to calculate:

       (Actual Usage - Billed Usage)
       × Unit Price
       ===================================================== */

    unit_price_inr: {
      label: "Unit Price",
      kind: "number",
      aliases: [
        "unit_price_inr",
        "unit_price",
        "unit price",
        "price_per_unit",
        "price per unit",
        "rate_per_unit",
        "rate per unit",
        "price",
        "rate",
      ],
    },

    monthly_loss_inr: {
      label: "Monthly Loss",
      kind: "number",
      aliases: [
        "monthly_loss_inr",
        "monthly_loss",
        "monthly loss",
        "revenue_loss",
        "revenue loss",
        "estimated_loss",
        "estimated loss",
        "loss",
        "amount",
      ],
    },

    metric_name: {
      label: "Metric Name",
      kind: "text",
      aliases: [
        "metric_name",
        "metric name",
        "metric",
        "usage_metric",
        "usage metric",
        "unit",
        "billing_unit",
        "billing unit",
      ],
    },

    undercounting_percent: {
      label: "Undercounting %",
      kind: "number",
      aliases: [
        "undercounting_percent",
        "undercounting %",
        "undercount_percent",
        "undercount %",
        "usage_gap_percent",
        "usage gap percent",
        "difference_percent",
        "difference %",
      ],
    },
  },
} as const;
