"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FindingsTable from "@/components/FindingsTable";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  /* =====================================================
     STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     FETCH FINDINGS
  ===================================================== */

  useEffect(() => {
    if (user?.id) {
      fetchFindings();
    }
  }, [user?.id]);

  async function fetchFindings() {
    if (!user?.id) return;

    try {
      setLoading(true);

      console.log("User ID:", user.id);

      /* =====================================================
         1. FIND LATEST ANALYSIS RUN
      ===================================================== */

      const {
        data: latestFinding,
        error: latestError,
      } = await supabase
        .from("findings")
        .select("run_id")
        .eq("user_id", user.id)
        .not("run_id", "is", null)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        console.error(
          "LATEST RUN ERROR:",
          latestError
        );

        setFindings([]);
        return;
      }

      if (!latestFinding?.run_id) {
        console.log(
          "No analysis runs found."
        );

        setFindings([]);
        return;
      }

      console.log(
        "LATEST RUN ID:",
        latestFinding.run_id
      );

      /* =====================================================
         2. FETCH ONLY LATEST RUN FINDINGS
      ===================================================== */

      const {
        data,
        error,
      } = await supabase
        .from("findings")
        .select("*")
        .eq("user_id", user.id)
        .eq(
          "run_id",
          latestFinding.run_id
        )
        .order("id", {
          ascending: false,
        });

      if (error) {
        console.error(
          "FETCH FINDINGS ERROR:",
          error
        );

        setFindings([]);
        return;
      }

      console.log(
        "LATEST RUN FINDINGS:",
        data
      );

      setFindings(data || []);
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      setFindings([]);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     BASIC METRICS
  ===================================================== */

  const totalFindings =
    findings.length;

  const totalRevenueLost =
    findings.reduce(
      (sum, row) =>
        sum +
        Number(
          row.revenue_loss || 0
        ),
      0
    );

  /* =====================================================
     RECOVERY METRICS
  ===================================================== */

  const totalRecovered =
    findings.reduce(
      (sum, row) =>
        sum +
        Number(
          row.recovered_amount || 0
        ),
      0
    );

  const outstandingRevenue =
    Math.max(
      totalRevenueLost -
        totalRecovered,
      0
    );

  const recoveryRate =
    totalRevenueLost > 0
      ? (totalRecovered /
          totalRevenueLost) *
        100
      : 0;

  /* =====================================================
     STATUS COUNTS
  ===================================================== */

  const openFindings =
    findings.filter(
      (finding) =>
        (finding.status || "Open") ===
        "Open"
    ).length;

  const underReviewFindings =
    findings.filter(
      (finding) =>
        (finding.status || "Open") ===
        "Under Review"
    ).length;

  const resolvedFindings =
    findings.filter(
      (finding) =>
        (finding.status || "Open") ===
        "Resolved"
    ).length;

  /* =====================================================
     AFFECTED ACCOUNTS
  ===================================================== */

  const affectedAccounts =
    new Set(
      findings
        .map(
          (finding) =>
            finding.customer
        )
        .filter(Boolean)
    ).size;

  /* =====================================================
     LEAK TYPES
  ===================================================== */

  const leakTypes =
    new Set(
      findings
        .map(
          (finding) =>
            finding.leak_type
        )
        .filter(Boolean)
    ).size;

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredFindings =
    findings.filter((finding) => {
      const customer =
        String(
          finding.customer || ""
        ).toLowerCase();

      const leakType =
        String(
          finding.leak_type || ""
        ).toLowerCase();

      const detail =
        String(
          finding.detail || ""
        ).toLowerCase();

      const query =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        !query ||
        customer.includes(query) ||
        leakType.includes(query) ||
        detail.includes(query);

      const matchesLeakType =
        filter === "All" ||
        finding.leak_type ===
          filter;

      const matchesStatus =
        statusFilter === "All" ||
        (finding.status ||
          "Open") ===
          statusFilter;

      return (
        matchesSearch &&
        matchesLeakType &&
        matchesStatus
      );
    });

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] text-[#172033]">
        <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
          <div className="mb-8">
            <div className="h-9 w-80 animate-pulse rounded-md bg-[#e8ebef]" />
            <div className="mt-3 h-4 w-[420px] animate-pulse rounded bg-[#e8ebef]" />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-lg border border-[#dfe3e8] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#172033]">
      <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8 lg:py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#dfe3e8] pb-7 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#8b94a3]">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-[#526174]">
                Dashboard
              </span>
            </div>

            <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-[#0a2540] sm:text-[36px]">
              Revenue intelligence
            </h1>

            <p className="mt-2 max-w-[650px] text-[14px] leading-6 text-[#667085]">
              Monitor billing leakage, revenue recovery,
              and customer-level risk from your latest analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-[#dfe3e8] bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#2e9b68]" />

            <span className="text-[11px] font-medium text-[#526174]">
              Latest analysis
            </span>
          </div>
        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_190px_170px]">

          {/* SEARCH */}

          <div className="relative">
            <input
              type="text"
              placeholder="Search customer, leak type or detail..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                h-11
                w-full
                rounded-md
                border
                border-[#dfe3e8]
                bg-white
                px-4
                text-[13px]
                text-[#172033]
                outline-none
                placeholder:text-[#98a0ad]
                transition
                focus:border-[#9aa5b3]
                focus:ring-2
                focus:ring-[#0a2540]/5
              "
            />
          </div>

          {/* LEAK TYPE */}

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="
              h-11
              rounded-md
              border
              border-[#dfe3e8]
              bg-white
              px-3
              text-[13px]
              font-medium
              text-[#344054]
              outline-none
              transition
              focus:border-[#9aa5b3]
            "
          >
            <option value="All">
              All Leak Types
            </option>

            <option value="Seat Overages">
              Seat Overages
            </option>

            <option value="Failed Payment">
              Failed Payment
            </option>

            <option value="CRM Mismatch">
              CRM Mismatch
            </option>

            <option value="Expired Discount">
              Expired Discount
            </option>

            <option value="Usage Undercounting">
              Usage Undercounting
            </option>

            <option value="Invoice Reconciliation">
              Invoice Reconciliation
            </option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="
              h-11
              rounded-md
              border
              border-[#dfe3e8]
              bg-white
              px-3
              text-[13px]
              font-medium
              text-[#344054]
              outline-none
              transition
              focus:border-[#9aa5b3]
            "
          >
            <option value="All">
              All Statuses
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
        </div>

        {/* =================================================
            PRIMARY KPI CARDS
        ================================================= */}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

          {/* REVENUE AT RISK */}

          <DashboardMetric
            label="Revenue at risk"
            value={`₹${totalRevenueLost.toLocaleString(
              "en-IN"
            )}`}
            description="Total detected leakage"
            valueClass="text-[#b42318]"
          />

          {/* RECOVERED */}

          <DashboardMetric
            label="Revenue recovered"
            value={`₹${totalRecovered.toLocaleString(
              "en-IN"
            )}`}
            description="Money recovered from detected leaks"
            valueClass="text-[#087443]"
          />

          {/* OUTSTANDING */}

          <DashboardMetric
            label="Outstanding revenue"
            value={`₹${outstandingRevenue.toLocaleString(
              "en-IN"
            )}`}
            description="Remaining recoverable amount"
            valueClass="text-[#8a5a00]"
          />

          {/* RECOVERY RATE */}

          <DashboardMetric
            label="Recovery rate"
            value={`${recoveryRate.toFixed(
              1
            )}%`}
            description="Recovered / revenue at risk"
            valueClass="text-[#635bff]"
          />
        </div>

        {/* =================================================
            SECONDARY METRICS
        ================================================= */}

        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">

          <DashboardMetric
            label="Total findings"
            value={totalFindings.toLocaleString(
              "en-IN"
            )}
            description="Detected leakage records"
            valueClass="text-[#0a2540]"
          />

          <DashboardMetric
            label="Open"
            value={openFindings.toLocaleString(
              "en-IN"
            )}
            description="Findings requiring action"
            valueClass="text-[#b42318]"
          />

          <DashboardMetric
            label="Under review"
            value={underReviewFindings.toLocaleString(
              "en-IN"
            )}
            description="Currently being investigated"
            valueClass="text-[#8a5a00]"
          />

          <DashboardMetric
            label="Resolved"
            value={resolvedFindings.toLocaleString(
              "en-IN"
            )}
            description="Findings marked recovered"
            valueClass="text-[#087443]"
          />
        </div>

        {/* =================================================
            ACCOUNT + LEAK TYPE SUMMARY
        ================================================= */}

        <div className="mt-3 grid gap-3 md:grid-cols-2">

          <DashboardMetric
            label="Affected accounts"
            value={affectedAccounts.toLocaleString(
              "en-IN"
            )}
            description="Unique customers with detected leakage"
            valueClass="text-[#0a2540]"
          />

          <DashboardMetric
            label="Leak types"
            value={leakTypes.toLocaleString(
              "en-IN"
            )}
            description="Detection categories in latest analysis"
            valueClass="text-[#635bff]"
          />
        </div>

        {/* =================================================
            FINDINGS TABLE
        ================================================= */}

        <div className="mt-8 overflow-hidden rounded-lg border border-[#dfe3e8] bg-white">

          {/* TABLE HEADER */}

          <div className="border-b border-[#e7e9ed] px-5 py-5 lg:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-[15px] font-semibold text-[#0a2540]">
                  Revenue leakage findings
                </h2>

                <p className="mt-1 text-[12px] text-[#8b94a3]">
                  Billing and revenue issues detected in the latest analysis.
                </p>
              </div>

              <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] px-3 py-2 text-[11px] font-medium text-[#526174]">
                Showing{" "}
                <span className="text-[#0a2540]">
                  {filteredFindings.length}
                </span>{" "}
                of{" "}
                <span className="text-[#0a2540]">
                  {findings.length}
                </span>
              </div>
            </div>
          </div>

          {/* TABLE */}

          <div className="p-4 lg:p-5">
            {filteredFindings.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#dfe3e8] bg-[#fbfcfd] px-6 py-14 text-center">
                <h3 className="text-[14px] font-semibold text-[#344054]">
                  No findings found
                </h3>

                <p className="mt-1 text-[12px] text-[#8b94a3]">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <FindingsTable
                data={filteredFindings}
              />
            )}
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-[#dfe3e8] pt-5 text-[10px] text-[#98a0ad] sm:flex-row">
          <span>
            Revenue Guard · Revenue intelligence
          </span>

          <span>
            Your existing data. Clearer revenue decisions.
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function DashboardMetric({
  label,
  value,
  description,
  valueClass,
}: {
  label: string;
  value: string | number;
  description: string;
  valueClass: string;
}) {
  return (
    <div
      className="
        min-h-[142px]
        rounded-lg
        border
        border-[#dfe3e8]
        bg-white
        px-5
        py-5
        transition
        hover:border-[#cbd2da]
      "
    >
      <p className="text-[11px] font-medium text-[#667085]">
        {label}
      </p>

      <p
        className={`
          mt-3
          text-[28px]
          font-semibold
          tracking-[-0.035em]
          ${valueClass}
        `}
      >
        {value}
      </p>

      <p className="mt-2 text-[10px] leading-4 text-[#98a0ad]">
        {description}
      </p>
    </div>
  );
}