"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  data: any[];
};

export default function FindingsTable({ data }: Props) {
  const [selectedRow, setSelectedRow] =
    useState<any | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [editingRecoveryId, setEditingRecoveryId] =
    useState<string | null>(null);

  const [recoveryInput, setRecoveryInput] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  if (!data.length) {
    return (
      <div className="py-12 text-center text-sm text-[#8b94a3]">
        No findings found.
      </div>
    );
  }

  /* =====================================================
     UPDATE FINDING
  ===================================================== */

  async function updateFinding(
    findingId: string,
    updates: {
      status?: string;
      recovered_amount?: number;
      resolved_at?: string | null;
    }
  ) {
    try {
      setUpdatingId(findingId);
      setError(null);

      const { error: updateError } =
        await supabase
          .from("findings")
          .update(updates)
          .eq("id", findingId);

      if (updateError) {
        console.error(
          "Finding update error:",
          updateError
        );

        throw updateError;
      }

      window.location.reload();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while updating this finding."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =====================================================
     STATUS CHANGE
  ===================================================== */

  async function handleStatusChange(
    row: any,
    status: string
  ) {
    const resolvedAt =
      status === "Resolved"
        ? new Date().toISOString()
        : null;

    await updateFinding(row.id, {
      status,
      resolved_at: resolvedAt,
    });
  }

  /* =====================================================
     SAVE RECOVERY
  ===================================================== */

  async function saveRecovery(row: any) {
    const amount = Number(recoveryInput);

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      setError(
        "Please enter a valid recovery amount."
      );
      return;
    }

    if (
      amount >
      Number(row.revenue_loss || 0)
    ) {
      setError(
        "Recovered amount cannot be greater than the revenue loss."
      );
      return;
    }

    const newStatus =
      amount >=
      Number(row.revenue_loss || 0)
        ? "Resolved"
        : amount > 0
        ? "Under Review"
        : row.status || "Open";

    const resolvedAt =
      newStatus === "Resolved"
        ? new Date().toISOString()
        : null;

    await updateFinding(row.id, {
      recovered_amount: amount,
      status: newStatus,
      resolved_at: resolvedAt,
    });
  }

  return (
    <>
      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-[#f1c4c0] bg-[#fff7f6] px-4 py-3 text-[13px] text-[#b42318]">
          <span>{error}</span>

          <button
            onClick={() => setError(null)}
            className="text-[#b42318] hover:text-[#8f1d16]"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="border-b border-[#dfe3e8] bg-[#fafbfc]">
              <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Customer
              </th>

              <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Problem
              </th>

              <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Detail
              </th>

              <th className="px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Revenue Loss
              </th>

              <th className="px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Recovered
              </th>

              <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Status
              </th>

              <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Suggested Action
              </th>

              <th className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                Evidence
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const status =
                row.status || "Open";

              const revenueLoss =
                Number(
                  row.revenue_loss || 0
                );

              const recoveredAmount =
                Number(
                  row.recovered_amount || 0
                );

              const outstandingAmount =
                Math.max(
                  revenueLoss -
                    recoveredAmount,
                  0
                );

              const isUpdating =
                updatingId === row.id;

              return (
                <tr
                  key={row.id}
                  className="
                    border-b
                    border-[#e7e9ed]
                    bg-white
                    transition
                    hover:bg-[#fafbfc]
                  "
                >
                  {/* =================================================
                      CUSTOMER
                  ================================================= */}

                  <td className="px-4 py-5 align-top">
                    <div className="max-w-[180px]">
                      <p className="text-[13px] font-medium text-[#172033]">
                        {row.customer || "Unknown customer"}
                      </p>
                    </div>
                  </td>

                  {/* =================================================
                      PROBLEM
                  ================================================= */}

                  <td className="px-4 py-5 align-top">
                    <LeakTypeBadge
                      type={
                        row.leak_type ||
                        "Unknown"
                      }
                    />
                  </td>

                  {/* =================================================
                      DETAIL
                  ================================================= */}

                  <td className="px-4 py-5 align-top">
                    <p className="max-w-[260px] text-[12px] leading-5 text-[#667085]">
                      {row.detail || "—"}
                    </p>
                  </td>

                  {/* =================================================
                      REVENUE LOSS
                  ================================================= */}

                  <td className="px-4 py-5 text-right align-top">
                    <span className="whitespace-nowrap text-[13px] font-semibold text-[#b42318]">
                      ₹
                      {revenueLoss.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </td>

                  {/* =================================================
                      RECOVERED
                  ================================================= */}

                  <td className="px-4 py-5 text-right align-top">
                    {editingRecoveryId ===
                    row.id ? (
                      <div className="flex min-w-[190px] flex-col items-end gap-2">
                        <input
                          type="number"
                          min="0"
                          max={revenueLoss}
                          value={
                            recoveryInput
                          }
                          onChange={(e) =>
                            setRecoveryInput(
                              e.target.value
                            )
                          }
                          placeholder="0"
                          className="
                            w-32
                            rounded-md
                            border
                            border-[#cfd5dc]
                            bg-white
                            px-3
                            py-2
                            text-right
                            text-[12px]
                            text-[#172033]
                            outline-none
                            transition
                            focus:border-[#0a2540]
                            focus:ring-2
                            focus:ring-[#0a2540]/5
                          "
                        />

                        <div className="flex gap-2">
                          <button
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              saveRecovery(
                                row
                              )
                            }
                            className="
                              rounded-md
                              bg-[#0a2540]
                              px-3
                              py-2
                              text-[11px]
                              font-semibold
                              text-white
                              transition
                              hover:bg-[#12385c]
                              disabled:opacity-50
                            "
                          >
                            Save
                          </button>

                          <button
                            disabled={
                              isUpdating
                            }
                            onClick={() => {
                              setEditingRecoveryId(
                                null
                              );
                              setRecoveryInput(
                                ""
                              );
                              setError(null);
                            }}
                            className="
                              rounded-md
                              border
                              border-[#dfe3e8]
                              bg-white
                              px-3
                              py-2
                              text-[11px]
                              font-medium
                              text-[#526174]
                              transition
                              hover:bg-[#f5f6f8]
                            "
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingRecoveryId(
                            row.id
                          );

                          setRecoveryInput(
                            String(
                              recoveredAmount
                            )
                          );

                          setError(null);
                        }}
                        className="
                          whitespace-nowrap
                          text-[13px]
                          font-medium
                          text-[#087443]
                          transition
                          hover:text-[#065c35]
                          hover:underline
                        "
                      >
                        ₹
                        {recoveredAmount.toLocaleString(
                          "en-IN"
                        )}
                      </button>
                    )}
                  </td>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <td className="px-4 py-5 text-center align-top">
                    <select
                      value={status}
                      disabled={isUpdating}
                      onChange={(e) =>
                        handleStatusChange(
                          row,
                          e.target.value
                        )
                      }
                      className={`
                        min-w-[125px]
                        cursor-pointer
                        rounded-md
                        border
                        px-3
                        py-2
                        text-[11px]
                        font-medium
                        outline-none
                        transition
                        ${
                          status ===
                          "Resolved"
                            ? "border-[#b7e1ca] bg-[#f1fbf5] text-[#087443]"
                            : status ===
                              "Under Review"
                            ? "border-[#ead49a] bg-[#fffaf0] text-[#8a5a00]"
                            : "border-[#dfe3e8] bg-[#fafbfc] text-[#526174]"
                        }
                      `}
                    >
                      <option value="Open">
                        Open
                      </option>

                      <option value="Under Review">
                        Under Review
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>
                    </select>
                  </td>

                  {/* =================================================
                      SUGGESTED ACTION
                  ================================================= */}

                  <td className="px-4 py-5 align-top">
                    <p className="max-w-[260px] text-[12px] leading-5 text-[#667085]">
                      {row.suggested_action ||
                        "—"}
                    </p>
                  </td>

                  {/* =================================================
                      EVIDENCE
                  ================================================= */}

                  <td className="px-4 py-5 text-center align-top">
                    <button
                      onClick={() =>
                        setSelectedRow(row)
                      }
                      className="
                        whitespace-nowrap
                        rounded-md
                        border
                        border-[#cfd5dc]
                        bg-white
                        px-3
                        py-2
                        text-[11px]
                        font-medium
                        text-[#344054]
                        transition
                        hover:border-[#9aa5b3]
                        hover:bg-[#f8f9fa]
                      "
                    >
                      View evidence
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          EVIDENCE MODAL
      ===================================================== */}

      {selectedRow && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[#0a2540]/25
            p-4
            backdrop-blur-[2px]
          "
          onClick={() =>
            setSelectedRow(null)
          }
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-lg
              border
              border-[#dfe3e8]
              bg-white
              shadow-[0_20px_60px_rgba(16,24,40,0.18)]
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="sticky top-0 z-10 border-b border-[#e7e9ed] bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3]">
                    Revenue leakage finding
                  </p>

                  <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.025em] text-[#0a2540]">
                    {selectedRow.leak_type ||
                      "Finding"}
                  </h2>

                  <p className="mt-1 text-[13px] text-[#667085]">
                    {selectedRow.customer ||
                      "Unknown customer"}
                  </p>
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
                    text-[18px]
                    text-[#667085]
                    transition
                    hover:bg-[#f5f6f8]
                    hover:text-[#172033]
                  "
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-6">

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="grid gap-3 sm:grid-cols-3">

                {/* LOSS */}

                <div className="rounded-md border border-[#f0d0cc] bg-[#fff8f7] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Revenue loss
                  </p>

                  <p className="mt-2 text-[21px] font-semibold tracking-[-0.025em] text-[#b42318]">
                    ₹
                    {Number(
                      selectedRow.revenue_loss ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* RECOVERED */}

                <div className="rounded-md border border-[#cce8d8] bg-[#f4fbf7] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Recovered
                  </p>

                  <p className="mt-2 text-[21px] font-semibold tracking-[-0.025em] text-[#087443]">
                    ₹
                    {Number(
                      selectedRow.recovered_amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* OUTSTANDING */}

                <div className="rounded-md border border-[#eadcae] bg-[#fffcf3] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Outstanding
                  </p>

                  <p className="mt-2 text-[21px] font-semibold tracking-[-0.025em] text-[#8a5a00]">
                    ₹
                    {Math.max(
                      Number(
                        selectedRow.revenue_loss ||
                          0
                      ) -
                        Number(
                          selectedRow.recovered_amount ||
                            0
                        ),
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              <div className="mt-5 rounded-md border border-[#dfe3e8] bg-[#fafbfc] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12px] font-medium text-[#667085]">
                    Current status
                  </span>

                  <StatusBadge
                    status={
                      selectedRow.status ||
                      "Open"
                    }
                  />
                </div>

                {selectedRow.resolved_at && (
                  <p className="mt-2 text-[11px] text-[#98a0ad]">
                    Resolved on{" "}
                    {new Date(
                      selectedRow.resolved_at
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                )}
              </div>

              {/* =================================================
                  RECOVERY PROGRESS
              ================================================= */}

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-[#344054]">
                    Recovery progress
                  </h3>

                  <span className="text-[11px] font-medium text-[#667085]">
                    {Number(
                      selectedRow.revenue_loss ||
                        0
                    ) > 0
                      ? Math.round(
                          (Number(
                            selectedRow.recovered_amount ||
                              0
                          ) /
                            Number(
                              selectedRow.revenue_loss ||
                                0
                            )) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#e8ebef]">
                  <div
                    className="h-full rounded-full bg-[#087443] transition-all"
                    style={{
                      width: `${
                        Number(
                          selectedRow.revenue_loss ||
                            0
                        ) > 0
                          ? Math.min(
                              100,
                              (Number(
                                selectedRow.recovered_amount ||
                                  0
                              ) /
                                Number(
                                  selectedRow.revenue_loss ||
                                    0
                                )) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* =================================================
                  LEAK TYPE
              ================================================= */}

              <div className="mt-6">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Detection type
                </h3>

                <LeakTypeBadge
                  type={
                    selectedRow.leak_type ||
                    "Unknown"
                  }
                />
              </div>

              {/* =================================================
                  DETAIL
              ================================================= */}

              <div className="mt-6">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Detection detail
                </h3>

                <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] p-4">
                  <p className="text-[13px] leading-6 text-[#526174]">
                    {selectedRow.detail ||
                      "No detail available."}
                  </p>
                </div>
              </div>

              {/* =================================================
                  EVIDENCE
              ================================================= */}

              <div className="mt-6">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Evidence
                </h3>

                <div className="overflow-hidden rounded-md border border-[#dfe3e8]">

                  {/* SEAT OVERAGES */}

                  {selectedRow.leak_type ===
                    "Seat Overages" && (
                    <div>
                      <EvidenceRow
                        label="Seats used"
                        value={
                          selectedRow
                            .evidence
                            ?.actualSeats
                        }
                      />

                      <EvidenceRow
                        label="Seats billed"
                        value={
                          selectedRow
                            .evidence
                            ?.billedSeats
                        }
                      />

                      <EvidenceRow
                        label="Extra seats"
                        value={
                          selectedRow
                            .evidence
                            ?.extraSeats
                        }
                      />

                      <EvidenceRow
                        label="Price per seat"
                        value={
                          selectedRow
                            .evidence
                            ?.pricePerSeat !=
                          null
                            ? `₹${Number(
                                selectedRow
                                  .evidence
                                  .pricePerSeat
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "—"
                        }
                      />
                    </div>
                  )}

                  {/* FAILED PAYMENT */}

                  {selectedRow.leak_type ===
                    "Failed Payment" && (
                    <div>
                      <EvidenceRow
                        label="Failure reason"
                        value={
                          selectedRow
                            .evidence
                            ?.failureReason
                        }
                      />

                      <EvidenceRow
                        label="Days outstanding"
                        value={
                          selectedRow
                            .evidence
                            ?.daysOutstanding !=
                          null
                            ? `${selectedRow.evidence.daysOutstanding} days`
                            : "—"
                        }
                      />
                    </div>
                  )}

                  {/* CRM MISMATCH */}

                  {selectedRow.leak_type ===
                    "CRM Mismatch" && (
                    <div>
                      <EvidenceRow
                        label="Issue type"
                        value={
                          selectedRow
                            .evidence
                            ?.issueType
                        }
                      />

                      <EvidenceRow
                        label="CRM"
                        value="Present"
                      />

                      <EvidenceRow
                        label="Billing"
                        value="Missing"
                      />
                    </div>
                  )}

                  {/* EXPIRED DISCOUNT */}

                  {selectedRow.leak_type ===
                    "Expired Discount" && (
                    <div>
                      <EvidenceRow
                        label="Discount status"
                        value="Still Active"
                      />

                      <EvidenceRow
                        label="Monthly revenue impact"
                        value={`₹${Number(
                          selectedRow.revenue_loss ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}`}
                      />
                    </div>
                  )}

                  {/* USAGE UNDERCOUNTING */}

                  {selectedRow.leak_type ===
                    "Usage Undercounting" && (
                    <div>
                      <EvidenceRow
                        label="Metric"
                        value={
                          selectedRow
                            .evidence
                            ?.metric
                        }
                      />

                      <EvidenceRow
                        label="Actual usage"
                        value={
                          selectedRow
                            .evidence
                            ?.actualUsage
                        }
                      />

                      <EvidenceRow
                        label="Billed usage"
                        value={
                          selectedRow
                            .evidence
                            ?.billedUsage
                        }
                      />

                      <EvidenceRow
                        label="Undercounting"
                        value={
                          selectedRow
                            .evidence
                            ?.undercountingPercent !=
                          null
                            ? `${selectedRow.evidence.undercountingPercent}%`
                            : "—"
                        }
                      />
                    </div>
                  )}

                  {/* INVOICE RECONCILIATION */}

                  {selectedRow.leak_type ===
                    "Invoice Reconciliation" && (
                    <div>
                      <EvidenceRow
                        label="Expected amount"
                        value={
                          selectedRow
                            .evidence
                            ?.expected !=
                          null
                            ? `₹${Number(
                                selectedRow
                                  .evidence
                                  .expected
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "—"
                        }
                      />

                      <EvidenceRow
                        label="Billed amount"
                        value={
                          selectedRow
                            .evidence
                            ?.billed !=
                          null
                            ? `₹${Number(
                                selectedRow
                                  .evidence
                                  .billed
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "—"
                        }
                      />
                    </div>
                  )}

                  {/* FALLBACK */}

                  {![
                    "Seat Overages",
                    "Failed Payment",
                    "CRM Mismatch",
                    "Expired Discount",
                    "Usage Undercounting",
                    "Invoice Reconciliation",
                  ].includes(
                    selectedRow.leak_type
                  ) && (
                    <div className="px-4 py-4 text-[12px] text-[#667085]">
                      No detector-specific
                      evidence available.
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  SUGGESTED ACTION
              ================================================= */}

              <div className="mt-6">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Suggested action
                </h3>

                <div className="rounded-md border border-[#d9d5f8] bg-[#f8f7ff] p-4">
                  <p className="text-[13px] leading-6 text-[#4b4b63]">
                    {selectedRow.suggested_action ||
                      "No suggested action available."}
                  </p>
                </div>
              </div>

              {/* =================================================
                  CLOSE
              ================================================= */}

              <button
                onClick={() =>
                  setSelectedRow(null)
                }
                className="
                  mt-7
                  w-full
                  rounded-md
                  bg-[#0a2540]
                  py-3
                  text-[12px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#12385c]
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =====================================================
   LEAK TYPE BADGE
===================================================== */

function LeakTypeBadge({
  type,
}: {
  type: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    "Seat Overages":
      "border-[#ddd8f8] bg-[#f8f7ff] text-[#635bff]",

    "Failed Payment":
      "border-[#f0d0cc] bg-[#fff8f7] text-[#b42318]",

    "CRM Mismatch":
      "border-[#d6e2f0] bg-[#f4f8fc] text-[#175cd3]",

    "Expired Discount":
      "border-[#eadcae] bg-[#fffcf3] text-[#8a5a00]",

    "Usage Undercounting":
      "border-[#d5e4dc] bg-[#f3faf6] text-[#087443]",

    "Invoice Reconciliation":
      "border-[#dfe3e8] bg-[#f8f9fa] text-[#526174]",
  };

  return (
    <span
      className={`
        inline-flex
        max-w-[150px]
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-medium
        leading-4
        ${
          styles[type] ||
          "border-[#dfe3e8] bg-[#f8f9fa] text-[#526174]"
        }
      `}
    >
      {type}
    </span>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style =
    status === "Resolved"
      ? "border-[#b7e1ca] bg-[#f1fbf5] text-[#087443]"
      : status === "Under Review"
      ? "border-[#ead49a] bg-[#fffaf0] text-[#8a5a00]"
      : "border-[#dfe3e8] bg-[#fafbfc] text-[#526174]";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${style}
      `}
    >
      {status}
    </span>
  );
}

/* =====================================================
   EVIDENCE ROW
===================================================== */

function EvidenceRow({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#e7e9ed] px-4 py-3 last:border-b-0">
      <span className="text-[11px] font-medium text-[#8b94a3]">
        {label}
      </span>

      <span className="text-right text-[12px] font-medium text-[#344054]">
        {value ?? "—"}
      </span>
    </div>
  );
}