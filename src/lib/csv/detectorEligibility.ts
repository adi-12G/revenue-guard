import {
  detectorFields,
  type FieldDefinition,
} from "./fieldDefinitions";

export type DetectorType =
  | "invoice"
  | "seat"
  | "payment"
  | "crm"
  | "discount"
  | "usage";

export type DetectorEligibility = {
  detector: DetectorType;
  canRun: boolean;
  mapping: Record<string, string>;
  missingFields: string[];
};

/* =========================================================
   MINIMUM REQUIRED FIELDS
========================================================= */

export const detectorRequiredFields: Record<
  DetectorType,
  string[]
> = {
  invoice: [
    "customer",
    "expected",
    "billed",
  ],

  seat: [
    "company_name",
    "actual_seats_used",
    "billed_seats",
    "price_per_seat_inr",
  ],

  payment: [
    "company_name",
    "invoice_amount_inr",
    "failure_reason",
  ],

  crm: [
    "company_name",
    "in_crm",
    "in_stripe",
  ],

  discount: [
    "company_name",
    "still_active",
    "monthly_loss_inr",
  ],

  usage: [
    "company_name",
    "actual_usage",
    "billed_usage",
  ],
};

/* =========================================================
   NORMALIZE HEADER
========================================================= */

function normalize(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/* =========================================================
   FIND MATCHING CSV HEADER
========================================================= */

function findHeaderMatch(
  fieldKey: string,
  field: FieldDefinition,
  headers: string[]
): string | null {
  const normalizedHeaders = headers.map(
    (header) => ({
      original: header,
      normalized: normalize(header),
    })
  );

  const possibleNames = [
    fieldKey,
    field.label,
    ...(field.aliases || []),
  ];

  for (const name of possibleNames) {
    const normalizedName = normalize(name);

    const match = normalizedHeaders.find(
      (header) =>
        header.normalized === normalizedName
    );

    if (match) {
      return match.original;
    }
  }

  return null;
}

/* =========================================================
   GET DETECTOR ELIGIBILITY

   IMPORTANT:

   A detector is eligible when its MINIMUM required
   fields exist in the CSV.

   Extra columns are completely ignored.

========================================================= */

export function getDetectorEligibility(
  headers: string[]
): DetectorEligibility[] {
  console.log(
    "===================================="
  );

  console.log(
    "RAW CSV HEADERS:",
    headers
  );

  console.log(
    "NORMALIZED CSV HEADERS:",
    headers.map(normalize)
  );

  console.log(
    "===================================="
  );

  const detectors =
    Object.keys(
      detectorFields
    ) as DetectorType[];

  return detectors.map(
    (detector): DetectorEligibility => {
      const fields =
        detectorFields[
          detector
        ] as Record<
          string,
          FieldDefinition
        >;

      const requiredFields =
        detectorRequiredFields[
          detector
        ];

      const mapping:
        Record<string, string> = {};

      const missingFields:
        string[] = [];

      /* =====================================================
         MAP EVERY FIELD THAT EXISTS

         This allows optional fields to be mapped when
         available, while not making them mandatory.
      ===================================================== */

      Object.entries(fields).forEach(
        ([fieldKey, field]) => {
          const matchedHeader =
            findHeaderMatch(
              fieldKey,
              field,
              headers
            );

          if (matchedHeader) {
            mapping[fieldKey] =
              matchedHeader;
          }
        }
      );

      /* =====================================================
         CHECK ONLY MINIMUM REQUIRED FIELDS
      ===================================================== */

      for (const fieldKey of requiredFields) {
        if (!mapping[fieldKey]) {
          missingFields.push(
            fieldKey
          );
        }
      }

      const canRun =
        missingFields.length === 0;

      console.log(
        `DETECTOR: ${detector}`
      );

      console.log(
        "Required fields:",
        requiredFields
      );

      console.log(
        "Mapping:",
        mapping
      );

      console.log(
        "Missing required fields:",
        missingFields
      );

      console.log(
        "Can run:",
        canRun
      );

      console.log(
        "------------------------------------"
      );

      return {
        detector,
        canRun,
        mapping,
        missingFields,
      };
    }
  );
}