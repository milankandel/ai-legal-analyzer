"use client";

import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Scale,
  ArrowRight,
  Zap,
  Lock,
  TrendingDown,
} from "lucide-react";
import { RiskGauge } from "@/components/contract/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

const SAMPLE_CLAUSES = [
  {
    title: "Indemnification",
    risk: "HIGH" as const,
    score: 8.5,
    plain: "You agree to pay all legal costs if someone sues them because of how you use their software — with virtually unlimited exposure.",
  },
  {
    title: "Limitation of Liability",
    risk: "HIGH" as const,
    score: 7.8,
    plain: "Maximum they'll ever pay you is 3 months of fees — even if a data breach costs you $500,000.",
  },
  {
    title: "Confidentiality",
    risk: "LOW" as const,
    score: 3.5,
    plain: "Standard mutual confidentiality obligations. Both sides protect each other's information for 3 years.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Risk Scoring",
    description: "Every clause scored 1-10 with HIGH/MEDIUM/LOW categories. See your exposure at a glance.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: FileText,
    title: "Plain English Explanations",
    description: "No legal jargon. Every clause explained in simple language anyone can understand.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: TrendingDown,
    title: "Negotiation Playbook",
    description: "Specific language changes to request. Know exactly what to ask for and why.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Lock,
    title: "Missing Clause Detection",
    description: "Find what's absent compared to industry standards — before you sign.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5 mb-6">
                <AlertTriangle className="w-3 h-3" />
                For informational purposes only — not legal advice
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Understand Any Contract in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Minutes
                </span>
                {" "}— Not Hours
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                AI-powered contract analysis that identifies risk, explains every clause in plain
                English, and tells you exactly what to negotiate. Upload your PDF or DOCX and get
                a complete risk report in under 60 seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Analyze Your Contract
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  View Demo
                  <FileText className="w-5 h-5" />
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6">
                {[
                  { icon: CheckCircle, text: "15 clause types detected" },
                  { icon: CheckCircle, text: "Negotiation tips included" },
                  { icon: CheckCircle, text: "Free demo contract" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                    <Icon className="w-4 h-4 text-green-400 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Heat Map Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-white">SaaS Subscription Agreement</h3>
                  <p className="text-xs text-slate-500">AcmeCorp_Contract_2024.pdf</p>
                </div>
                <Badge variant="high">HIGH RISK</Badge>
              </div>

              <div className="flex items-center justify-center py-4 mb-6">
                <RiskGauge score={6.2} size="md" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "HIGH", count: 3, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                  { label: "MEDIUM", count: 6, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "LOW", count: 6, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} className={`border rounded-lg p-3 text-center ${bg}`}>
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sample clauses */}
              <div className="space-y-2">
                {SAMPLE_CLAUSES.map((clause) => (
                  <div
                    key={clause.title}
                    className={`border rounded-lg p-3 ${
                      clause.risk === "HIGH"
                        ? "bg-red-500/10 border-red-500/20"
                        : clause.risk === "LOW"
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{clause.title}</span>
                      <span className={`text-xs font-bold ${
                        clause.risk === "HIGH" ? "text-red-400" : clause.risk === "LOW" ? "text-green-400" : "text-amber-400"
                      }`}>
                        {clause.score}/10
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{clause.plain}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need to review a contract
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built for founders, business owners, and anyone who signs contracts — not just lawyers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload your contract",
                description: "Drag and drop a PDF or DOCX. We support any type of legal agreement.",
                icon: FileText,
              },
              {
                step: "02",
                title: "AI analyzes every clause",
                description: "Claude AI reads and scores each clause for risk. Usually takes under 60 seconds.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Get your risk report",
                description: "Review plain-English explanations, risk scores, and negotiation talking points.",
                icon: Shield,
              },
            ].map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="relative w-16 h-16 bg-blue-600/20 border border-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-blue-400" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{step.slice(-1)}</span>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to understand your contract?
          </h2>
          <p className="text-slate-400 mb-8">
            Try the demo with a pre-analyzed SaaS contract, or upload your own.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Get Started — Free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-12 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left">
            <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80 leading-relaxed">
              <strong className="text-amber-300">Legal Disclaimer:</strong> {LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
