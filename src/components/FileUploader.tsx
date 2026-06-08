"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { detectLeakage } from "@/lib/leakageDetector";
import { detectSeatOverage } from "@/lib/detectors/seatOverage";
import { detectFailedPayments }
from "@/lib/detectors/failedPayments";
import { detectCrmMismatch }
from "@/lib/detectors/crmMismatch";
import { detectExpiredDiscounts } from "@/lib/detectors/expiredDiscounts";
import { detectUsageUndercounting }
from "@/lib/detectors/usageUndercounting";
import LeakageTable from "./LeakageTable";
import StatsCard from "./StatsCard";
import { useUser } from "@clerk/nextjs";

export default function FileUploader() {
  
  const [results, setResults] = useState<any[]>([]);
  const [detector, setDetector] =
    useState("invoice");
    const { user, isSignedIn, isLoaded } = useUser();
console.log("CURRENT USER:", user);
  const totalInvoices = results.length;

  const healthyInvoices = results.filter(
    (invoice) => invoice.status === "Healthy"
  ).length;

  const leakagesFound =
    totalInvoices - healthyInvoices;

  const revenueLost = results.reduce(
    (sum, invoice) => sum + (invoice.loss || 0),
    0
  );

  const handleFile = (
    event: React.ChangeEvent<HTMLInputElement>
) => {

  if (!isLoaded) return;

  if (!isSignedIn) {
    alert("Please sign in first");
    return;
  }

  const file = event.target.files?.[0];

  if (!file) return;

    Papa.parse(file, {
      header: true,

      complete: async (csvResults) => {
        let processed: any[] = [];
        if (detector === "payment") {
  processed =
    detectFailedPayments(
      csvResults.data
    );
}
        if (detector === "invoice") {
          processed = csvResults.data.map(
            (row: any) => {
              const expected = Number(
                row.expected
              );

              const billed = Number(
                row.billed
              );

              return {
                customer: row.customer,
                expected,
                billed,

                loss: Math.max(
                  expected - billed,
                  0
                ),

                status: detectLeakage({
                  customer: row.customer,
                  expected,
                  billed,
                }),
              };
            }
          );
        }

        if (detector === "seat") {
          processed = detectSeatOverage(
            csvResults.data
          );
        }
if (detector === "crm") {
  processed =
    detectCrmMismatch(
      csvResults.data
    );
}

if (detector === "discount") {
  processed =
    detectExpiredDiscounts(
      csvResults.data
    );
}

if (detector === "usage") {
  processed =
    detectUsageUndercounting(
      csvResults.data
    );
}

       console.log(processed);
        setResults(processed);
const findings = processed.map(
  (row) => ({
    customer: row.customer,
    leak_type: row.leakType,
    revenue_loss: row.loss,
    user_id: user?.id,
  })
);
console.log(findings);
const { error } = await supabase
  .from("findings")
  .insert(findings);

if (error) {
  console.error(error);
}

      if (error) {
  console.error(
    "SUPABASE ERROR:",
    error
  );
} else {
          console.log("Saved to Supabase");
        }
      },
    });
  };

 return (
  <div className="min-h-screen bg-zinc-950 text-white">
    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Upload Data
        </h1>

        <p className="text-zinc-400 mt-2">
          Upload billing, CRM, payment or usage exports to detect revenue leakage.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">

        <h2 className="text-xl font-semibold mb-6">
          Detection Engine
        </h2>

        <select
          value={detector}
          onChange={(e) =>
            setDetector(e.target.value)
          }
          className="
            w-full
            bg-zinc-950
            border
            border-zinc-800
            rounded-xl
            px-4
            py-3
            mb-6
            outline-none
            focus:border-indigo-500
          "
        >
          <option value="invoice">
            Invoice Reconciliation
          </option>

          <option value="seat">
            Seat Overages
          </option>

          <option value="payment">
            Failed Payments
          </option>

          <option value="crm">
            CRM vs Billing Mismatch
          </option>

          <option value="discount">
            Expired Discounts
          </option>

          <option value="usage">
            Usage Undercounting
          </option>
        </select>

        {/* File Upload */}
        <label
          className="
            flex
            flex-col
            items-center
            justify-center
            h-48
            border-2
            border-dashed
            border-zinc-700
            rounded-2xl
            cursor-pointer
            hover:border-indigo-500
            transition
          "
        >
          <div className="text-center">
            <p className="text-lg font-medium">
              Upload CSV File
            </p>

            <p className="text-zinc-400 text-sm mt-2">
              Click to select a CSV file
            </p>
          </div>

          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>

      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-5 mb-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Total Records
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {totalInvoices}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Leakages Found
          </p>

          <h2 className="text-4xl font-bold mt-3 text-amber-400">
            {leakagesFound}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Healthy
          </p>

          <h2 className="text-4xl font-bold mt-3 text-emerald-400">
            {healthyInvoices}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition">
          <p className="text-zinc-400 text-sm">
            Revenue Lost
          </p>

          <h2 className="text-4xl font-bold mt-3 text-red-400">
            ₹{revenueLost}
          </h2>
        </div>

      </div>

      {/* Results */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-xl font-semibold">
            Analysis Results
          </h2>

          <p className="text-zinc-400 text-sm mt-1">
            Detected revenue leakage issues from uploaded records.
          </p>
        </div>

        <div className="p-6">

          {results.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              Upload a CSV file to begin analysis.
            </div>
          ) : (
            <LeakageTable data={results} />
          )}

        </div>

      </div>

    </div>
  </div>
);
}