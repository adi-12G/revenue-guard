"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value: any) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getStatus(row: any) {
  return row?.status || "Open";
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "Resolved"
      ? "border-[#b7e1ca] bg-[#f1fbf5] text-[#087443]"
      : status === "Under Review"
      ? "border-[#ead49a] bg-[#fffaf0] text-[#8a5a00]"
      : "border-[#dfe3e8] bg-[#f8f9fa] text-[#526174]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   LEAK TYPE BADGE
========================================================= */

function LeakTypeBadge({
  type,
}: {
  type: string;
}) {
  const styles: Record<string, string> = {
    "Seat Overages":
      "border-[#d9d5f8] bg-[#f8f7ff] text-[#635bff]",

    "Failed Payment":
      "border-[#f0d0cc] bg-[#fff8f7] text-[#b42318]",

    "CRM Mismatch":
      "border-[#d6e2f0] bg-[#f4f8fc] text-[#175cd3]",

    "Expired Discount":
      "border-[#eadcae] bg-[#fffcf3] text-[#8a5a00]",

    "Usage Undercounting":
      "border-[#cce8d8] bg-[#f3faf6] text-[#087443]",

    "Invoice Reconciliation":
      "border-[#dfe3e8] bg-[#f8f9fa] text-[#526174]",
  };

  return (
    <span
      className={`inline-flex max-w-[170px] rounded-full border px-2.5 py-1 text-[11px] font-medium leading-4 ${
        styles[type] ||
        "border-[#dfe3e8] bg-[#f8f9fa] text-[#526174]"
      }`}
    >
      {type || "Unknown"}
    </span>
  );
}

/* =========================================================
   EVIDENCE ROW
========================================================= */

function EvidenceRow({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#e7e9ed] px-4 py-3 last:border-b-0">
      <span className="text-[12px] font-medium text-[#8b94a3]">
        {label}
      </span>

      <span className="text-right text-[12px] font-medium text-[#344054]">
        {value ?? "—"}
      </span>
    </div>
  );
}

/* =========================================================
   FINDINGS PAGE
========================================================= */

export default function FindingsPage() {
  const { isSignedIn, user } = useUser();

  const [findings, setFindings] = useState<any[]>([]);

  const [selectedFinding, setSelectedFinding] =
    useState<any | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [recoveryInputs, setRecoveryInputs] =
    useState<Record<string, string>>({});

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  /* =========================================================
     FETCH FINDINGS
  ========================================================= */

  useEffect(() => {
    if (user?.id) {
      fetchFindings();
    }
  }, [user?.id]);

  async function fetchFindings() {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("findings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "FINDINGS FETCH ERROR:",
        error
      );

      setFindings([]);
      return;
    }

    setFindings(data || []);
  }

  /* =========================================================
     KPI DATA
  ========================================================= */

  const totalFindings = findings.length;

  const totalRevenueLeakage =
    findings.reduce(
      (sum, row) =>
        sum +
        Number(row.revenue_loss || 0),
      0
    );

  const leakTypes = [
    ...new Set(
      findings.map(
        (row) => row.leak_type
      )
    ),
  ];

  const resolvedFindings =
    findings.filter(
      (row) =>
        getStatus(row) === "Resolved"
    ).length;

  const underReviewFindings =
    findings.filter(
      (row) =>
        getStatus(row) ===
        "Under Review"
    ).length;

  const openFindings =
    findings.filter(
      (row) =>
        getStatus(row) === "Open"
    ).length;

  const totalRecovered =
    findings.reduce(
      (sum, row) =>
        sum +
        Number(
          row.recovered_amount || 0
        ),
      0
    );

  const outstandingRevenue = Math.max(
    totalRevenueLeakage -
      totalRecovered,
    0
  );

  /* =========================================================
     FILTER FINDINGS
  ========================================================= */

  const filteredFindings =
    findings.filter((row) => {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      const matchesSearch =
        !query ||
        String(
          row.customer || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          row.leak_type || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          row.detail || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          row.suggested_action || ""
        )
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        getStatus(row) ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* =========================================================
     UPDATE FINDING
  ========================================================= */

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
      setUpdateError(null);

      const { data, error } =
        await supabase
          .from("findings")
          .update(updates)
          .eq("id", findingId)
          .select("*")
          .single();

      if (error) {
        throw error;
      }

      setFindings((current) =>
        current.map((finding) =>
          finding.id === findingId
            ? data
            : finding
        )
      );

      setSelectedFinding(
        (current: any | null) =>
          current?.id === findingId
            ? data
            : current
      );
    } catch (error: any) {
      console.error(
        "FINDING UPDATE ERROR:",
        error
      );

      setUpdateError(
        error?.message ||
          "Could not update finding."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =========================================================
     STATUS CHANGE
  ========================================================= */

  async function handleStatusChange(
    row: any,
    status: string
  ) {
    const revenueLoss =
      Number(
        row.revenue_loss || 0
      );

    const recoveredAmount =
      Number(
        row.recovered_amount || 0
      );

    if (
      status === "Resolved" &&
      recoveredAmount < revenueLoss
    ) {
      setUpdateError(
        `Recover ₹${Math.max(
          revenueLoss -
            recoveredAmount,
          0
        ).toLocaleString(
          "en-IN"
        )} more before resolving this finding.`
      );

      return;
    }

    await updateFinding(row.id, {
      status,
      resolved_at:
        status === "Resolved"
          ? new Date().toISOString()
          : null,
    });
  }

  /* =========================================================
     RECOVERY SAVE
  ========================================================= */

  async function handleRecoverySave(
    row: any
  ) {
    const amount = Number(
      recoveryInputs[row.id] ??
        row.recovered_amount ??
        0
    );

    const revenueLoss =
      Number(
        row.revenue_loss || 0
      );

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setUpdateError(
        "Enter a valid recovery amount."
      );

      return;
    }

    if (amount > revenueLoss) {
      setUpdateError(
        "Recovered amount cannot exceed revenue loss."
      );

      return;
    }

    const newStatus =
      amount >= revenueLoss &&
      revenueLoss > 0
        ? "Resolved"
        : amount > 0
        ? "Under Review"
        : "Open";

    await updateFinding(row.id, {
      recovered_amount: amount,
      status: newStatus,
      resolved_at:
        newStatus === "Resolved"
          ? new Date().toISOString()
          : null,
    });

    setRecoveryInputs((current) => {
      const next = {
        ...current,
      };

      delete next[row.id];

      return next;
    });
  }

  /* =========================================================
     SIGN IN SCREEN
  ========================================================= */

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] text-[#172033]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="mb-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3]">
              Revenue Guard
            </p>

            <h1 className="text-[36px] font-semibold tracking-[-0.035em] text-[#0a2540]">
              Findings History
            </h1>

            <p className="mt-2 text-[15px] text-[#667085]">
              Investigate revenue leakage
              detected across your data.
            </p>
          </div>

          <div className="rounded-lg border border-[#dfe3e8] bg-white p-12 text-center shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe3e8] bg-[#f8f9fa] text-[#667085]">
              →
            </div>

            <h2 className="text-[18px] font-semibold text-[#172033]">
              Sign in required
            </h2>

            <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#667085]">
              Please sign in to view your
              findings history.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#172033]">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3]">
              Revenue Guard
            </p>

            <h1 className="text-[34px] font-semibold tracking-[-0.035em] text-[#0a2540]">
              Findings History
            </h1>

            <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667085]">
              Investigate revenue leakage
              detected across your billing,
              payment, CRM and usage data.
            </p>
          </div>

          <div className="rounded-md border border-[#dfe3e8] bg-white px-4 py-2.5 text-[12px] text-[#667085]">
            {findings.length.toLocaleString(
              "en-IN"
            )}{" "}
            total findings
          </div>
        </div>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL FINDINGS */}

          <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#8b94a3]">
              Total findings
            </p>

            <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#0a2540]">
              {totalFindings.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-[12px] text-[#98a0ad]">
              Detected across all analyses
            </p>
          </div>

          {/* REVENUE LEAKAGE */}

          <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#8b94a3]">
              Revenue leakage
            </p>

            <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#b42318]">
              ₹
              {totalRevenueLeakage.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-[12px] text-[#98a0ad]">
              Revenue currently identified at risk
            </p>
          </div>

          {/* RECOVERED */}

          <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#8b94a3]">
              Revenue recovered
            </p>

            <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#087443]">
              ₹
              {totalRecovered.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-[12px] text-[#98a0ad]">
              Amount marked as recovered
            </p>
          </div>

          {/* OUTSTANDING */}

          <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#8b94a3]">
              Outstanding
            </p>

            <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#8a5a00]">
              ₹
              {outstandingRevenue.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-[12px] text-[#98a0ad]">
              Leakage not yet recovered
            </p>
          </div>
        </div>

        {/* =====================================================
            STATUS SUMMARY
        ===================================================== */}

        <div className="mb-8 grid gap-4 md:grid-cols-3">

          <button
            onClick={() =>
              setStatusFilter("Open")
            }
            className={`rounded-lg border p-4 text-left transition ${
              statusFilter === "Open"
                ? "border-[#b9c4d0] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
                : "border-[#dfe3e8] bg-white hover:border-[#c9d0d8]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#667085]">
                Open
              </span>

              <span className="h-2 w-2 rounded-full bg-[#98a0ad]" />
            </div>

            <p className="mt-2 text-[21px] font-semibold text-[#172033]">
              {openFindings}
            </p>
          </button>

          <button
            onClick={() =>
              setStatusFilter(
                "Under Review"
              )
            }
            className={`rounded-lg border p-4 text-left transition ${
              statusFilter ===
              "Under Review"
                ? "border-[#d9c68e] bg-[#fffdf7] shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
                : "border-[#dfe3e8] bg-white hover:border-[#c9d0d8]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#667085]">
                Under review
              </span>

              <span className="h-2 w-2 rounded-full bg-[#d4a72c]" />
            </div>

            <p className="mt-2 text-[21px] font-semibold text-[#172033]">
              {underReviewFindings}
            </p>
          </button>

          <button
            onClick={() =>
              setStatusFilter("Resolved")
            }
            className={`rounded-lg border p-4 text-left transition ${
              statusFilter === "Resolved"
                ? "border-[#b7d9c6] bg-[#f9fdfb] shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
                : "border-[#dfe3e8] bg-white hover:border-[#c9d0d8]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#667085]">
                Resolved
              </span>

              <span className="h-2 w-2 rounded-full bg-[#087443]" />
            </div>

            <p className="mt-2 text-[21px] font-semibold text-[#172033]">
              {resolvedFindings}
            </p>
          </button>
        </div>

        {/* =====================================================
            FINDINGS SECTION
        ===================================================== */}

        <section className="overflow-hidden rounded-lg border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

          {/* SECTION HEADER */}

          <div className="border-b border-[#e7e9ed] px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#172033]">
                  All findings
                </h2>

                <p className="mt-1 text-[12px] text-[#8b94a3]">
                  Review individual leakage
                  findings and inspect their
                  supporting evidence.
                </p>
              </div>

              <div className="text-[12px] text-[#667085]">
                Showing{" "}
                <span className="font-semibold text-[#344054]">
                  {filteredFindings.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#344054]">
                  {findings.length}
                </span>
              </div>
            </div>

            {/* FILTERS */}

            <div className="mt-5 flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search customer, problem or detail..."
                  className="
                    w-full
                    rounded-md
                    border
                    border-[#cfd5dc]
                    bg-white
                    px-4
                    py-3
                    text-[13px]
                    text-[#172033]
                    placeholder:text-[#98a0ad]
                    outline-none
                    transition
                    focus:border-[#0a2540]
                    focus:ring-2
                    focus:ring-[#0a2540]/5
                  "
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="
                  rounded-md
                  border
                  border-[#cfd5dc]
                  bg-white
                  px-4
                  py-3
                  text-[13px]
                  text-[#344054]
                  outline-none
                  transition
                  focus:border-[#0a2540]
                  focus:ring-2
                  focus:ring-[#0a2540]/5
                "
              >
                <option value="All">
                  All statuses
                </option>

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

              {(searchQuery ||
                statusFilter !==
                  "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter(
                      "All"
                    );
                  }}
                  className="
                    rounded-md
                    border
                    border-[#cfd5dc]
                    bg-white
                    px-4
                    py-3
                    text-[12px]
                    font-medium
                    text-[#526174]
                    transition
                    hover:bg-[#f8f9fa]
                  "
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* ERROR */}

            {updateError && (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-[#f0d0cc] bg-[#fff8f7] px-4 py-3 text-[12px] text-[#b42318]">
                <span>
                  {updateError}
                </span>

                <button
                  onClick={() =>
                    setUpdateError(null)
                  }
                  className="text-[16px] hover:text-[#8f1d16]"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* =====================================================
              TABLE
          ===================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse">

              <thead>
                <tr className="border-b border-[#dfe3e8] bg-[#fafbfc]">

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Problem
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Detail
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Revenue loss
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Action
                  </th>

                  <th className="px-5 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Recovery
                  </th>

                  <th className="px-5 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Evidence
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredFindings.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-[14px] font-medium text-[#344054]">
                        No findings found
                      </p>

                      <p className="mt-1 text-[12px] text-[#98a0ad]">
                        Try changing your
                        search or status
                        filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredFindings.map(
                    (row) => {
                      const revenueLoss =
                        Number(
                          row.revenue_loss ||
                            0
                        );

                      const recovered =
                        Number(
                          row.recovered_amount ||
                            0
                        );

                      const outstanding =
                        Math.max(
                          revenueLoss -
                            recovered,
                          0
                        );

                      const status =
                        getStatus(row);

                      const isUpdating =
                        updatingId ===
                        row.id;

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

                          {/* CUSTOMER */}

                          <td className="px-5 py-5 align-top">
                            <p className="max-w-[170px] text-[13px] font-medium text-[#172033]">
                              {row.customer ||
                                "Unknown"}
                            </p>
                          </td>

                          {/* PROBLEM */}

                          <td className="px-5 py-5 align-top">
                            <LeakTypeBadge
                              type={
                                row.leak_type ||
                                "Unknown"
                              }
                            />
                          </td>

                          {/* DETAIL */}

                          <td className="px-5 py-5 align-top">
                            <p className="max-w-[260px] text-[12px] leading-5 text-[#667085]">
                              {row.detail ||
                                "—"}
                            </p>
                          </td>

                          {/* REVENUE LOSS */}

                          <td className="px-5 py-5 text-right align-top">
                            <span className="whitespace-nowrap text-[13px] font-semibold text-[#b42318]">
                              ₹
                              {revenueLoss.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-5 align-top">
                            <p className="max-w-[220px] text-[12px] leading-5 text-[#667085]">
                              {row.suggested_action ||
                                "—"}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5 text-center align-top">
                            <select
                              value={status}
                              disabled={
                                isUpdating
                              }
                              onChange={(
                                e
                              ) =>
                                handleStatusChange(
                                  row,
                                  e.target.value
                                )
                              }
                              className={`
                                min-w-[120px]
                                cursor-pointer
                                rounded-md
                                border
                                bg-white
                                px-3
                                py-2
                                text-[11px]
                                font-medium
                                outline-none
                                transition
                                ${
                                  status ===
                                  "Resolved"
                                    ? "border-[#b7e1ca] bg-[#f4fbf7] text-[#087443]"
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

                              <option
                                value="Resolved"
                                disabled={
                                  recovered <
                                  revenueLoss
                                }
                              >
                                Resolved
                              </option>
                            </select>
                          </td>

                          {/* RECOVERY */}

                          <td className="px-5 py-5 text-right align-top">
                            <div className="flex min-w-[190px] flex-col items-end gap-2">

                              <div className="whitespace-nowrap text-[12px]">
                                <span className="font-semibold text-[#087443]">
                                  ₹
                                  {recovered.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>

                                <span className="mx-1 text-[#c5cad1]">
                                  /
                                </span>

                                <span className="text-[#667085]">
                                  ₹
                                  {revenueLoss.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              </div>

                              <div className="w-full max-w-[180px]">
                                <div className="h-1.5 overflow-hidden rounded-full bg-[#e8ebef]">
                                  <div
                                    className="h-full rounded-full bg-[#087443]"
                                    style={{
                                      width: `${
                                        revenueLoss >
                                        0
                                          ? Math.min(
                                              100,
                                              (recovered /
                                                revenueLoss) *
                                                100
                                            )
                                          : 0
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">

                                <input
                                  type="number"
                                  min="0"
                                  max={
                                    revenueLoss
                                  }
                                  value={
                                    recoveryInputs[
                                      row.id
                                    ] ??
                                    String(
                                      row.recovered_amount ||
                                        0
                                    )
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setRecoveryInputs(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        [row.id]:
                                          e
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  className="
                                    w-24
                                    rounded-md
                                    border
                                    border-[#cfd5dc]
                                    bg-white
                                    px-2.5
                                    py-2
                                    text-right
                                    text-[11px]
                                    text-[#172033]
                                    outline-none
                                    focus:border-[#0a2540]
                                  "
                                  placeholder="Amount"
                                />

                                <button
                                  onClick={() =>
                                    handleRecoverySave(
                                      row
                                    )
                                  }
                                  disabled={
                                    isUpdating
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
                                  {isUpdating
                                    ? "..."
                                    : "Save"}
                                </button>

                              </div>

                              {outstanding >
                                0 && (
                                <span className="text-[10px] text-[#98a0ad]">
                                  ₹
                                  {outstanding.toLocaleString(
                                    "en-IN"
                                  )}{" "}
                                  outstanding
                                </span>
                              )}
                            </div>
                          </td>

                          {/* EVIDENCE */}

                          <td className="px-5 py-5 text-center align-top">
                            <button
                              onClick={() =>
                                setSelectedFinding(
                                  row
                                )
                              }
                              className="
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
                              View
                            </button>
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* =========================================================
          EVIDENCE MODAL
      ========================================================= */}

      {selectedFinding && (
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
            setSelectedFinding(null)
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

            {/* =====================================================
                MODAL HEADER
            ===================================================== */}

            <div className="sticky top-0 z-10 border-b border-[#e7e9ed] bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-5">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3]">
                    Revenue leakage finding
                  </p>

                  <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.025em] text-[#0a2540]">
                    {selectedFinding.customer ||
                      "Unknown customer"}
                  </h2>

                  <div className="mt-2">
                    <LeakTypeBadge
                      type={
                        selectedFinding.leak_type ||
                        "Unknown"
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedFinding(null)
                  }
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
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

            {/* =====================================================
                MODAL CONTENT
            ===================================================== */}

            <div className="px-6 py-6">

              {/* STATUS + RECOVERY */}

              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Status
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      status={getStatus(
                        selectedFinding
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-[#cce8d8] bg-[#f4fbf7] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Recovered
                  </p>

                  <p className="mt-2 text-[19px] font-semibold text-[#087443]">
                    {formatCurrency(
                      selectedFinding.recovered_amount ||
                        0
                    )}
                  </p>
                </div>

                <div className="rounded-md border border-[#f0d0cc] bg-[#fff8f7] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Revenue loss
                  </p>

                  <p className="mt-2 text-[19px] font-semibold text-[#b42318]">
                    {formatCurrency(
                      selectedFinding.revenue_loss
                    )}
                  </p>
                </div>

              </div>

              {/* RESOLVED DATE */}

              {selectedFinding.resolved_at && (
                <p className="mt-3 text-[11px] text-[#98a0ad]">
                  Resolved on{" "}
                  {new Date(
                    selectedFinding.resolved_at
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              )}

              {/* RECOVERY PROGRESS */}

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-[#344054]">
                    Recovery progress
                  </h3>

                  <span className="text-[11px] font-medium text-[#667085]">
                    {Number(
                      selectedFinding.revenue_loss ||
                        0
                    ) > 0
                      ? Math.round(
                          (Number(
                            selectedFinding.recovered_amount ||
                              0
                          ) /
                            Number(
                              selectedFinding.revenue_loss ||
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
                          selectedFinding.revenue_loss ||
                            0
                        ) > 0
                          ? Math.min(
                              100,
                              (Number(
                                selectedFinding.recovered_amount ||
                                  0
                              ) /
                                Number(
                                  selectedFinding.revenue_loss ||
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

              {/* DETECTION DETAIL */}

              <div className="mt-7">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Detection detail
                </h3>

                <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] p-4">
                  <p className="text-[13px] leading-6 text-[#526174]">
                    {selectedFinding.detail ||
                      "No detail available."}
                  </p>
                </div>
              </div>

              {/* REVENUE LOSS */}

              <div className="mt-7">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Revenue impact
                </h3>

                <div className="rounded-md border border-[#f0d0cc] bg-[#fff8f7] p-5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#8b94a3]">
                    Identified revenue loss
                  </p>

                  <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[#b42318]">
                    {formatCurrency(
                      selectedFinding.revenue_loss
                    )}
                  </p>
                </div>
              </div>

              {/* SUGGESTED ACTION */}

              <div className="mt-7">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Suggested action
                </h3>

                <div className="rounded-md border border-[#d9d5f8] bg-[#f8f7ff] p-4">
                  <p className="text-[13px] leading-6 text-[#4b4b63]">
                    {selectedFinding.suggested_action ||
                      "No action available."}
                  </p>
                </div>
              </div>

              {/* =================================================
                  DETECTOR EVIDENCE
              ================================================= */}

              <div className="mt-7">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                  Evidence
                </h3>

                <div className="overflow-hidden rounded-md border border-[#dfe3e8] bg-white">

                  {/* SEAT OVERAGES */}

                  {selectedFinding.leak_type ===
                    "Seat Overages" && (
                    <>
                      <EvidenceRow
                        label="Actual seats"
                        value={
                          selectedFinding
                            .evidence
                            ?.actualSeats
                        }
                      />

                      <EvidenceRow
                        label="Billed seats"
                        value={
                          selectedFinding
                            .evidence
                            ?.billedSeats
                        }
                      />

                      <EvidenceRow
                        label="Extra seats"
                        value={
                          selectedFinding
                            .evidence
                            ?.extraSeats
                        }
                      />

                      <EvidenceRow
                        label="Price per seat"
                        value={formatCurrency(
                          selectedFinding
                            .evidence
                            ?.pricePerSeat
                        )}
                      />
                    </>
                  )}

                  {/* FAILED PAYMENT */}

                  {selectedFinding.leak_type ===
                    "Failed Payment" && (
                    <>
                      <EvidenceRow
                        label="Failure reason"
                        value={
                          selectedFinding
                            .evidence
                            ?.failureReason
                        }
                      />

                      <EvidenceRow
                        label="Days outstanding"
                        value={
                          selectedFinding
                            .evidence
                            ?.daysOutstanding !=
                          null
                            ? `${selectedFinding.evidence.daysOutstanding} days`
                            : "—"
                        }
                      />
                    </>
                  )}

                  {/* CRM MISMATCH */}

                  {selectedFinding.leak_type ===
                    "CRM Mismatch" && (
                    <>
                      <EvidenceRow
                        label="Issue type"
                        value={
                          selectedFinding
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
                    </>
                  )}

                  {/* EXPIRED DISCOUNT */}

                  {selectedFinding.leak_type ===
                    "Expired Discount" && (
                    <>
                      <EvidenceRow
                        label="Discount status"
                        value="Still active"
                      />

                      <EvidenceRow
                        label="Monthly revenue loss"
                        value={formatCurrency(
                          selectedFinding.revenue_loss
                        )}
                      />
                    </>
                  )}

                  {/* USAGE UNDERCOUNTING */}

                  {selectedFinding.leak_type ===
                    "Usage Undercounting" && (
                    <>
                      <EvidenceRow
                        label="Metric"
                        value={
                          selectedFinding
                            .evidence
                            ?.metric
                        }
                      />

                      <EvidenceRow
                        label="Actual usage"
                        value={
                          selectedFinding
                            .evidence
                            ?.actualUsage
                        }
                      />

                      <EvidenceRow
                        label="Billed usage"
                        value={
                          selectedFinding
                            .evidence
                            ?.billedUsage
                        }
                      />

                      <EvidenceRow
                        label="Undercounting"
                        value={
                          selectedFinding
                            .evidence
                            ?.undercountingPercent !=
                          null
                            ? `${selectedFinding.evidence.undercountingPercent}%`
                            : "—"
                        }
                      />
                    </>
                  )}

                  {/* INVOICE RECONCILIATION */}

                  {selectedFinding.leak_type ===
                    "Invoice Reconciliation" && (
                    <>
                      <EvidenceRow
                        label="Expected amount"
                        value={formatCurrency(
                          selectedFinding
                            .evidence
                            ?.expected
                        )}
                      />

                      <EvidenceRow
                        label="Billed amount"
                        value={formatCurrency(
                          selectedFinding
                            .evidence
                            ?.billed
                        )}
                      />

                      <EvidenceRow
                        label="Revenue difference"
                        value={formatCurrency(
                          selectedFinding.revenue_loss
                        )}
                      />
                    </>
                  )}

                  {/* UNKNOWN */}

                  {![
                    "Seat Overages",
                    "Failed Payment",
                    "CRM Mismatch",
                    "Expired Discount",
                    "Usage Undercounting",
                    "Invoice Reconciliation",
                  ].includes(
                    selectedFinding.leak_type
                  ) && (
                    <div className="px-4 py-5 text-[12px] text-[#667085]">
                      No structured evidence
                      available for this
                      finding.
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="border-t border-[#e7e9ed] bg-[#fafbfc] px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    setSelectedFinding(null)
                  }
                  className="
                    rounded-md
                    bg-[#0a2540]
                    px-5
                    py-2.5
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
        </div>
      )}
    </main>
  );
}