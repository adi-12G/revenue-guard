"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeakageChart from "@/components/LeakageChart";
import { useUser } from "@clerk/nextjs";

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   REPORT PAGE
========================================================= */

export default function ReportsPage() {
  const [findings, setFindings] = useState<any[]>([]);
  const [analysisRuns, setAnalysisRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isLoaded } = useUser();

  /* =========================================================
     FETCH REPORT + ANALYSIS HISTORY
  ========================================================= */

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchReports();
    }
  }, [isLoaded, user?.id]);

  async function fetchReports() {
    if (!user?.id) return;

    setLoading(true);

    try {
      /* =====================================================
         1. GET ANALYSIS HISTORY
      ===================================================== */

      const {
        data: runs,
        error: runsError,
      } = await supabase
        .from("analysis_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (runsError) {
        console.error(
          "ANALYSIS HISTORY ERROR:",
          runsError
        );
      } else {
        setAnalysisRuns(runs || []);
      }

      /* =====================================================
         2. FIND LATEST ANALYSIS RUN
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

      /* =====================================================
         NO FINDINGS
      ===================================================== */

      if (!latestFinding?.run_id) {
        setFindings([]);
        return;
      }

      /* =====================================================
         3. LOAD ONLY LATEST RUN FINDINGS
      ===================================================== */

      const {
        data,
        error,
      } = await supabase
        .from("findings")
        .select("*")
        .eq("user_id", user.id)
        .eq("run_id", latestFinding.run_id)
        .order("id", {
          ascending: false,
        });

      if (error) {
        console.error(
          "FETCH REPORT FINDINGS ERROR:",
          error
        );

        setFindings([]);
        return;
      }

      setFindings(data || []);
    } catch (error) {
      console.error(
        "REPORT FETCH ERROR:",
        error
      );

      setFindings([]);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     REPORT CALCULATIONS
  ========================================================= */

  const totalLeakage = useMemo(() => {
    return findings.reduce(
      (sum, row) =>
        sum + Number(row.revenue_loss || 0),
      0
    );
  }, [findings]);

  const totalRecovered = useMemo(() => {
    return findings.reduce(
      (sum, row) =>
        sum + Number(row.recovered_amount || 0),
      0
    );
  }, [findings]);

  const outstandingRevenue = Math.max(
    totalLeakage - totalRecovered,
    0
  );

  const recoveryRate =
    totalLeakage > 0
      ? (totalRecovered / totalLeakage) * 100
      : 0;

  const resolvedFindings = findings.filter(
    (row) =>
      (row.status || "Open") ===
      "Resolved"
  ).length;

  /* =========================================================
     LEAK TYPE TOTALS
  ========================================================= */

  const leakTypeTotals = useMemo(() => {
    return findings.reduce(
      (
        acc: Record<string, number>,
        row
      ) => {
        const type =
          row.leak_type || "Unknown";

        acc[type] =
          (acc[type] || 0) +
          Number(row.revenue_loss || 0);

        return acc;
      },
      {}
    );
  }, [findings]);

  /* =========================================================
     CUSTOMER TOTALS
  ========================================================= */

  const customerTotals = useMemo(() => {
    return findings.reduce(
      (
        acc: Record<string, number>,
        row
      ) => {
        const customer =
          row.customer || "Unknown";

        acc[customer] =
          (acc[customer] || 0) +
          Number(row.revenue_loss || 0);

        return acc;
      },
      {}
    );
  }, [findings]);

  const topCustomers = useMemo(() => {
    return Object.entries(
      customerTotals
    )
      .sort(
        ([, a], [, b]) =>
          b - a
      )
      .slice(0, 5)
      .map(
        ([customer, loss]) => ({
          customer,
          revenue_loss: loss,
        })
      );
  }, [customerTotals]);

  /* =========================================================
     CHART DATA
  ========================================================= */

  const chartData = useMemo(() => {
    return Object.entries(
      leakTypeTotals
    ).map(
      ([type, amount]) => ({
        type,
        loss: amount,
      })
    );
  }, [leakTypeTotals]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fa] text-[#0a2540]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-[#dfe3e8] border-t-[#0a2540]" />

            <p className="text-[13px] text-[#667085]">
              Loading revenue report...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f6f8fa] text-[#172033]">

      <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-7 lg:px-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-9">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3]">
                Revenue Guard
              </p>

              <h1 className="text-[36px] font-semibold tracking-[-0.04em] text-[#0a2540]">
                Revenue Leakage Report
              </h1>

              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#667085]">
                Analyze revenue leakage, identify
                the highest-impact issues and track
                recovery across your latest analysis.
              </p>

            </div>

            {findings.length > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-[#cce8d8] bg-[#f4fbf7] px-3.5 py-2.5 text-[12px] font-medium text-[#087443]">

                <span className="h-1.5 w-1.5 rounded-full bg-[#087443]" />

                Latest analysis loaded

              </div>
            )}

          </div>

        </header>


        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {findings.length === 0 ? (

          <section className="rounded-lg border border-[#dfe3e8] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#dfe3e8] bg-[#f8f9fa] text-[#667085]">
              —
            </div>

            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#172033]">
              No analysis available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#667085]">
              Upload a CSV and run an analysis
              to generate your first revenue
              leakage report.
            </p>

          </section>

        ) : (

          <>

            {/* =================================================
                PRIMARY KPI STRIP
            ================================================= */}

            <section className="mb-6 grid gap-px overflow-hidden rounded-lg border border-[#dfe3e8] bg-[#dfe3e8] shadow-[0_1px_2px_rgba(16,24,40,0.03)] md:grid-cols-2 xl:grid-cols-4">

              {/* REVENUE AT RISK */}

              <div className="bg-white p-5 sm:p-6">

                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                  Revenue at risk
                </p>

                <p className="mt-3 text-[29px] font-semibold tracking-[-0.035em] text-[#b42318]">
                  {formatMoney(
                    totalLeakage
                  )}
                </p>

                <p className="mt-1 text-[12px] text-[#98a0ad]">
                  Identified in latest analysis
                </p>

              </div>


              {/* FINDINGS */}

              <div className="bg-white p-5 sm:p-6">

                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                  Total findings
                </p>

                <p className="mt-3 text-[29px] font-semibold tracking-[-0.035em] text-[#0a2540]">
                  {findings.length.toLocaleString(
                    "en-IN"
                  )}
                </p>

                <p className="mt-1 text-[12px] text-[#98a0ad]">
                  Revenue leakage findings
                </p>

              </div>


              {/* LEAK TYPES */}

              <div className="bg-white p-5 sm:p-6">

                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                  Leak types
                </p>

                <p className="mt-3 text-[29px] font-semibold tracking-[-0.035em] text-[#635bff]">
                  {
                    Object.keys(
                      leakTypeTotals
                    ).length
                  }
                </p>

                <p className="mt-1 text-[12px] text-[#98a0ad]">
                  Detection categories triggered
                </p>

              </div>


              {/* CUSTOMERS */}

              <div className="bg-white p-5 sm:p-6">

                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                  Affected customers
                </p>

                <p className="mt-3 text-[29px] font-semibold tracking-[-0.035em] text-[#0a2540]">
                  {
                    new Set(
                      findings.map(
                        (finding) =>
                          finding.customer
                      )
                    ).size
                  }
                </p>

                <p className="mt-1 text-[12px] text-[#98a0ad]">
                  Unique customer accounts
                </p>

              </div>

            </section>


            {/* =================================================
                RECOVERY METRICS
            ================================================= */}

            <section className="mb-8 grid gap-4 md:grid-cols-3">

              {/* RECOVERED */}

              <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

                <div className="flex items-center justify-between">

                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                    Revenue recovered
                  </p>

                  <span className="text-[11px] font-medium text-[#087443]">
                    Recovery
                  </span>

                </div>

                <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#087443]">
                  {formatMoney(
                    totalRecovered
                  )}
                </p>

                <p className="mt-1 text-[12px] text-[#98a0ad]">
                  Amount marked as recovered
                </p>

              </div>


              {/* OUTSTANDING */}

              <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

                <div className="flex items-center justify-between">

                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                    Outstanding
                  </p>

                  <span className="text-[11px] font-medium text-[#8a5a00]">
                    Remaining
                  </span>

                </div>

                <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#8a5a00]">
                  {formatMoney(
                    outstandingRevenue
                  )}
                </p>

                <p className="mt-1 text-[12px] text-[#98a0ad]">
                  Leakage not yet recovered
                </p>

              </div>


              {/* RECOVERY RATE */}

              <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

                <div className="flex items-center justify-between">

                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8b94a3]">
                    Recovery rate
                  </p>

                  <span className="text-[11px] font-medium text-[#667085]">
                    {resolvedFindings} resolved
                  </span>

                </div>

                <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#635bff]">
                  {recoveryRate.toFixed(2)}%
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8ebef]">

                  <div
                    className="h-full rounded-full bg-[#635bff]"
                    style={{
                      width: `${Math.min(
                        100,
                        recoveryRate
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                CHART + BREAKDOWN
            ================================================= */}

            <section className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(330px,1fr)]">

              {/* CHART */}

              <div className="overflow-hidden rounded-lg border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

                <div className="border-b border-[#e7e9ed] px-5 py-5 sm:px-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#172033]">
                        Leakage by type
                      </h2>

                      <p className="mt-1 text-[12px] text-[#8b94a3]">
                        Revenue impact across detection
                        categories.
                      </p>

                    </div>

                    <span className="text-[11px] text-[#98a0ad]">
                      Latest run
                    </span>

                  </div>

                </div>

                <div className="h-[340px] p-5 sm:p-6">

                  <LeakageChart
                    data={chartData}
                  />

                </div>

              </div>


              {/* BREAKDOWN */}

              <div className="overflow-hidden rounded-lg border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

                <div className="border-b border-[#e7e9ed] px-5 py-5">

                  <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#172033]">
                    Revenue breakdown
                  </h2>

                  <p className="mt-1 text-[12px] text-[#8b94a3]">
                    Leakage grouped by problem type.
                  </p>

                </div>

                <div className="px-5">

                  {Object.entries(
                    leakTypeTotals
                  ).length === 0 ? (

                    <div className="py-12 text-center text-[12px] text-[#98a0ad]">
                      No leakage categories found.
                    </div>

                  ) : (

                    Object.entries(
                      leakTypeTotals
                    )
                      .sort(
                        ([, a], [, b]) =>
                          b - a
                      )
                      .map(
                        (
                          [type, amount],
                          index
                        ) => {

                          const percentage =
                            totalLeakage > 0
                              ? (Number(
                                  amount
                                ) /
                                  totalLeakage) *
                                100
                              : 0;

                          return (
                            <div
                              key={type}
                              className="border-b border-[#e7e9ed] py-4 last:border-b-0"
                            >

                              <div className="flex items-center justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[10px] font-semibold text-[#667085]">
                                    {index + 1}
                                  </span>

                                  <span className="truncate text-[12px] font-medium text-[#344054]">
                                    {type}
                                  </span>

                                </div>

                                <span className="whitespace-nowrap text-[12px] font-semibold text-[#b42318]">
                                  {formatMoney(
                                    amount
                                  )}
                                </span>

                              </div>

                              <div className="mt-3 flex items-center gap-3">

                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#edf0f2]">

                                  <div
                                    className="h-full rounded-full bg-[#b42318]"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        percentage
                                      )}%`,
                                    }}
                                  />

                                </div>

                                <span className="w-12 text-right text-[10px] text-[#98a0ad]">
                                  {percentage.toFixed(
                                    1
                                  )}
                                  %
                                </span>

                              </div>

                            </div>
                          );
                        }
                      )

                  )}

                </div>

              </div>

            </section>


            {/* =================================================
                TOP CUSTOMERS
            ================================================= */}

            <section className="mb-8 overflow-hidden rounded-lg border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

              <div className="border-b border-[#e7e9ed] px-5 py-5 sm:px-6">

                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

                  <div>

                    <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#172033]">
                      Top customers by revenue loss
                    </h2>

                    <p className="mt-1 text-[12px] text-[#8b94a3]">
                      Customers contributing the most
                      leakage in the latest analysis.
                    </p>

                  </div>

                  <span className="text-[11px] text-[#98a0ad]">
                    Top 5 accounts
                  </span>

                </div>

              </div>


              <div className="overflow-x-auto">

                <table className="w-full min-w-[600px] border-collapse">

                  <thead>

                    <tr className="border-b border-[#e7e9ed] bg-[#fafbfc]">

                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                        Customer
                      </th>

                      <th className="px-6 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                        Revenue loss
                      </th>

                      <th className="px-6 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                        Share
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {topCustomers.length === 0 ? (

                      <tr>

                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-[12px] text-[#98a0ad]"
                        >
                          No customer leakage found.
                        </td>

                      </tr>

                    ) : (

                      topCustomers.map(
                        (
                          customer,
                          index
                        ) => {

                          const share =
                            totalLeakage > 0
                              ? (Number(
                                  customer.revenue_loss
                                ) /
                                  totalLeakage) *
                                100
                              : 0;

                          return (
                            <tr
                              key={
                                customer.customer +
                                index
                              }
                              className="border-b border-[#e7e9ed] transition last:border-b-0 hover:bg-[#fafbfc]"
                            >

                              <td className="px-6 py-4">

                                <div className="flex items-center gap-3">

                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-[10px] font-semibold text-[#667085]">
                                    {index + 1}
                                  </span>

                                  <span className="text-[13px] font-medium text-[#172033]">
                                    {customer.customer}
                                  </span>

                                </div>

                              </td>


                              <td className="px-6 py-4 text-right">

                                <span className="text-[13px] font-semibold text-[#b42318]">
                                  {formatMoney(
                                    customer.revenue_loss
                                  )}
                                </span>

                              </td>


                              <td className="px-6 py-4 text-right">

                                <span className="text-[12px] text-[#667085]">
                                  {share.toFixed(
                                    1
                                  )}
                                  %
                                </span>

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


            {/* =================================================
                ANALYSIS HISTORY
            ================================================= */}

            <section className="overflow-hidden rounded-lg border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

              <div className="border-b border-[#e7e9ed] px-5 py-5 sm:px-6">

                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

                  <div>

                    <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#172033]">
                      Analysis history
                    </h2>

                    <p className="mt-1 text-[12px] text-[#8b94a3]">
                      Previous revenue leakage analyses.
                    </p>

                  </div>

                  <span className="text-[11px] text-[#98a0ad]">
                    {analysisRuns.length}{" "}
                    {analysisRuns.length === 1
                      ? "run"
                      : "runs"}
                  </span>

                </div>

              </div>


              {analysisRuns.length === 0 ? (

                <div className="px-6 py-12 text-center">

                  <p className="text-[12px] text-[#98a0ad]">
                    No analysis history yet.
                  </p>

                </div>

              ) : (

                <div>

                  {analysisRuns.map(
                    (run, index) => {

                      const runFindings =
                        Number(
                          run.total_findings ||
                            0
                        );

                      const runRevenue =
                        Number(
                          run.total_revenue_loss ||
                            0
                        );

                      return (
                        <div
                          key={run.id}
                          className="border-b border-[#e7e9ed] px-5 py-5 last:border-b-0 sm:px-6"
                        >

                          <div className="grid gap-5 lg:grid-cols-[1.2fr_1.4fr_0.7fr_1fr_auto] lg:items-center">

                            {/* DATE */}

                            <div>

                              <p className="text-[13px] font-medium text-[#172033]">
                                {formatDate(
                                  run.created_at
                                )}
                              </p>

                              <p className="mt-1 text-[11px] text-[#98a0ad]">
                                {formatTime(
                                  run.created_at
                                )}
                              </p>

                            </div>


                            {/* FILE */}

                            <div className="min-w-0">

                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                                File
                              </p>

                              <p className="truncate text-[12px] text-[#526174]">
                                {run.file_name ||
                                  "CSV Upload"}
                              </p>

                            </div>


                            {/* FINDINGS */}

                            <div>

                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                                Findings
                              </p>

                              <p className="text-[13px] font-semibold text-[#172033]">
                                {runFindings.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                            </div>


                            {/* REVENUE */}

                            <div>

                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8b94a3]">
                                Revenue at risk
                              </p>

                              <p className="text-[13px] font-semibold text-[#b42318]">
                                {formatMoney(
                                  runRevenue
                                )}
                              </p>

                            </div>


                            {/* STATUS */}

                            <div className="lg:text-right">

                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cce8d8] bg-[#f4fbf7] px-2.5 py-1 text-[10px] font-medium text-[#087443]">

                                <span className="h-1.5 w-1.5 rounded-full bg-[#087443]" />

                                Completed

                              </span>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </main>
  );
}