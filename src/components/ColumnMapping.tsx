"use client";

import { useMemo } from "react";

import type { FieldDefinition } from "@/lib/csv/fieldDefinitions";
import { normalizeRows } from "@/lib/csv/normalizeRows";

import type {
  DetectorEligibility,
  DetectorType,
} from "@/lib/csv/detectorEligibility";

type Props = {
  headers: string[];
  rows: any[];

  mapping: Record<string, string>;

  fields: Record<string, FieldDefinition>;

  detector: DetectorType;

  eligibleDetectors: DetectorEligibility[];

  onDetectorChange: (detector: DetectorType) => void;

  onMappingChange: (field: string, value: string) => void;

  onConfirm: () => void;
  onCancel: () => void;

  isAnalyzing: boolean;

  saveWarning?: string | null;
};

/**
 * Converts the internal detector name into a readable UI label.
 */
function getDetectorLabel(detector: DetectorType): string {
  const value = String(detector);

  const normalized = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[\_-]+/g, " ")
    .trim()
    .toLowerCase();

  const labels: Record<string, string> = {
    invoice: "Invoice Mismatch",

    seat: "Seat Overages",
    seatoverage: "Seat Overages",
    "seat overage": "Seat Overages",

    payment: "Failed Payments",
    failedpayment: "Failed Payments",
    "failed payment": "Failed Payments",
    failedpayments: "Failed Payments",
    "failed payments": "Failed Payments",

    crm: "CRM Mismatch",
    crmmismatch: "CRM Mismatch",
    "crm mismatch": "CRM Mismatch",

    discount: "Expired Discounts",
    expireddiscount: "Expired Discounts",
    "expired discount": "Expired Discounts",
    expireddiscounts: "Expired Discounts",
    "expired discounts": "Expired Discounts",

    usage: "Usage Undercounting",
    usageundercounting: "Usage Undercounting",
    "usage undercounting": "Usage Undercounting",
  };

  return labels[normalized] ?? formatDetectorName(value);
}

/**
 * Fallback formatter for any future detector types.
 */
function formatDetectorName(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ColumnMapping({
  headers,
  rows,
  mapping,
  fields,
  detector,
  eligibleDetectors,
  onDetectorChange,
  onMappingChange,
  onConfirm,
  onCancel,
  isAnalyzing,
  saveWarning,
}: Props) {
  const parsedPreview = useMemo(() => {
    return normalizeRows(
      rows.slice(0, 10),
      mapping,
      detector
    );
  }, [rows, mapping, detector]);

  const currentEligibility = eligibleDetectors.find(
    (item) => item.detector === detector
  );

  const missingFields =
    currentEligibility?.missingFields ?? [];

  const canConfirm =
    missingFields.length === 0 &&
    !isAnalyzing;

  const runnableDetectors =
    eligibleDetectors.filter(
      (item) => item.canRun
    );

  const unavailableDetectors =
    eligibleDetectors.filter(
      (item) => !item.canRun
    );

  return (
    <div
      className="
        mb-8
        rounded-2xl
        border
        border-[#d9dee7]
        bg-white
        p-6
        text-[#0a2540]
        shadow-[0_4px_20px_rgba(10,37,64,0.05)]
      "
    >
      {/* HEADER */}
      <div className="mb-7">
        <h3 className="text-[22px] font-semibold tracking-[-0.025em] text-[#0a2540]">
          Review Your CSV
        </h3>

        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#526174]">
          Revenue Guard checked your file and found the
          detectors it has enough data to run. Review the
          column mappings before analysis.
        </p>
      </div>

      {/* ELIGIBILITY */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">

        {/* CAN RUN */}
        <div
          className="
            rounded-xl
            border
            border-[#b8e3d0]
            bg-[#f5fbf8]
            p-5
          "
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#087443]">
              Based on your file we can run
            </p>

            <span
              className="
                flex
                h-6
                min-w-6
                items-center
                justify-center
                rounded-full
                bg-[#e3f6ec]
                text-[12px]
                font-semibold
                text-[#087443]
              "
            >
              {runnableDetectors.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {runnableDetectors.map((item) => (
              <div
                key={item.detector}
                className="
                  flex
                  items-center
                  gap-2.5
                  text-[14px]
                  font-medium
                  text-[#243b53]
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e3f6ec]
                    text-[12px]
                    font-bold
                    text-[#087443]
                  "
                >
                  ✓
                </span>

                <span>
                  {getDetectorLabel(item.detector)}
                </span>
              </div>
            ))}

            {runnableDetectors.length === 0 && (
              <p className="text-[13px] text-[#7b8794]">
                No detector has all required columns.
              </p>
            )}
          </div>
        </div>

        {/* CAN'T RUN */}
        <div
          className="
            rounded-xl
            border
            border-[#ead8aa]
            bg-[#fffaf0]
            p-5
          "
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#8a5a00]">
              We can&apos;t run
            </p>

            <span
              className="
                flex
                h-6
                min-w-6
                items-center
                justify-center
                rounded-full
                bg-[#fff1cc]
                text-[12px]
                font-semibold
                text-[#8a5a00]
              "
            >
              {unavailableDetectors.length}
            </span>
          </div>

          <div className="space-y-4">
            {unavailableDetectors.map((item) => (
              <div
                key={item.detector}
                className="text-[14px]"
              >
                <p className="font-semibold text-[#243b53]">
                  {getDetectorLabel(item.detector)}
                </p>

                <p className="mt-1 text-[12px] leading-5 text-[#697586]">
                  Missing:{" "}
                  <span className="text-[#526174]">
                    {item.missingFields.join(", ")}
                  </span>
                </p>
              </div>
            ))}

            {unavailableDetectors.length === 0 && (
              <p className="text-[13px] text-[#7b8794]">
                All available detectors have their required fields.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* DETECTOR SELECTOR */}
      <div className="mb-8">
        <label
          className="
            mb-2
            block
            text-[13px]
            font-semibold
            text-[#243b53]
          "
        >
          Choose a check to run
        </label>

        <select
          value={detector}
          onChange={(e) =>
            onDetectorChange(
              e.target.value as DetectorType
            )
          }
          className="
            w-full
            rounded-lg
            border
            border-[#cfd6df]
            bg-white
            px-4
            py-3
            text-[14px]
            font-medium
            text-[#243b53]
            outline-none
            transition
            hover:border-[#aeb8c4]
            focus:border-[#635bff]
            focus:ring-2
            focus:ring-[#635bff]/10
          "
        >
          {runnableDetectors.map((item) => (
            <option
              key={item.detector}
              value={item.detector}
              className="bg-white text-[#243b53]"
            >
              {getDetectorLabel(item.detector)}
            </option>
          ))}
        </select>
      </div>

      {/* MAPPING */}
      <div className="space-y-5">
        {Object.keys(fields).map((field) => {
          const definition = fields[field];

          return (
            <div key={field}>
              <label
                className="
                  mb-2
                  block
                  text-[13px]
                  font-semibold
                  text-[#243b53]
                "
              >
                {definition.label}
              </label>

              <select
                value={mapping[field] || ""}
                onChange={(e) =>
                  onMappingChange(
                    field,
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-[#cfd6df]
                  bg-white
                  px-4
                  py-3
                  text-[14px]
                  text-[#243b53]
                  outline-none
                  transition
                  hover:border-[#aeb8c4]
                  focus:border-[#635bff]
                  focus:ring-2
                  focus:ring-[#635bff]/10
                "
              >
                <option
                  value=""
                  className="bg-white text-[#8a96a3]"
                >
                  Select CSV column
                </option>

                {headers.map((header) => (
                  <option
                    key={header}
                    value={header}
                    className="bg-white text-[#243b53]"
                  >
                    {header}
                  </option>
                ))}
              </select>

              {mapping[field] && (
                <p
                  className="
                    mt-2
                    text-[12px]
                    text-[#087443]
                  "
                >
                  Automatically mapped to:{" "}
                  <span className="font-semibold">
                    {mapping[field]}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* PREVIEW */}
      <div className="mt-9">
        <div className="mb-3">
          <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a2540]">
            Parsed Data Preview
          </h4>

          <p className="mt-1 text-[12px] leading-5 text-[#7b8794]">
            Showing the first{" "}
            {Math.min(
              parsedPreview.length,
              10
            )}{" "}
            rows after parsing.
          </p>
        </div>

        <div
          className="
            overflow-x-auto
            rounded-xl
            border
            border-[#d9dee7]
            bg-white
          "
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="
                  border-b
                  border-[#d9dee7]
                  bg-[#f7f8fa]
                "
              >
                {Object.keys(fields).map(
                  (field) => (
                    <th
                      key={field}
                      className="
                        whitespace-nowrap
                        p-3.5
                        text-left
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.06em]
                        text-[#526174]
                      "
                    >
                      {fields[field].label}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {parsedPreview.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      Object.keys(fields).length
                    }
                    className="
                      p-8
                      text-center
                      text-[13px]
                      text-[#7b8794]
                    "
                  >
                    No preview data available.
                  </td>
                </tr>
              ) : (
                parsedPreview.map(
                  (row, index) => (
                    <tr
                      key={index}
                      className="
                        border-b
                        border-[#edf0f3]
                        transition
                        last:border-b-0
                        hover:bg-[#f9fafb]
                      "
                    >
                      {Object.keys(fields).map(
                        (field) => (
                          <td
                            key={field}
                            className="
                              whitespace-nowrap
                              p-3.5
                              text-[13px]
                              text-[#526174]
                            "
                          >
                            {row[field] === null ||
                            row[field] === undefined ||
                            row[field] === ""
                              ? "—"
                              : String(
                                  row[field]
                                )}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VALIDATION */}
      {missingFields.length > 0 && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-[#f0c5c5]
            bg-[#fff7f7]
            p-4
          "
        >
          <p className="text-[13px] font-semibold text-[#b42318]">
            This check can&apos;t run yet.
          </p>

          <p className="mt-1 text-[13px] text-[#697586]">
            Missing columns:{" "}
            <span className="font-medium text-[#344054]">
              {missingFields.join(", ")}
            </span>
          </p>
        </div>
      )}

      {/* SAVE WARNING */}
      {saveWarning && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-[#ead8aa]
            bg-[#fffaf0]
            p-4
          "
        >
          <p className="text-[13px] text-[#8a5a00]">
            {saveWarning}
          </p>
        </div>
      )}

      {/* BUTTONS */}
      <div className="mt-7 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="
            flex-1
            rounded-lg
            border
            border-[#cfd6df]
            bg-white
            py-3
            text-[14px]
            font-semibold
            text-[#425466]
            transition
            hover:border-[#aeb8c4]
            hover:bg-[#f7f8fa]
            hover:text-[#0a2540]
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className="
            flex-1
            rounded-lg
            bg-[#0a2540]
            py-3
            text-[14px]
            font-semibold
            text-white
            transition
            hover:bg-[#163a5c]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isAnalyzing
            ? "Analyzing..."
            : "Confirm & Analyze"}
        </button>
      </div>
    </div>
  );
}