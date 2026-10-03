"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

type RecoveryStats = {
  totalRisk: number;
  recovered: number;
  outstanding: number;
  recoveryRate: number;
  open: number;
  underReview: number;
  resolved: number;
};

export default function RecoveryStats() {
  const { user, isLoaded } = useUser();

  const [stats, setStats] =
    useState<RecoveryStats>({
      totalRisk: 0,
      recovered: 0,
      outstanding: 0,
      recoveryRate: 0,
      open: 0,
      underReview: 0,
      resolved: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchRecoveryStats();
    }
  }, [isLoaded, user?.id]);

  async function fetchRecoveryStats() {
    if (!user?.id) return;

    setLoading(true);

    try {
      /* =========================================
         GET LATEST ANALYSIS RUN
      ========================================= */

      const {
        data: latestRun,
        error: runError,
      } = await supabase
        .from("analysis_runs")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (runError) {
        console.error(
          "LATEST RUN ERROR:",
          runError
        );

        return;
      }

      if (!latestRun?.id) {
        setStats({
          totalRisk: 0,
          recovered: 0,
          outstanding: 0,
          recoveryRate: 0,
          open: 0,
          underReview: 0,
          resolved: 0,
        });

        return;
      }

      /* =========================================
         GET LATEST RUN FINDINGS
      ========================================= */

      const {
        data: findings,
        error: findingsError,
      } = await supabase
        .from("findings")
        .select(
          "revenue_loss, recovered_amount, status"
        )
        .eq("user_id", user.id)
        .eq(
          "run_id",
          latestRun.id
        );

      if (findingsError) {
        console.error(
          "FINDINGS ERROR:",
          findingsError
        );

        return;
      }

      const rows = findings || [];

      /* =========================================
         CALCULATE RECOVERY METRICS
      ========================================= */

      const totalRisk = rows.reduce(
        (sum, row) =>
          sum +
          Number(
            row.revenue_loss || 0
          ),
        0
      );

      const recovered = rows.reduce(
        (sum, row) =>
          sum +
          Number(
            row.recovered_amount || 0
          ),
        0
      );

      const outstanding = Math.max(
        totalRisk - recovered,
        0
      );

      const recoveryRate =
        totalRisk > 0
          ? Math.round(
              (recovered /
                totalRisk) *
                100
            )
          : 0;

      const open = rows.filter(
        (row) =>
          !row.status ||
          row.status === "Open"
      ).length;

      const underReview =
        rows.filter(
          (row) =>
            row.status ===
            "Under Review"
        ).length;

      const resolved = rows.filter(
        (row) =>
          row.status ===
          "Resolved"
      ).length;

      setStats({
        totalRisk,
        recovered,
        outstanding,
        recoveryRate,
        open,
        underReview,
        resolved,
      });
    } catch (error) {
      console.error(
        "RECOVERY STATS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(
    amount: number
  ) {
    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  }

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-32
                animate-pulse
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900
              "
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* =========================================
          MAIN KPI CARDS
      ========================================= */}

      <div className="grid gap-5 md:grid-cols-4">

        {/* REVENUE AT RISK */}

        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
          "
        >
          <p className="text-sm text-zinc-400">
            Revenue at Risk
          </p>

          <p className="mt-3 text-3xl font-bold text-red-400">
            {formatCurrency(
              stats.totalRisk
            )}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Total detected leakage
          </p>
        </div>

        {/* RECOVERED */}

        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
          "
        >
          <p className="text-sm text-zinc-400">
            Recovered Revenue
          </p>

          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {formatCurrency(
              stats.recovered
            )}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Money recovered so far
          </p>
        </div>

        {/* OUTSTANDING */}

        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
          "
        >
          <p className="text-sm text-zinc-400">
            Outstanding Leakage
          </p>

          <p className="mt-3 text-3xl font-bold text-amber-400">
            {formatCurrency(
              stats.outstanding
            )}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Revenue still recoverable
          </p>
        </div>

        {/* RECOVERY RATE */}

        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
          "
        >
          <p className="text-sm text-zinc-400">
            Recovery Rate
          </p>

          <p className="mt-3 text-3xl font-bold text-indigo-400">
            {stats.recoveryRate}%
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{
                width: `${Math.min(
                  stats.recoveryRate,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

      </div>

      {/* =========================================
          FINDING STATUS
      ========================================= */}

      <div
        className="
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-900
          p-6
        "
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Recovery Pipeline
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Current state of detected revenue leakage
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {/* OPEN */}

          <div
            className="
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950
              p-5
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">
                Open
              </span>

              <span
                className="
                  rounded-full
                  bg-zinc-800
                  px-3
                  py-1
                  text-xs
                  text-zinc-300
                "
              >
                {stats.open}
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Findings that need investigation
            </p>
          </div>

          {/* UNDER REVIEW */}

          <div
            className="
              rounded-xl
              border
              border-yellow-900/40
              bg-yellow-950/10
              p-5
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-300">
                Under Review
              </span>

              <span
                className="
                  rounded-full
                  bg-yellow-950/50
                  px-3
                  py-1
                  text-xs
                  text-yellow-300
                "
              >
                {stats.underReview}
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Findings currently being worked on
            </p>
          </div>

          {/* RESOLVED */}

          <div
            className="
              rounded-xl
              border
              border-emerald-900/40
              bg-emerald-950/10
              p-5
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-300">
                Resolved
              </span>

              <span
                className="
                  rounded-full
                  bg-emerald-950/50
                  px-3
                  py-1
                  text-xs
                  text-emerald-300
                "
              >
                {stats.resolved}
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Findings where recovery is complete
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}