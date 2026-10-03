"use client";

import { useState } from "react";
import Papa from "papaparse";

import { supabase } from "@/lib/supabase";
import { detectLeakage } from "@/lib/leakageDetector";

import { detectSeatOverage } from "@/lib/detectors/seatOverage";
import { detectFailedPayments } from "@/lib/detectors/failedPayments";
import { detectCrmMismatch } from "@/lib/detectors/crmMismatch";
import { detectExpiredDiscounts } from "@/lib/detectors/expiredDiscounts";
import { detectUsageUndercounting } from "@/lib/detectors/usageUndercounting";

import ColumnMapping from "./ColumnMapping";
import LeakageTable from "./LeakageTable";

import { normalizeRows } from "@/lib/csv/normalizeRows";

import {
  detectorFields,
  type FieldDefinition,
} from "@/lib/csv/fieldDefinitions";
import {
  getDetectorEligibility,
  detectorRequiredFields,
  type DetectorEligibility,
  type DetectorType,
} from "@/lib/csv/detectorEligibility";

import { useUser } from "@clerk/nextjs";

export default function FileUploader() {
  /* =========================================================
     RESULTS
  ========================================================= */

  const [results, setResults] = useState<any[]>([]);

  /* =========================================================
     DETECTOR
  ========================================================= */

  const [detector, setDetector] =
    useState<DetectorType>("invoice");

  /* =========================================================
     CSV / MAPPING STATE
  ========================================================= */

  const [csvRows, setCsvRows] = useState<any[]>([]);

  const [csvHeaders, setCsvHeaders] =
    useState<string[]>([]);

  const [csvFileName, setCsvFileName] =
    useState<string>("");

  const [mapping, setMapping] =
    useState<Record<string, string>>({});

  const [showMapping, setShowMapping] =
    useState(false);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  /* =========================================================
     DETECTOR ELIGIBILITY
  ========================================================= */

  const [eligibleDetectors, setEligibleDetectors] =
    useState<DetectorEligibility[]>([]);

  /* =========================================================
     MAPPING SAVE WARNING
  ========================================================= */

  const [saveWarning, setSaveWarning] =
    useState<string | null>(null);

  /* =========================================================
     USER
  ========================================================= */

  const {
    user,
    isSignedIn,
    isLoaded,
  } = useUser();

  /* =========================================================
     STATS
  ========================================================= */

  const totalInvoices = results.length;

  const healthyInvoices = results.filter(
    (invoice) =>
      invoice.status === "Healthy"
  ).length;

  const leakagesFound =
    totalInvoices - healthyInvoices;

  const revenueLost = results.reduce(
    (sum, invoice) =>
      sum + (Number(invoice.loss) || 0),
    0
  );

  /* =========================================================
     CURRENT DETECTOR FIELDS
  ========================================================= */

  const currentFields =
    detectorFields[detector] as Record<
      string,
      FieldDefinition
    >;

  /* =========================================================
     HANDLE FILE UPLOAD
  ========================================================= */

  const handleFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      alert("Please sign in first");
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) return;

    setCsvFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (csvResults) => {
        const headers =
          csvResults.meta.fields || [];

        const rows =
          csvResults.data as any[];

        console.log(
          "CSV HEADERS:",
          headers
        );

        console.log(
          "CSV ROWS:",
          rows
        );

        /* =====================================================
           BASIC VALIDATION
        ===================================================== */

        if (headers.length === 0) {
          alert(
            "Could not detect any columns in this CSV."
          );
          return;
        }

        if (rows.length === 0) {
          alert(
            "This CSV does not contain any data rows."
          );
          return;
        }

        /* =====================================================
           DETECTOR ELIGIBILITY
        ===================================================== */

        const eligibility =
          getDetectorEligibility(headers);

        console.log(
          "DETECTOR ELIGIBILITY:",
          eligibility
        );

        setEligibleDetectors(
          eligibility
        );

        /* =====================================================
           FIND FIRST DETECTOR THAT CAN RUN
        ===================================================== */

        const firstEligible =
          eligibility.find(
            (item) => item.canRun
          );

        if (!firstEligible) {
          alert(
            "This CSV does not contain enough columns for any available detector."
          );

          return;
        }

        /* =====================================================
           SET SELECTED DETECTOR
        ===================================================== */

        setDetector(
          firstEligible.detector
        );

        /* =====================================================
           USE AUTO-MAPPING FROM ELIGIBILITY
        ===================================================== */

        const suggestedMapping =
          firstEligible.mapping;

        console.log(
          "SUGGESTED MAPPING:",
          suggestedMapping
        );

        /* =====================================================
           SAVE CSV STATE
        ===================================================== */

        setCsvHeaders(headers);

        setCsvRows(rows);

        setMapping(
          suggestedMapping
        );

        setSaveWarning(null);

        setShowMapping(true);
      },

      error: (error) => {
        console.error(
          "CSV PARSING ERROR:",
          error
        );

        alert(
          "Could not read this CSV file."
        );
      },
    });
  };

  /* =========================================================
     HANDLE DETECTOR CHANGE
  ========================================================= */

  const handleDetectorChange = (
    newDetector: DetectorType
  ) => {
    setDetector(newDetector);

    const selected =
      eligibleDetectors.find(
        (item) =>
          item.detector ===
          newDetector
      );

    if (selected) {
      setMapping(
        selected.mapping
      );
    } else {
      setMapping({});
    }

    setSaveWarning(null);
  };

  /* =========================================================
     HANDLE ANALYSIS
  ========================================================= */

  const handleAnalyze = async () => {
    if (!csvRows.length) {
      alert(
        "Please upload a CSV first."
      );

      return;
    }

    /* =======================================================
       VALIDATE MAPPING
    ======================================================= */

    const requiredFields =
  detectorRequiredFields[detector];

const missingFields =
  requiredFields.filter(
    (field) =>
      !mapping[field] ||
      mapping[field].trim() === ""
  );

    if (
      missingFields.length > 0
    ) {
      const missingLabels =
        missingFields.map(
          (field) =>
            currentFields[field]
              ?.label || field
        );

      alert(
        `Please map these required fields:\n\n${missingLabels.join(
          "\n"
        )}`
      );

      return;
    }

    setIsAnalyzing(true);

    try {
      /* =====================================================
         RUN ALL ELIGIBLE DETECTORS
      ===================================================== */

      let processed: any[] = [];

      const eligible =
        eligibleDetectors.filter(
          (item) => item.canRun
        );

      console.log(
        "ELIGIBLE DETECTORS:",
        eligible.map(
          (item) => item.detector
        )
      );

      for (const item of eligible) {
        const detectorType =
          item.detector;

        console.log(
          `RUNNING DETECTOR: ${detectorType}`
        );

        /*
         * Every detector gets its own mapping.
         */

        const detectorRows =
          normalizeRows(
            csvRows,
            item.mapping,
            detectorType
          );

        let detectorResults: any[] = [];

        /* =====================================================
           INVOICE RECONCILIATION
        ===================================================== */

        if (detectorType === "invoice") {
          detectorResults =
            detectorRows
              .map((row: any) => {
                const expected =
                  Number(row.expected) || 0;

                const billed =
                  Number(row.billed) || 0;

                const loss =
                  Math.max(
                    expected - billed,
                    0
                  );

                return {
                  customer:
                    row.customer,

                  leakType:
                    "Invoice Reconciliation",

                  expected,

                  billed,

                  loss,

                  status: detectLeakage({
                    customer:
                      row.customer,
                    expected,
                    billed,
                  }),

                  detail:
                    loss > 0
                      ? `Expected ₹${expected.toLocaleString(
                          "en-IN"
                        )} but billed ₹${billed.toLocaleString(
                          "en-IN"
                        )}`
                      : "Invoice amount matches expected amount",

                  suggestedAction:
                    loss > 0
                      ? "Review the invoice and bill the missing amount"
                      : null,
                };
              })
              .filter(
                (row) =>
                  row.loss > 0
              );
        }

        /* =====================================================
           SEAT OVERAGES
        ===================================================== */

        if (detectorType === "seat") {
          detectorResults =
            detectSeatOverage(
              detectorRows
            );
        }

        /* =====================================================
           FAILED PAYMENTS
        ===================================================== */

        if (detectorType === "payment") {
          detectorResults =
            detectFailedPayments(
              detectorRows
            );
        }

        /* =====================================================
           CRM MISMATCH
        ===================================================== */

        if (detectorType === "crm") {
          detectorResults =
            detectCrmMismatch(
              detectorRows
            );
        }

        /* =====================================================
           EXPIRED DISCOUNTS
        ===================================================== */

        if (detectorType === "discount") {
          detectorResults =
            detectExpiredDiscounts(
              detectorRows
            );
        }

        /* =====================================================
           USAGE UNDERCOUNTING
        ===================================================== */

        if (detectorType === "usage") {
          detectorResults =
            detectUsageUndercounting(
              detectorRows
            );
        }

        console.log(
          `${detectorType} RESULTS:`,
          detectorResults
        );

        /*
         * Add results instead of replacing previous results.
         */

        processed.push(
          ...detectorResults
        );
      }

      console.log(
        "ALL PROCESSED RESULTS:",
        processed
      );

      /* =====================================================
         UPDATE UI
      ===================================================== */

      setResults(processed);

      setShowMapping(false);

      /* =====================================================
         SAVE ANALYSIS RUN + FINDINGS
      ===================================================== */

      const findings =
        processed.map((row) => ({
          customer:
            row.customer,

          leak_type:
            row.leakType ||
            row.status ||
            null,

          revenue_loss:
            Number(row.loss) || 0,

          detail:
            row.detail || null,

          suggested_action:
            row.suggestedAction ||
            null,

          evidence: {
            /* =========================
               SEAT OVERAGES
            ========================= */

            actualSeats:
              row.actualSeats ??
              null,

            billedSeats:
              row.billedSeats ??
              null,

            extraSeats:
              row.extraSeats ??
              null,

            pricePerSeat:
              row.pricePerSeat ??
              null,

            /* =========================
               FAILED PAYMENTS
            ========================= */

            failureReason:
              row.failureReason ??
              null,

            daysOutstanding:
              row.daysOutstanding ??
              null,

            /* =========================
               CRM MISMATCH
            ========================= */

            issueType:
              row.issueType ??
              null,

            /* =========================
               USAGE UNDERCOUNTING
            ========================= */

            metric:
              row.metric ??
              null,

            actualUsage:
              row.actualUsage ??
              null,

            billedUsage:
              row.billedUsage ??
              null,

            undercountingPercent:
              row.undercountingPercent ??
              null,

            /* =========================
               INVOICE RECONCILIATION
            ========================= */

            expected:
              row.expected ??
              null,

            billed:
              row.billed ??
              null,
          },

          user_id:
            user?.id,
        }));

      console.log(
        "FINDINGS TO SAVE:",
        findings
      );

      if (
        findings.length > 0
      ) {
        /* =====================================================
           1. CREATE ANALYSIS RUN
        ===================================================== */

        const {
          data: run,
          error: runError,
        } = await supabase
          .from("analysis_runs")
          .insert({
            user_id:
              user?.id,

            file_name:
              csvFileName ||
              "CSV Upload",

            total_findings:
              findings.length,

            total_revenue_loss:
              findings.reduce(
                (
                  sum,
                  finding
                ) =>
                  sum +
                  Number(
                    finding.revenue_loss ||
                      0
                  ),
                0
              ),
          })
          .select("id")
          .single();

        if (
          runError ||
          !run
        ) {
          console.error(
            "ANALYSIS RUN ERROR:",
            runError
          );

          alert(
            "Could not create analysis run."
          );

          return;
        }

        console.log(
          "ANALYSIS RUN CREATED:",
          run.id
        );

        /* =====================================================
           2. ADD RUN ID TO EVERY FINDING
        ===================================================== */

        const findingsWithRunId =
          findings.map(
            (finding) => ({
              ...finding,
              run_id:
                run.id,
            })
          );

        console.log(
          "FINDINGS WITH RUN ID:",
          findingsWithRunId
        );

        /* =====================================================
           3. SAVE FINDINGS
        ===================================================== */

        const {
          error: findingsError,
        } = await supabase
          .from("findings")
          .insert(
            findingsWithRunId
          );

        if (
          findingsError
        ) {
          console.error(
            "FINDINGS SAVE ERROR:",
            findingsError
          );

          alert(
            "Analysis run was created, but findings could not be saved."
          );
        } else {
          console.log(
            "Saved findings to Supabase:",
            findingsWithRunId.length
          );
        }
      }
    } catch (error) {
      console.error(
        "ANALYSIS ERROR:",
        error
      );

      alert(
        "Something went wrong while analyzing the CSV."
      );
    } finally {
      setIsAnalyzing(
        false
      );
    }
  };

  /* =========================================================
     CANCEL MAPPING
  ========================================================= */

  const handleCancelMapping =
    () => {
      setShowMapping(false);

      setCsvRows([]);

      setCsvHeaders([]);

      setCsvFileName("");

      setMapping({});

      setEligibleDetectors(
        []
      );

      setSaveWarning(null);
    };

  /* =========================================================
     UI
  ========================================================= */

  const detectionTypes = [
    "Failed Payments",
    "Usage Undercounting",
    "Seat Overages",
    "CRM Mismatch",
    "Invoice Reconciliation",
    "Expired Discounts",
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#172033]">
      {/* TOP NAV */}
      <header className="sticky top-0 z-20 border-b border-[#dfe3e8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between px-5 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#635bff] text-sm font-bold text-white">
              R
            </div>

            <div className="leading-none">
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#172033]">
                Revenue Guard
              </div>

              <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#8b94a3]">
                Revenue intelligence
              </div>
            </div>
          </a>

          <div className="flex items-center gap-2">
            {csvFileName && (
              <div className="hidden max-w-[260px] truncate rounded-md border border-[#dfe3e8] bg-[#fafbfc] px-3 py-2 text-[11px] text-[#667085] sm:block">
                {csvFileName}
              </div>
            )}

            <a
              href="/"
              className="rounded-md px-3 py-2 text-[12px] font-medium text-[#667085] transition hover:bg-[#f4f5f7] hover:text-[#172033]"
            >
              Home
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-5 py-7 lg:px-8 lg:py-9">
        {/* PAGE HEADER */}
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#dfe3e8] pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#8b94a3]">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-[#525c6b]">
                New analysis
              </span>
            </div>

            <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-[#172033] sm:text-[34px]">
              Revenue analysis
            </h1>

            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#667085]">
              Upload an existing billing, CRM, payment or usage export to identify measurable revenue leakage.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-[#dfe3e8] bg-white px-3 py-2 text-[11px] text-[#667085]">
            <span className="h-2 w-2 rounded-full bg-[#299764]" />
            Detection engine ready
          </div>
        </div>

        {/* PRIMARY WORKSPACE */}
        <section className="overflow-hidden rounded-lg border border-[#dfe3e8] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e7e9ed] px-5 py-4 sm:flex-row sm:items-center lg:px-6">
            <div>
              <h2 className="text-[14px] font-semibold text-[#172033]">
                Data source
              </h2>

              <p className="mt-1 text-[12px] text-[#8b94a3]">
                Start with a CSV export. No migration or integration required.
              </p>
            </div>

            {showMapping ? (
              <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] px-3 py-2 text-[11px] text-[#667085]">
                Mapping columns
              </div>
            ) : (
              <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] px-3 py-2 text-[11px] text-[#667085]">
                CSV only
              </div>
            )}
          </div>

          <div className="p-5 lg:p-6">
            {showMapping && (
              <ColumnMapping
                headers={csvHeaders}
                rows={csvRows}
                mapping={mapping}
                fields={currentFields}
                detector={detector}
                eligibleDetectors={
                  eligibleDetectors
                }
                onDetectorChange={
                  handleDetectorChange
                }
                onMappingChange={(
                  field,
                  value
                ) =>
                  setMapping(
                    (previous) => ({
                      ...previous,
                      [field]: value,
                    })
                  )
                }
                onConfirm={
                  handleAnalyze
                }
                onCancel={
                  handleCancelMapping
                }
                isAnalyzing={
                  isAnalyzing
                }
                saveWarning={
                  saveWarning
                }
              />
            )}

            {!showMapping && (
              <label className="group block cursor-pointer">
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd1d9] bg-[#fbfcfd] px-6 py-12 text-center transition hover:border-[#635bff] hover:bg-[#fafaff]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#dfe3e8] bg-white text-[20px] font-light text-[#635bff] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    ↑
                  </div>

                  <p className="mt-5 text-[15px] font-semibold text-[#172033]">
                    Upload a CSV export
                  </p>

                  <p className="mt-2 max-w-[430px] text-[13px] leading-5 text-[#667085]">
                    Use data from billing, payments, CRM, subscriptions or product usage.
                  </p>

                  <span className="mt-6 inline-flex h-9 items-center rounded-md bg-[#172033] px-4 text-[12px] font-semibold text-white transition group-hover:bg-[#263247]">
                    Choose CSV file
                  </span>

                  <p className="mt-3 text-[10px] text-[#98a0ad]">
                    CSV files only
                  </p>
                </div>

                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={
                    handleFile
                  }
                />
              </label>
            )}
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Records analyzed"
            value={totalInvoices.toLocaleString(
              "en-IN"
            )}
            description="Rows returned by the analysis"
          />

          <MetricCard
            label="Findings"
            value={leakagesFound.toLocaleString(
              "en-IN"
            )}
            description="Records with detected leakage"
            valueClass="text-[#b54708]"
          />

          <MetricCard
            label="Healthy"
            value={healthyInvoices.toLocaleString(
              "en-IN"
            )}
            description="Records with no detected issue"
            valueClass="text-[#16794c]"
          />

          <MetricCard
            label="Revenue at risk"
            value={`₹${revenueLost.toLocaleString(
              "en-IN"
            )}`}
            description="Estimated revenue impact"
            valueClass="text-[#172033]"
          />
        </section>

        {/* DETECTION COVERAGE */}
        <section className="mt-5 overflow-hidden rounded-lg border border-[#dfe3e8] bg-white">
          <div className="border-b border-[#e7e9ed] px-5 py-4 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#172033]">
                  Detection coverage
                </h2>

                <p className="mt-1 text-[12px] text-[#8b94a3]">
                  Revenue Guard checks the data for six common leakage patterns.
                </p>
              </div>

              <span className="hidden text-[11px] text-[#8b94a3] sm:block">
                6 checks
              </span>
            </div>
          </div>

          <div className="grid divide-y divide-[#e7e9ed] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
            {detectionTypes.map(
              (item, index) => (
                <div
                  key={item}
                  className={`flex items-center gap-3 px-5 py-4 lg:px-6 ${
                    index % 2 === 1
                      ? "sm:border-l sm:border-[#e7e9ed]"
                      : ""
                  } ${
                    index >= 2
                      ? "lg:border-t lg:border-[#e7e9ed]"
                      : ""
                  } ${
                    index % 3 !== 0
                      ? "lg:border-l"
                      : ""
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#dfe3e8] bg-[#fafbfc] text-[10px] font-semibold text-[#667085]">
                    {index + 1}
                  </span>

                  <span className="text-[12px] font-medium text-[#344054]">
                    {item}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* RESULTS */}
        <section className="mt-5 overflow-hidden rounded-lg border border-[#dfe3e8] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e7e9ed] px-5 py-4 sm:flex-row sm:items-center lg:px-6">
            <div>
              <h2 className="text-[14px] font-semibold text-[#172033]">
                Analysis results
              </h2>

              <p className="mt-1 text-[12px] text-[#8b94a3]">
                Detected revenue leakage from the uploaded records.
              </p>
            </div>

            {results.length > 0 && (
              <div className="rounded-md border border-[#dfe3e8] bg-[#fafbfc] px-3 py-2 text-[11px] font-medium text-[#525c6b]">
                {results.length.toLocaleString(
                  "en-IN"
                )}{" "}
                findings
              </div>
            )}
          </div>

          <div className="p-5 lg:p-6">
            {results.length === 0 ? (
              <div className="border border-dashed border-[#dfe3e8] bg-[#fbfcfd] px-6 py-14 text-center">
                <p className="text-[13px] font-medium text-[#344054]">
                  No analysis results yet
                </p>

                <p className="mx-auto mt-1 max-w-[420px] text-[12px] leading-5 text-[#8b94a3]">
                  Upload a CSV above to run the detection engine and see revenue leakage findings here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <LeakageTable
                  data={results}
                />
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-[#dfe3e8] pt-5 text-[10px] text-[#98a0ad] sm:flex-row">
          <span>
            Revenue Guard · Revenue intelligence
          </span>

          <span>
            Your existing data. Clearer revenue decisions.
          </span>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  valueClass = "text-[#172033]",
}: {
  label: string;
  value: string;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-[#dfe3e8] bg-white px-5 py-4">
      <p className="text-[11px] font-medium text-[#667085]">
        {label}
      </p>

      <p
        className={`mt-2 text-[25px] font-semibold tracking-[-0.035em] ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#98a0ad]">
        {description}
      </p>
    </div>
  );
}
