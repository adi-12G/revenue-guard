"use client";

import { useState } from "react";

type Props = {
  data: any[];
};

export default function LeakageTable({ data }: Props) {
  const [selectedRow, setSelectedRow] =
    useState<any | null>(null);

  if (!data.length) return null;

  const isDetectorResult = !!data[0]?.leakType;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-[#dfe3e8] bg-white">
        <table className="w-full min-w-[950px] text-left">
          <thead>
            <tr className="border-b border-[#dfe3e8] bg-[#f8f9fb]">
              <th className="px-4 py-4 text-[12px] font-semibold text-[#172033]">
                Customer
              </th>

              {isDetectorResult ? (
                <>
                  <th className="px-4 py-4 text-[12px] font-semibold text-[#172033]">
                    Problem
                  </th>

                  <th className="px-4 py-4 text-[12px] font-semibold text-[#172033]">
                    Detail
                  </th>

                  <th className="px-4 py-4 text-right text-[12px] font-semibold text-[#172033]">
                    Revenue Loss
                  </th>

                  <th className="px-4 py-4 text-[12px] font-semibold text-[#172033]">
                    Suggested Action
                  </th>

                  <th className="px-4 py-4 text-center text-[12px] font-semibold text-[#172033]">
                    Evidence
                  </th>
                </>
              ) : (
                <>
                  <th className="px-4 py-4 text-[12px] font-semibold text-[#172033]">
                    Expected
                  </th>

                  <th className="px-4 py-4 text-[12px] font-semibold text-[#172033]">
                    Billed
                  </th>

                  <th className="px-4 py-4 text-right text-[12px] font-semibold text-[#172033]">
                    Loss
                  </th>

                  <th className="px-4 py-4 text-center text-[12px] font-semibold text-[#172033]">
                    Status
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id ?? index}
                className="
                  border-b
                  border-[#edf0f3]
                  transition
                  last:border-b-0
                  hover:bg-[#fafbfc]
                "
              >
                {/* CUSTOMER */}
                <td className="px-4 py-5 text-[14px] font-medium text-[#0a2540]">
                  {row.customer || "—"}
                </td>

                {isDetectorResult ? (
                  <>
                    {/* PROBLEM */}
                    <td className="px-4 py-5 text-[14px] font-medium text-[#243b53]">
                      {row.leakType || "—"}
                    </td>

                    {/* DETAIL */}
                    <td className="max-w-[300px] px-4 py-5 text-[13px] leading-5 text-[#526174]">
                      {row.detail || "—"}
                    </td>

                    {/* REVENUE LOSS */}
                    <td className="whitespace-nowrap px-4 py-5 text-right text-[14px] font-semibold text-[#0a2540]">
                      ₹
                      {Number(
                        row.loss || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* SUGGESTED ACTION */}
                    <td className="max-w-[320px] px-4 py-5 text-[13px] leading-5 text-[#526174]">
                      {row.suggestedAction || "—"}
                    </td>

                    {/* EVIDENCE */}
                    <td className="px-4 py-5 text-center">
                      <button
                        onClick={() =>
                          setSelectedRow(row)
                        }
                        className="
                          inline-flex
                          min-w-[112px]
                          items-center
                          justify-center
                          rounded-md
                          border
                          border-[#cfd6df]
                          bg-white
                          px-3
                          py-2
                          text-[12px]
                          font-medium
                          text-[#425466]
                          transition
                          hover:border-[#9da8b5]
                          hover:bg-[#f7f8fa]
                          hover:text-[#0a2540]
                        "
                      >
                        View Evidence
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* EXPECTED */}
                    <td className="px-4 py-5 text-[14px] text-[#526174]">
                      ₹
                      {Number(
                        row.expected || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* BILLED */}
                    <td className="px-4 py-5 text-[14px] text-[#526174]">
                      ₹
                      {Number(
                        row.billed || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* LOSS */}
                    <td className="px-4 py-5 text-right text-[14px] font-semibold text-[#0a2540]">
                      ₹
                      {Number(
                        row.loss || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-5 text-center">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          border
                          px-3
                          py-1
                          text-[11px]
                          font-medium
                          ${
                            row.status === "Healthy"
                              ? "border-[#b8e3d0] bg-[#f5fbf8] text-[#087443]"
                              : "border-[#ead8aa] bg-[#fffaf0] text-[#8a5a00]"
                          }
                        `}
                      >
                        {row.status || "Review"}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EVIDENCE MODAL */}
      {selectedRow && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[#0a2540]/30
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setSelectedRow(null)
          }
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              border
              border-[#dfe3e8]
              bg-white
              p-6
              shadow-[0_20px_60px_rgba(10,37,64,0.18)]
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8b94a3]">
                  Evidence
                </p>

                <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-[#0a2540]">
                  {selectedRow.customer || "Finding"}
                </h3>
              </div>

              <button
                onClick={() =>
                  setSelectedRow(null)
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-[#dfe3e8]
                  text-[#667085]
                  transition
                  hover:bg-[#f5f6f8]
                  hover:text-[#172033]
                "
              >
                ×
              </button>
            </div>

            {/* FINDING TYPE */}
            <div className="mt-6 rounded-lg border border-[#e5e9ef] bg-[#f8f9fb] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                Problem
              </p>

              <p className="mt-1 text-[14px] font-semibold text-[#243b53]">
                {selectedRow.leakType || "—"}
              </p>
            </div>

            {/* REVENUE LOSS */}
            <div className="mt-3 rounded-lg border border-[#e5e9ef] bg-white p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                Revenue Loss
              </p>

              <p className="mt-1 text-[22px] font-semibold tracking-[-0.025em] text-[#0a2540]">
                ₹
                {Number(
                  selectedRow.loss || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            {/* DETAIL */}
            <div className="mt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                Detail
              </p>

              <p className="mt-2 text-[14px] leading-6 text-[#526174]">
                {selectedRow.detail || "No additional detail available."}
              </p>
            </div>

            {/* ACTION */}
            {selectedRow.suggestedAction && (
              <div className="mt-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                  Suggested Action
                </p>

                <p className="mt-2 text-[14px] leading-6 text-[#526174]">
                  {selectedRow.suggestedAction}
                </p>
              </div>
            )}

            {/* DETECTOR-SPECIFIC EVIDENCE */}
            {selectedRow.leakType ===
              "Usage Undercounting" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <EvidenceValue
                  label="Actual Usage"
                  value={selectedRow.actualUsage}
                />

                <EvidenceValue
                  label="Billed Usage"
                  value={selectedRow.billedUsage}
                />

                <EvidenceValue
                  label="Undercounted"
                  value={
                    selectedRow.undercountingPercent != null
                      ? `${selectedRow.undercountingPercent}%`
                      : "—"
                  }
                />

                <EvidenceValue
                  label="Metric"
                  value={selectedRow.metric}
                />
              </div>
            )}

            {selectedRow.leakType ===
              "Seat Overages" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <EvidenceValue
                  label="Actual Seats"
                  value={selectedRow.actualSeats}
                />

                <EvidenceValue
                  label="Billed Seats"
                  value={selectedRow.billedSeats}
                />

                <EvidenceValue
                  label="Extra Seats"
                  value={selectedRow.extraSeats}
                />

                <EvidenceValue
                  label="Price / Seat"
                  value={
                    selectedRow.pricePerSeat != null
                      ? `₹${Number(
                          selectedRow.pricePerSeat
                        ).toLocaleString("en-IN")}`
                      : "—"
                  }
                />
              </div>
            )}

            {selectedRow.leakType ===
              "Failed Payment" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <EvidenceValue
                  label="Failure Reason"
                  value={selectedRow.failureReason}
                />

                <EvidenceValue
                  label="Days Outstanding"
                  value={selectedRow.daysOutstanding}
                />
              </div>
            )}

            {selectedRow.leakType ===
              "CRM Mismatch" && (
              <div className="mt-5">
                <EvidenceValue
                  label="Issue Type"
                  value={selectedRow.issueType}
                />
              </div>
            )}

            {/* CLOSE */}
            <button
              onClick={() =>
                setSelectedRow(null)
              }
              className="
                mt-7
                w-full
                rounded-lg
                bg-[#0a2540]
                py-3
                text-[13px]
                font-semibold
                text-white
                transition
                hover:bg-[#163a5c]
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function EvidenceValue({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-lg border border-[#e5e9ef] bg-[#f8f9fb] p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#8b94a3]">
        {label}
      </p>

      <p className="mt-1 text-[13px] font-medium text-[#243b53]">
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : String(value)}
      </p>
    </div>
  );
}