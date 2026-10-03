"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileSpreadsheet,
  Layers3,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";

const leakageTypes = [
  {
    title: "Failed Payments",
    description:
      "Identify invoices that failed to collect and quantify the revenue still outstanding.",
    amount: "₹8.80L",
    icon: CircleDollarSign,
  },

  {
    title: "Usage Undercounting",
    description:
      "Compare actual product usage against billed usage to uncover missed revenue.",
    amount: "₹2.13L",
    icon: TrendingUp,
  },

  {
    title: "Seat Overages",
    description:
      "Find customers using more seats than they are currently being billed for.",
    amount: "₹2.11L",
    icon: Layers3,
  },

  {
    title: "CRM Mismatch",
    description:
      "Detect accounts where CRM and billing records do not line up.",
    amount: "₹1.62L",
    icon: ShieldCheck,
  },

  {
    title: "Invoice Reconciliation",
    description:
      "Compare expected and billed amounts to find invoice-level discrepancies.",
    amount: "₹1.12L",
    icon: FileSpreadsheet,
  },

  {
    title: "Expired Discounts",
    description:
      "Catch discounts that should have ended but are still reducing revenue.",
    amount: "₹91K",
    icon: TrendingDown,
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your data",
    description:
      "Export the billing, CRM, payment or usage data you already have and upload it to Revenue Guard.",
  },

  {
    number: "02",
    title: "Revenue Guard analyzes it",
    description:
      "Our detection engine compares what should have happened with what was actually billed and collected.",
  },

  {
    number: "03",
    title: "See what is leaking",
    description:
      "Get the affected accounts, estimated revenue at risk, evidence and recommended action.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#0a2540] selection:bg-[#635bff]/15">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
{/* NAVBAR */}
<nav className="sticky top-0 z-50 border-b border-[#d9dee7]/80 bg-[#f7f8fa]/95 backdrop-blur-xl">
  <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-6 lg:px-8">

    {/* LOGO */}
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635bff] text-white">
        <CircleDollarSign size={19} strokeWidth={2.3} />
      </div>

      <div>
        <span className="block text-[18px] font-semibold tracking-[-0.03em] text-[#0a2540]">
          Revenue Guard
        </span>

        <span className="hidden text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8896a5] sm:block">
          Revenue intelligence
        </span>
      </div>
    </Link>


    {/* MARKETING NAV */}
    <div className="hidden items-center gap-8 text-[14px] font-medium text-[#425466] lg:flex">

      <a
        href="#product"
        className="transition hover:text-[#0a2540]"
      >
        Product
      </a>

      <a
        href="#how-it-works"
        className="transition hover:text-[#0a2540]"
      >
        How it works
      </a>

      <a
        href="#leakage"
        className="transition hover:text-[#0a2540]"
      >
        Leakage
      </a>

      <a
        href="#security"
        className="transition hover:text-[#0a2540]"
      >
        Security
      </a>

    </div>


    {/* RIGHT SIDE */}
    <div className="flex items-center gap-3">

      {/* WORKSPACE DROPDOWN */}
      <div className="group relative hidden lg:block">

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium text-[#425466] transition hover:bg-white hover:text-[#0a2540]"
        >
          Workspace

          <ChevronRight
            size={15}
            className="rotate-90 transition-transform duration-200 group-hover:rotate-[270deg]"
          />
        </button>


        {/* DROPDOWN */}
        <div className="pointer-events-none absolute right-0 top-full w-[220px] pt-3 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100">

          <div className="overflow-hidden rounded-xl border border-[#d9dee7] bg-white p-2 shadow-[0_16px_40px_rgba(10,37,64,0.12)]">

            <div className="px-3 pb-2 pt-2">

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8896a5]">
                Workspace
              </p>

            </div>


            <Link
              href="/dashboard"
              className="flex items-center rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#425466] transition hover:bg-[#f7f8fa] hover:text-[#0a2540]"
            >
              Dashboard
            </Link>


            <Link
              href="/findings"
              className="flex items-center rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#425466] transition hover:bg-[#f7f8fa] hover:text-[#0a2540]"
            >
              Findings
            </Link>


           

            <Link
              href="/reports"
              className="flex items-center rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#425466] transition hover:bg-[#f7f8fa] hover:text-[#0a2540]"
            >
              Reports
            </Link>


            <div className="my-2 border-t border-[#edf0f3]" />


            <Link
              href="/upload"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#635bff] transition hover:bg-[#f0efff]"
            >

              <span>
                New analysis
              </span>

              <ArrowRight size={14} />

            </Link>

          </div>

        </div>

      </div>


      {/* SIGN IN */}
      <Link
        href="/sign-in"
        className="hidden px-2 py-2 text-[14px] font-medium text-[#425466] transition hover:text-[#0a2540] sm:block"
      >
        Sign in
      </Link>


      {/* RUN ANALYSIS */}
      <Link
        href="/upload"
        className="group flex items-center gap-2 rounded-lg bg-[#0a2540] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#163a5c]"
      >

        Run analysis

        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5"
        />

      </Link>

    </div>

  </div>
</nav>
          HERO
      ========================================================= *

      <section className="relative overflow-hidden border-b border-[#d9dee7]">

        <div className="absolute left-1/2 top-[-260px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#635bff]/8 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1240px] gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">

          {/* HERO COPY */}

          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cdd5df] bg-white px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#425466] shadow-sm">

              <span className="h-1.5 w-1.5 rounded-full bg-[#635bff]" />

              Revenue intelligence

            </div>


            <h1 className="max-w-[720px] text-[52px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#0a2540] sm:text-[64px] lg:text-[76px]">

              Find the revenue

              <br />

              <span className="text-[#635bff]">
                slipping through.
              </span>

            </h1>


            <p className="mt-7 max-w-[610px] text-[18px] leading-8 text-[#425466] sm:text-[20px]">

              Revenue Guard analyzes your billing, CRM, payment and usage data

              to uncover revenue leakage — without replacing the systems you

              already use.

            </p>


            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/upload"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#635bff] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(99,91,255,0.2)] transition hover:bg-[#5148e5]"
              >

                Run your first analysis

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />

              </Link>


              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#cdd5df] bg-white px-5 py-3.5 text-[15px] font-semibold text-[#0a2540] transition hover:border-[#aeb8c5] hover:bg-[#fbfcfd]"
              >

                See how it works

                <ChevronRight size={16} />

              </a>

            </div>


            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-[#66788a]">

              <span className="flex items-center gap-2">
                <Check size={15} className="text-[#635bff]" />
                No migration
              </span>

              <span className="flex items-center gap-2">
                <Check size={15} className="text-[#635bff]" />
                Works with CSV exports
              </span>

              <span className="flex items-center gap-2">
                <Check size={15} className="text-[#635bff]" />
                Start with existing data
              </span>

            </div>

          </div>


          {/* HERO PRODUCT CARD */}

          <div className="relative">

            <div className="absolute -inset-5 rounded-[32px] bg-[#635bff]/8 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-[#d7dce4] bg-white shadow-[0_30px_80px_rgba(10,37,64,0.12)]">

              {/* BROWSER TOP */}

              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">

                <div className="flex items-center gap-2">

                  <div className="h-2.5 w-2.5 rounded-full bg-[#d7dce4]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#d7dce4]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#d7dce4]" />

                </div>


                <div className="rounded-md bg-[#f4f6f8] px-3 py-1 text-[10px] font-medium text-[#66788a]">
                  revenue-guard.app
                </div>


                <div className="w-10" />

              </div>


              <div className="p-5 sm:p-7">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8896a5]">
                      Revenue overview
                    </p>

                    <h3 className="mt-2 text-[25px] font-semibold tracking-[-0.035em] text-[#0a2540]">
                      Revenue at risk
                    </h3>

                  </div>


                  <div className="rounded-lg bg-[#f0efff] px-3 py-2 text-[11px] font-semibold text-[#635bff]">
                    Latest analysis
                  </div>

                </div>


                <div className="mt-7 rounded-xl bg-[#f7f8fa] p-5">

                  <p className="text-[12px] font-medium text-[#66788a]">
                    Estimated revenue leakage
                  </p>


                  <div className="mt-1 flex items-end justify-between gap-4">

                    <p className="text-[38px] font-semibold tracking-[-0.045em] text-[#0a2540]">
                      ₹16.70L
                    </p>

                    <span className="mb-1 rounded-md bg-[#fff2e8] px-2 py-1 text-[11px] font-semibold text-[#c65d14]">
                      119 findings
                    </span>

                  </div>


                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e2e6ec]">
                    <div className="h-full w-[72%] rounded-full bg-[#635bff]" />
                  </div>


                  <div className="mt-2 flex justify-between text-[10px] text-[#8896a5]">
                    <span>Revenue identified</span>
                    <span>66 affected accounts</span>
                  </div>

                </div>


                <div className="mt-5 grid grid-cols-2 gap-3">

                  <MiniMetric
                    label="Failed payments"
                    value="₹8.80L"
                  />

                  <MiniMetric
                    label="Usage leakage"
                    value="₹2.13L"
                  />

                  <MiniMetric
                    label="Seat overages"
                    value="₹2.11L"
                  />

                  <MiniMetric
                    label="Other leakage"
                    value="₹3.66L"
                  />

                </div>


                <div className="mt-5 rounded-xl border border-[#e5e9ef] bg-white p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-[11px] font-semibold text-[#425466]">
                      Detection engine
                    </span>

                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2e7d5b]">

                      <span className="h-1.5 w-1.5 rounded-full bg-[#2e7d5b]" />

                      Analysis complete

                    </span>

                  </div>


                  <div className="mt-3 grid grid-cols-6 gap-1.5">

                    {Array.from({ length: 6 }).map((_, i) => (

                      <div
                        key={i}
                        className="h-1.5 rounded-full bg-[#635bff]"
                      />

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          TRUST / POSITIONING
      ========================================================= */}

      <section
        id="product"
        className="border-b border-[#d9dee7] bg-white"
      >

        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>

              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#635bff]">
                Built around your existing stack
              </p>

              <h2 className="mt-3 max-w-[450px] text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[#0a2540] sm:text-[40px]">
                Your revenue already flows through multiple systems.
              </h2>

            </div>


            <div className="grid gap-3 sm:grid-cols-3">

              <StackCard
                title="CRM"
                subtitle="Customers & deals"
              />

              <StackCard
                title="Usage"
                subtitle="Product activity"
              />

              <StackCard
                title="Billing"
                subtitle="Invoices & plans"
              />

              <StackCard
                title="Payments"
                subtitle="Collections"
              />

              <StackCard
                title="Revenue Guard"
                subtitle="Find the gaps"
                highlight
              />

              <StackCard
                title="Finance"
                subtitle="Recover revenue"
              />

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          REVENUE FLOW
      ========================================================= */}

      <section className="overflow-hidden bg-[#0a2540] text-white">

        <div className="mx-auto max-w-[1240px] px-6 py-20 lg:px-8 lg:py-24">

          <div className="max-w-[680px]">

            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a8a3ff]">
              Revenue infrastructure
            </p>


            <h2 className="mt-4 text-[38px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[52px]">

              Revenue gets lost between systems.

              <br />

              <span className="text-[#a8a3ff]">
                Revenue Guard finds the gaps.
              </span>

            </h2>


            <p className="mt-6 max-w-[600px] text-[17px] leading-8 text-[#aebdca]">

              A customer can be using more seats, consuming more product,

              sitting on an expired discount or have a failed payment — while

              your systems continue operating as if everything is normal.

            </p>

          </div>


          <div className="mt-14 overflow-x-auto pb-4">

            <div className="flex min-w-[850px] items-center justify-between gap-3">

              <FlowNode
                title="Contracts"
                subtitle="What was agreed"
              />

              <FlowArrow />

              <FlowNode
                title="CRM"
                subtitle="Who bought it"
              />

              <FlowArrow />

              <FlowNode
                title="Usage"
                subtitle="What they used"
              />

              <FlowArrow />

              <FlowNode
                title="Billing"
                subtitle="What was charged"
              />

              <FlowArrow />

              <FlowNode
                title="Payment"
                subtitle="What was collected"
              />

            </div>

          </div>


          <div className="mt-8 flex items-center justify-center">

            <div className="flex flex-col items-center">

              <div className="h-10 w-px bg-[#40566c]" />


              <div className="rounded-xl border border-[#435970] bg-[#102f4b] px-7 py-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)]">

                <div className="flex items-center justify-center gap-2">

                  <CircleDollarSign
                    size={19}
                    className="text-[#a8a3ff]"
                  />

                  <span className="font-semibold">
                    Revenue Guard
                  </span>

                </div>


                <p className="mt-1 text-[12px] text-[#aebdca]">
                  Compare → Detect → Quantify
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section
        id="how-it-works"
        className="border-b border-[#d9dee7] bg-[#f7f8fa]"
      >

        <div className="mx-auto max-w-[1240px] px-6 py-20 lg:px-8 lg:py-24">

          <div className="max-w-[650px]">

            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#635bff]">
              How it works
            </p>


            <h2 className="mt-3 text-[38px] font-semibold leading-tight tracking-[-0.045em] text-[#0a2540] sm:text-[48px]">
              From raw exports to actionable leakage.
            </h2>

          </div>


          <div className="mt-14 grid gap-5 md:grid-cols-3">

            {steps.map((step) => (

              <div
                key={step.number}
                className="rounded-2xl border border-[#d9dee7] bg-white p-7 shadow-[0_8px_30px_rgba(10,37,64,0.04)]"
              >

                <span className="text-[12px] font-bold tracking-[0.12em] text-[#635bff]">
                  {step.number}
                </span>


                <h3 className="mt-7 text-[22px] font-semibold tracking-[-0.025em] text-[#0a2540]">
                  {step.title}
                </h3>


                <p className="mt-3 text-[15px] leading-7 text-[#66788a]">
                  {step.description}
                </p>


                {step.number === "01" && (

                  <div className="mt-7 flex items-center gap-3 rounded-lg bg-[#f7f8fa] p-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                      <Upload
                        size={17}
                        className="text-[#635bff]"
                      />
                    </div>


                    <div>

                      <p className="text-[12px] font-semibold text-[#0a2540]">
                        billing_export.csv
                      </p>

                      <p className="text-[10px] text-[#8896a5]">
                        Ready to analyze
                      </p>

                    </div>

                  </div>

                )}


                {step.number === "02" && (

                  <div className="mt-7 rounded-lg bg-[#f7f8fa] p-4">

                    <div className="flex items-center justify-between text-[11px]">

                      <span className="font-semibold text-[#425466]">
                        Detection engine
                      </span>

                      <span className="text-[#635bff]">
                        6 checks
                      </span>

                    </div>


                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4e8ed]">

                      <div className="h-full w-full rounded-full bg-[#635bff]" />

                    </div>

                  </div>

                )}


                {step.number === "03" && (

                  <div className="mt-7 rounded-lg bg-[#f7f8fa] p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-[11px] font-semibold text-[#425466]">
                        Revenue at risk
                      </span>

                      <span className="text-[16px] font-semibold text-[#0a2540]">
                        ₹16.70L
                      </span>

                    </div>


                    <p className="mt-2 text-[10px] text-[#8896a5]">
                      119 findings across 66 accounts
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================================================
          LEAKAGE TYPES
      ========================================================= */}

      <section
        id="leakage"
        className="border-b border-[#d9dee7] bg-white"
      >

        <div className="mx-auto max-w-[1240px] px-6 py-20 lg:px-8 lg:py-24">

          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">

            <div className="max-w-[650px]">

              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#635bff]">
                Detection engine
              </p>


              <h2 className="mt-3 text-[38px] font-semibold leading-tight tracking-[-0.045em] text-[#0a2540] sm:text-[48px]">
                Six ways revenue can slip through.
              </h2>


              <p className="mt-5 text-[16px] leading-7 text-[#66788a]">

                Revenue Guard turns messy operational data into specific,

                measurable revenue leakage.

              </p>

            </div>


            <Link
              href="/upload"
              className="group inline-flex w-fit items-center gap-2 text-[14px] font-semibold text-[#635bff]"
            >

              Run an analysis

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />

            </Link>

          </div>


          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#d9dee7] bg-[#d9dee7] sm:grid-cols-2 lg:grid-cols-3">

            {leakageTypes.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="group bg-white p-7 transition hover:bg-[#fbfcff]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0efff] text-[#635bff]">
                      <Icon size={19} />
                    </div>


                    <span className="text-[13px] font-semibold text-[#0a2540]">
                      {item.amount}
                    </span>

                  </div>


                  <h3 className="mt-7 text-[18px] font-semibold tracking-[-0.02em] text-[#0a2540]">
                    {item.title}
                  </h3>


                  <p className="mt-2 text-[14px] leading-6 text-[#66788a]">
                    {item.description}
                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =========================================================
          PRODUCT METRICS
      ========================================================= */}

      <section className="border-b border-[#d9dee7] bg-[#f7f8fa]">

        <div className="mx-auto max-w-[1240px] px-6 py-20 lg:px-8 lg:py-24">

          <div className="rounded-3xl bg-[#0a2540] p-8 text-white sm:p-12 lg:p-16">

            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">

              <div>

                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a8a3ff]">
                  See the money
                </p>


                <h2 className="mt-4 text-[38px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[48px]">

                  Don't just find anomalies.

                  <br />

                  <span className="text-[#a8a3ff]">
                    Quantify the impact.
                  </span>

                </h2>


                <p className="mt-6 max-w-[510px] text-[16px] leading-7 text-[#aebdca]">

                  Every finding is tied to an estimated revenue impact,

                  affected account, evidence and recommended next action.

                </p>

              </div>


              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#304b63] bg-[#304b63]">

                <DarkMetric
                  value="₹16.70L"
                  label="Revenue at risk"
                />

                <DarkMetric
                  value="119"
                  label="Findings detected"
                />

                <DarkMetric
                  value="66"
                  label="Accounts affected"
                />

                <DarkMetric
                  value="6"
                  label="Leakage categories"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          SECURITY
      ========================================================= */}

      <section
        id="security"
        className="border-b border-[#d9dee7] bg-white"
      >

        <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">

          <div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0efff] text-[#635bff]">
              <ShieldCheck size={21} />
            </div>


            <h2 className="mt-6 text-[36px] font-semibold leading-tight tracking-[-0.04em] text-[#0a2540] sm:text-[44px]">
              Start with the data you already have.
            </h2>


            <p className="mt-5 max-w-[540px] text-[16px] leading-7 text-[#66788a]">

              Revenue Guard is designed to sit alongside your existing

              billing, CRM and payment systems — not replace them.

            </p>

          </div>


          <div className="grid gap-3">

            {[
              "No billing migration required",
              "CSV-based analysis to start",
              "Clear evidence behind every finding",
              "Actionable recommendations for Finance and RevOps",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-4 rounded-xl border border-[#d9dee7] bg-[#f7f8fa] p-5"
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#635bff] shadow-sm">
                  <Check size={15} />
                </div>


                <span className="text-[14px] font-semibold text-[#0a2540]">
                  {item}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="overflow-hidden bg-[#f7f8fa]">

        <div className="relative mx-auto max-w-[1000px] px-6 py-24 text-center lg:py-32">

          <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#635bff]/8 blur-3xl" />


          <div className="relative">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#635bff] text-white shadow-[0_8px_25px_rgba(99,91,255,0.25)]">
              <Zap size={22} />
            </div>


            <h2 className="mx-auto mt-7 max-w-[800px] text-[42px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#0a2540] sm:text-[58px]">

              Find the revenue

              <br />

              you&apos;re already earning.

            </h2>


            <p className="mx-auto mt-6 max-w-[570px] text-[17px] leading-7 text-[#66788a]">

              Upload a billing export and see what Revenue Guard can uncover

              in your revenue data.

            </p>


            <Link
              href="/upload"
              className="group mt-9 inline-flex items-center gap-2 rounded-lg bg-[#635bff] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(99,91,255,0.2)] transition hover:bg-[#5148e5]"
            >

              Run your first analysis

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />

            </Link>


            <p className="mt-5 text-[12px] text-[#8896a5]">
              No migration required · Start with a CSV export
            </p>

          </div>

        </div>

      </section>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-[#d9dee7] bg-white">

        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div className="flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#635bff] text-white">
              <CircleDollarSign size={15} />
            </div>


            <span className="text-[14px] font-semibold text-[#0a2540]">
              Revenue Guard
            </span>

          </div>


          <p className="text-[12px] text-[#8896a5]">
            Revenue intelligence for modern businesses.
          </p>


          <div className="flex gap-5 text-[12px] font-medium text-[#66788a]">

            <Link
              href="/upload"
              className="hover:text-[#0a2540]"
            >
              Product
            </Link>

            <Link
              href="/sign-in"
              className="hover:text-[#0a2540]"
            >
              Sign in
            </Link>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   SMALL REUSABLE UI COMPONENTS
========================================================= */

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e9ef] bg-white p-4">

      <p className="text-[10px] font-medium text-[#8896a5]">
        {label}
      </p>

      <p className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#0a2540]">
        {value}
      </p>

    </div>
  );
}


function StackCard({
  title,
  subtitle,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-[#635bff]/30 bg-[#f0efff]"
          : "border-[#d9dee7] bg-[#f7f8fa]"
      }`}
    >

      <p
        className={`text-[14px] font-semibold ${
          highlight
            ? "text-[#635bff]"
            : "text-[#0a2540]"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-[11px] text-[#8896a5]">
        {subtitle}
      </p>

    </div>
  );
}


function FlowNode({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-w-[130px] rounded-xl border border-[#304b63] bg-[#102f4b] px-5 py-4">

      <p className="text-[14px] font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-[#8fa5b8]">
        {subtitle}
      </p>

    </div>
  );
}


function FlowArrow() {
  return (
    <ArrowRight
      size={17}
      className="shrink-0 text-[#637b91]"
    />
  );
}


function DarkMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="bg-[#102f4b] p-6 sm:p-7">

      <p className="text-[28px] font-semibold tracking-[-0.04em] text-white sm:text-[34px]">
        {value}
      </p>

      <p className="mt-2 text-[12px] text-[#8fa5b8]">
        {label}
      </p>

    </div>
  );
}