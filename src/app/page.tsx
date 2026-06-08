"use client";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export default function Home() {

  const { isSignedIn } = useUser();
  return (
    <main
  className={`${manrope.className} min-h-screen p-12 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 `}
>

  

     <nav className="max-w-7xl mx-auto flex items-center justify-between py-6 border-b border-zinc-800 mb-20">

  <Link href="/">
    <h1 className="text-3xl font-extrabold tracking-tight">
      Revenue Guard
    </h1>
  </Link>

  <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
    <Link href="/dashboard" className="hover:text-white transition">
      Dashboard
    </Link>

    <Link href="/upload" className="hover:text-white transition">
      Upload
    </Link>

    <Link href="/reports" className="hover:text-white transition">
      Reports
    </Link>

    <Link href="/findings" className="hover:text-white transition">
      Findings
    </Link>
  </div>


  <div className="flex items-center gap-3">
    {isSignedIn ? (
      <UserButton />
    ) : (
      <>
        <SignInButton mode="modal">
          <button className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-900 transition">
            Login
          </button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">
            Sign Up
          </button>
        </SignUpButton>
      </>
    )}
  </div>
  

</nav>

<section className="max-w-7xl mx-auto py-24">

  <div className="max-w-4xl mx-auto text-center">

    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8">
      Detect Revenue Leakage
      <span className="text-indigo-500"> Before It Impacts Growth</span>
    </h1>

    <p className="text-xl text-zinc-400 mb-10">
      Automatically uncover failed payments, seat overages,
      expired discounts and CRM mismatches before they cost
      your business revenue.
    </p>

    <div className="flex justify-center gap-4">
      ...
    </div>

  </div>

</section>
      <section className="max-w-6xl mx-auto">

       

        <p className="text-xl text-gray-400 mb-8">
          Detect billing leaks before they cost your
          company thousands every month.
        </p>

        <div className="flex gap-4 mb-16">
          <Link href="/upload">
            <button className="border px-6 py-3 rounded-lg">
              Upload CSV
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="border px-6 py-3 rounded-lg">
              View Dashboard
            </button>
          </Link>
        </div>

      

        <div className="grid md:grid-cols-3 gap-6 mb-20">

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <h3 className="text-gray-400">
              Revenue Recovered
            </h3>

            <p className="text-4xl font-bold mt-2">
              CSV Analysis
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <h3 className="text-gray-400">
              Leak Types
            </h3>

            <p className="text-4xl font-bold mt-2">
              5
            </p>
          </div>

<div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <h3 className="text-gray-400">
              Accounts Analyzed
            </h3>

            <p className="text-4xl font-bold mt-2">
              Revenue Monitoring
            </p>
          </div>

        </div>

 

        <h2 className="text-3xl font-bold mb-8">
          Leakage Detection Engines
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-20">

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <h3 className="font-bold text-xl">
              Seat Overages
            </h3>

            <p className="text-gray-400 mt-3">
              Find customers using more seats than
              they pay for.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <h3 className="font-bold text-xl">
              Failed Payments
            </h3>

            <p className="text-gray-400 mt-3">
              Detect unpaid invoices and missed
              collections.
            </p>
          </div>

       

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <h3 className="font-bold text-xl">
              Expired Discounts
            </h3>

            <p className="text-gray-400 mt-3">
              Detect discounts that should have
              ended long ago.
            </p>
          </div>

         
<div className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/70 hover:-translate-y-1">
            <h3 className="font-bold text-xl">
              CRM Mismatch
            </h3>

            <p className="text-gray-400 mt-3">
              Compare CRM and billing systems for
              missing accounts.
            </p>
          </div>

         
<div className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/70 hover:-translate-y-1">
            <h3 className="font-bold text-xl">
              Usage Undercounting
            </h3>

            <p className="text-gray-400 mt-3">
              Find customers consuming more than
              they are billed for.
            </p>
          </div>

        </div>


        <h2 className="text-3xl font-bold mb-8">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
<div className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/70 hover:-translate-y-1">
            <h3 className="font-bold text-xl mb-2">
              1. Upload CSV
            </h3>

            <p className="text-gray-400">
              Upload billing, CRM, payment or usage
              data.
            </p>
          </div>
<div className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/70 hover:-translate-y-1">
            <h3 className="font-bold text-xl mb-2">
              2. Detect Leaks
            </h3>

            <p className="text-gray-400">
              Revenue Guard automatically scans for
              leakage patterns.
            </p>
          </div>

         <div className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/70 hover:-translate-y-1">
            <h3 className="font-bold text-xl mb-2">
              3. Recover Revenue
            </h3>

            <p className="text-gray-400">
              View findings and take action before
              revenue is lost.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}