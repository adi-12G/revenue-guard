import { detectorFields } from "./fieldDefinitions";
import { parseNumber, parseDate } from "./parseCsvValue";

type DetectorType = keyof typeof detectorFields;

function getFieldDefinition(
  canonicalField: string,
  detector?: DetectorType
) {
  // If detector is known, search only inside that detector
  if (detector) {
    const fields = detectorFields[detector];

    const field = Object.entries(fields).find(
      ([key]) => key === canonicalField
    );

    return field?.[1];
  }

  // Otherwise search across all detectors
  for (const fields of Object.values(detectorFields)) {
    const field = Object.entries(fields).find(
      ([key]) => key === canonicalField
    );

    if (field) {
      return field[1];
    }
  }

  return undefined;
}

export function normalizeRows(
  rows: Record<string, any>[],
  mapping: Record<string, string>,
  detector?: DetectorType
) {
  return rows.map((row) => {
    const normalized: Record<string, any> = {};

    for (const canonicalField of Object.keys(mapping)) {
      const originalColumn = mapping[canonicalField];
      const rawValue = row[originalColumn];

      const field = getFieldDefinition(canonicalField, detector);

      if (!field) {
        normalized[canonicalField] =
          typeof rawValue === "string"
            ? rawValue.trim()
            : rawValue;

        continue;
      }

      switch (field.kind) {
        case "number":
          normalized[canonicalField] = parseNumber(rawValue);
          break;

        case "date":
          normalized[canonicalField] = parseDate(rawValue);
          break;

        case "boolean":
          normalized[canonicalField] =
            typeof rawValue === "string"
              ? rawValue.trim().toLowerCase()
              : rawValue;
          break;

        case "text":
        default:
          normalized[canonicalField] =
            typeof rawValue === "string"
              ? rawValue.trim()
              : rawValue;
      }
    }

    return normalized;
  });
}