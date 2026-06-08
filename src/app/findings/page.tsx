"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function FindingsPage() {
  const { isSignedIn, user } = useUser();

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchFindings();
    }
  }, [user]);

  async function fetchFindings() {
    const { data } = await supabase
      .from("findings")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", {
        ascending: false,
      });

    setData(data || []);
  }

  if (!isSignedIn) {
   return (
  <div className="max-w-7xl mx-auto p-8">

    <h1 className="text-4xl font-bold mb-8">
      Findings History
    </h1>

    <div className="grid md:grid-cols-3 gap-6 mb-8">

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6">
        <p className="text-zinc-400 text-sm">
          Total Findings
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {data.length}
        </h2>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6">
        <p className="text-zinc-400 text-sm">
          Revenue Leakage
        </p>

        <h2 className="text-3xl font-bold mt-2 text-red-400">
          ₹
          {data
            .reduce(
              (sum, row) =>
                sum +
                Number(row.revenue_loss || 0),
              0
            )
            .toLocaleString()}
        </h2>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6">
        <p className="text-zinc-400 text-sm">
          Leak Types
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {
            [
              ...new Set(
                data.map(
                  (row) => row.leak_type
                )
              ),
            ].length
          }
        </h2>
      </div>

    </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm overflow-hidden">

      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-semibold">
          All Findings
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Historical leakage records detected across uploaded files.
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-zinc-900/70 border-b border-zinc-800">

            <tr>

              <th className="text-left px-6 py-4 font-semibold">
                Customer
              </th>

              <th className="text-left px-6 py-4 font-semibold">
                Leak Type
              </th>

              <th className="text-right px-6 py-4 font-semibold">
                Revenue Loss
              </th>

            </tr>

          </thead>

          <tbody>

            {data.map((row) => (
              <tr
                key={row.id}
                className="
                  border-b
                  border-zinc-800
                  hover:bg-zinc-900/50
                  transition-colors
                "
              >
                <td className="px-6 py-4 font-medium">
                  {row.customer}
                </td>

                <td className="px-6 py-4">
                  <span
                    className="
                      inline-flex
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      bg-indigo-500/10
                      text-indigo-400
                      border
                      border-indigo-500/20
                    "
                  >
                    {row.leak_type}
                  </span>
                </td>

                <td className="px-6 py-4 text-right font-semibold text-red-400">
                  ₹
                  {Number(
                    row.revenue_loss
                  ).toLocaleString()}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  </div>
);
}
}
