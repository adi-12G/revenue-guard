"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeakageTable from "@/components/LeakageTable";
import FindingsTable from "@/components/FindingsTable";
import StatsCard from "@/components/StatsCard";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
  const [findings, setFindings] =
  useState<any[]>([]);
  const totalFindings =
  findings.length;
const { user } = useUser();
const totalRevenueLost =
  findings.reduce(
    (sum, row) =>
      sum +
      Number(row.revenue_loss || 0),
    0
  );
 const filteredFindings =
  findings.filter((finding) => {

    const matchesSearch =
      finding.customer
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      finding.leak_type === filter;

    return (
      matchesSearch &&
      matchesFilter
    );
  });

 useEffect(() => {
  if (user) {
    fetchFindings();
  }
}, [user]);

 async function fetchFindings() {
  console.log("User ID:", user?.id);

  const { data, error } = await supabase
    .from("findings")
    .select("*")
    .eq("user_id", user?.id);

  console.log("Fetched:", data);

  if (error) {
    console.error(error);
    return;
  }

  setFindings(data || []);
}

  console.log("Findings:", findings.length);
  console.log(findings);

return (
  <div className="min-h-screen bg-zinc-950 text-white p-8">
    <div className="max-w-7xl mx-auto">

   
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Revenue Intelligence Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Monitor billing leaks, revenue loss, and customer risk.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            flex-1
            bg-zinc-900
            border border-zinc-800
            rounded-xl
            px-4
            py-3
            outline-none
            focus:border-indigo-500
          "
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-xl
            px-4
            py-3
            outline-none
            focus:border-indigo-500
          "
        >
          <option>All</option>
          <option>Seat Overages</option>
          <option>Failed Payment</option>
          <option>CRM Mismatch</option>
          <option>Expired Discount</option>
          <option>Usage Undercounting</option>
        </select>

      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-5 mb-10">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Total Findings
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {totalFindings}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Revenue Leakage
          </p>

          <h2 className="text-4xl font-bold mt-3 text-red-400">
            ₹{totalRevenueLost}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Affected Accounts
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {new Set(
              findings.map((f) => f.customer)
            ).size}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Leak Types
          </p>

          <h2 className="text-4xl font-bold mt-3 text-indigo-400">
            5
          </h2>
        </div>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-xl font-semibold">
            Revenue Leakage Findings
          </h2>

          <p className="text-zinc-400 text-sm mt-1">
            All detected billing and revenue leakage issues.
          </p>
        </div>

        <div className="p-6">
          <FindingsTable
            data={filteredFindings}
          />
        </div>

      </div>

    </div>
  </div>
);
}
