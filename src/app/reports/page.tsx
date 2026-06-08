"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeakageChart
from "@/components/LeakageChart";
import { useUser } from "@clerk/nextjs";
export default function ReportsPage() {
  const [findings, setFindings] = useState<any[]>([]);
  const { user, isLoaded } = useUser();

useEffect(() => {
  if (isLoaded && user) {
    fetchReports();
  }
}, [isLoaded, user]);

  async function fetchReports() {
  console.log("USER ID:", user?.id);

  const { data, error } = await supabase
    .from("findings")
    .select("*")
    .eq("user_id", user?.id);

  console.log("SUPABASE DATA:", data);
  console.log("SUPABASE ERROR:", error);

  if (error) {
    console.error(error);
    return;
  }

  setFindings(data || []);
}
  const totalLeakage = findings.reduce(
    (sum, row) =>
      sum + Number(row.revenue_loss || 0),
    0
  );



  const leakTypeTotals = findings.reduce(
    (acc: any, row) => {
      const type = row.leak_type;

      acc[type] =
        (acc[type] || 0) +
        Number(row.revenue_loss || 0);

      return acc;
    },
    {}
  );

  const topCustomers = [...findings]
    .sort(
      (a, b) =>
        Number(b.revenue_loss) -
        Number(a.revenue_loss)
    )
    .slice(0, 5);
    const chartData =
  Object.entries(leakTypeTotals).map(
    ([type, amount]) => ({
      type,
      loss: amount,
    })
  );

  console.log(findings);
console.log(chartData);


 return (
  <div className="min-h-screen bg-zinc-950 text-white">
    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Revenue Leakage Report
        </h1>

        <p className="text-zinc-400 mt-2">
          Analyze leakage trends, revenue impact and high-risk customers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-5 mb-10">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Revenue At Risk
          </p>

          <h2 className="text-4xl font-bold text-red-400 mt-3">
            ₹{totalLeakage.toLocaleString()}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Findings
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {findings.length}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Leak Types
          </p>

          <h2 className="text-4xl font-bold text-indigo-400 mt-3">
            {Object.keys(leakTypeTotals).length}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Affected Customers
          </p>

          <h2 className="text-4xl font-bold text-amber-400 mt-3">
            {new Set(findings.map(f => f.customer)).size}
          </h2>
        </div>

      </div>

      {/* Chart + Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">

        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-xl font-semibold mb-6">
            Leakage By Type
          </h2>

          <div className="h-[320px]">
            <LeakageChart data={chartData} />
          </div>

        </div>

        {/* Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-xl font-semibold mb-6">
            Revenue Breakdown
          </h2>

          <div className="space-y-4">

            {Object.entries(leakTypeTotals).map(
              ([type, amount]) => (
                <div
                  key={type}
                  className="flex justify-between items-center border-b border-zinc-800 pb-3"
                >
                  <span className="text-zinc-300">
                    {type}
                  </span>

                  <span className="font-semibold text-red-400">
                    ₹{Number(amount).toLocaleString()}
                  </span>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* Top Customers Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">
            Top Customers By Revenue Loss
          </h2>

          <p className="text-zinc-400 text-sm mt-1">
            Customers contributing the most leakage.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-zinc-950">

              <tr>
                <th className="text-left px-6 py-4 text-zinc-400 font-medium">
                  Customer
                </th>

                <th className="text-left px-6 py-4 text-zinc-400 font-medium">
                  Leak Type
                </th>

                <th className="text-left px-6 py-4 text-zinc-400 font-medium">
                  Revenue Loss
                </th>
              </tr>

            </thead>

            <tbody>

              {topCustomers.map(
                (customer, index) => (
                  <tr
                    key={index}
                    className="border-t border-zinc-800 hover:bg-zinc-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      {customer.customer}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">
                        {customer.leak_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-red-400">
                      ₹{Number(
                        customer.revenue_loss
                      ).toLocaleString()}
                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  </div>
);
}
