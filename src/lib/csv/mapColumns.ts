import {
  detectorFields,
  type FieldDefinition,
} from "./fieldDefinitions";

export function normalizeHeader(header: string): string {
  return String(header ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function getHeaderMatch(
  headers: string[],
  aliases: readonly string[]
): string | undefined {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);

    const exact = normalizedHeaders.find(
      (header) =>
        header.normalized === normalizedAlias
    );

    if (exact) {
      return exact.original;
    }
  }

  return undefined;
}

export function autoMapColumns(
  headers: string[],
  detector: keyof typeof detectorFields,
  existingMapping: Record<string, string> = {}
) {
  const fields =
    detectorFields[detector] as Record<
      string,
      FieldDefinition
    >;

  const mapping: Record<string, string> = {};

  for (const fieldName of Object.keys(fields)) {
    const savedColumn =
      existingMapping[fieldName];

    if (
      savedColumn &&
      headers.some(
        (header) =>
          normalizeHeader(header) ===
          normalizeHeader(savedColumn)
      )
    ) {
      const actualHeader = headers.find(
        (header) =>
          normalizeHeader(header) ===
          normalizeHeader(savedColumn)
      );

      if (actualHeader) {
        mapping[fieldName] = actualHeader;
        continue;
      }
    }

    const aliases =
      fields[fieldName].aliases;

    const match = getHeaderMatch(
      headers,
      aliases
    );

    if (match) {
      mapping[fieldName] = match;
    }
  }

  return mapping;
}