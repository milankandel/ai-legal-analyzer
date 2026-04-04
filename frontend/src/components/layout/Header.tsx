"use client";

import Link from "next/link";
import { Scale, Shield, AlertTriangle } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-white">LegalAI</span>
            <span className="text-blue-400">Analyzer</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/compare" className="hover:text-white transition-colors">
              Compare
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Not legal advice</span>
            </div>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Analyze Contract
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
