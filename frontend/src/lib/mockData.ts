import { Contract, ContractAnalysis } from "./api";

export const mockContract: Contract = {
  id: "demo-contract-001",
  filename: "AcmeCorp_SaaS_Subscription_Agreement_2024.pdf",
  contract_type: "saas",
  parties: ["AcmeCorp Inc. (Provider)", "TechStartup LLC (Subscriber)"],
  effective_date: "January 1, 2025",
  term: "12 months, auto-renewing",
  governing_law: "State of Delaware, United States",
  analyzed: true,
  uploaded_at: "2025-01-15T10:30:00Z",
  clauses: [
    {
      id: "clause-1",
      clause_type: "indemnification",
      title: "Mutual Indemnification",
      page_number: 4,
      text: "Subscriber shall indemnify, defend, and hold harmless Provider and its officers, directors, employees, agents, and successors from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) Subscriber's use of the Service; (b) Subscriber's breach of this Agreement; (c) any third-party claims arising from Subscriber's Data or Subscriber's business operations. Provider's indemnification obligations shall be limited solely to claims arising from Provider's gross negligence or willful misconduct.",
      plain_english: "You (the subscriber) agree to pay for any legal costs if someone sues the company because of how you use their software. The company only covers you if they were extremely careless or acted intentionally to cause harm — a very high bar that rarely applies.",
      risk_assessment: {
        clause_id: "clause-1",
        risk_score: 8.5,
        risk_level: "HIGH",
        concern: "Heavily one-sided indemnification favoring the provider",
        recommendation: "Negotiate for mutual indemnification with equivalent obligations on both sides",
        issue_description: "Subscriber bears unlimited indemnification while Provider's obligations are narrowly limited to gross negligence or willful misconduct",
        why_risky: "You could be liable for any third-party claim related to your use, even for issues partially caused by the Provider's software. Your exposure is unlimited while theirs is minimal.",
        negotiation_suggestion: "Request symmetric language: each party indemnifies the other for their own negligence. Specifically add: 'Provider shall indemnify Subscriber for claims arising from defects in the Service or Provider's breach of this Agreement.'"
      }
    },
    {
      id: "clause-2",
      clause_type: "limitation_of_liability",
      title: "Limitation of Liability",
      page_number: 5,
      text: "IN NO EVENT SHALL PROVIDER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, LOSS OF BUSINESS, OR LOSS OF GOODWILL, EVEN IF PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. PROVIDER'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE FEES PAID BY SUBSCRIBER IN THE THREE (3) MONTHS PRECEDING THE CLAIM.",
      plain_english: "If the software fails and you lose money, data, or business opportunities, the company won't pay for those losses. The maximum they'll ever pay you is what you paid them in the last 3 months — so if you pay $1,000/month, they can only owe you $3,000 max, regardless of how much you lost.",
      risk_assessment: {
        clause_id: "clause-2",
        risk_score: 7.8,
        risk_level: "HIGH",
        concern: "Extremely low liability cap (3 months of fees) with broad exclusions",
        recommendation: "Negotiate for a 12-month fee cap minimum and carve-outs for data breaches and security incidents",
        issue_description: "The 3-month cap provides minimal protection if you rely heavily on the service. Consequential damages exclusion means no recovery for business losses.",
        why_risky: "If a data breach or service outage causes $500,000 in business losses but you only paid $500/month, you can only recover $1,500. This creates massive asymmetric risk.",
        negotiation_suggestion: "Request: (1) minimum 12-month fee cap, (2) carve-out for data breaches — 'notwithstanding the foregoing, liability cap shall not apply to breaches of confidentiality or data security obligations', (3) mutual application of liability caps."
      }
    },
    {
      id: "clause-3",
      clause_type: "IP_ownership",
      title: "Intellectual Property Rights",
      page_number: 6,
      text: "All intellectual property rights in and to the Service, including all modifications, enhancements, and derivative works, shall remain exclusively with Provider. Subscriber hereby grants Provider a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, and incorporate any feedback, suggestions, or ideas provided by Subscriber for any purpose without compensation.",
      plain_english: "Any ideas or feedback you give them about improving their software — they own forever and don't have to pay you for it. If you suggest a feature that becomes their best product, you get nothing.",
      risk_assessment: {
        clause_id: "clause-3",
        risk_score: 7.2,
        risk_level: "HIGH",
        concern: "Perpetual, irrevocable feedback license without compensation",
        recommendation: "Limit feedback license to improving the Service only, exclude competitive use",
        issue_description: "Provider gains perpetual rights to all ideas you share, which could be used to compete with you or sold to competitors",
        why_risky: "Any product ideas, workflow improvements, or integration suggestions you share become theirs forever. This could inadvertently hand over proprietary business insights.",
        negotiation_suggestion: "Add: 'Such feedback license is limited to improving the Service provided to Subscriber and shall not be used to develop competing products or shared with Subscriber's competitors.' Also remove 'irrevocable' or add a sunset clause."
      }
    },
    {
      id: "clause-4",
      clause_type: "non_compete",
      title: "Non-Solicitation",
      page_number: 8,
      text: "During the term of this Agreement and for a period of twenty-four (24) months following termination, Subscriber shall not directly or indirectly solicit, recruit, or hire any employee or contractor of Provider who was involved in providing the Service to Subscriber.",
      plain_english: "For 2 years after you stop using the service, you can't hire any of their employees who worked on your account — even if those employees reach out to you first.",
      risk_assessment: {
        clause_id: "clause-4",
        risk_score: 6.0,
        risk_level: "MEDIUM",
        concern: "24-month non-solicitation period is unusually long",
        recommendation: "Negotiate down to 12 months and add a 'passive' recruitment exception",
        issue_description: "Standard non-solicitation periods are typically 12 months. 24 months significantly limits your ability to hire talent.",
        why_risky: "You could lose access to experienced professionals even when they independently seek employment with you.",
        negotiation_suggestion: "Reduce to 12 months. Add: 'This restriction shall not apply to employees who respond to general public advertisements or are independently recruited without targeted solicitation.'"
      }
    },
    {
      id: "clause-5",
      clause_type: "termination",
      title: "Termination for Convenience",
      page_number: 9,
      text: "Provider may terminate this Agreement for any reason upon thirty (30) days written notice to Subscriber. Subscriber may only terminate this Agreement at the end of a subscription term by providing sixty (60) days prior written notice. Early termination by Subscriber shall result in payment of all remaining fees for the current subscription term.",
      plain_english: "They can cancel your account with just 30 days notice for any reason. But if you want to cancel, you must give 60 days notice and can only cancel at the end of your subscription period — and if you cancel early, you still owe all the remaining fees.",
      risk_assessment: {
        clause_id: "clause-5",
        risk_score: 6.5,
        risk_level: "MEDIUM",
        concern: "Asymmetric termination rights and onerous early termination fees",
        recommendation: "Request equal termination notice periods and a data export window before termination",
        issue_description: "Provider has easy exit while Subscriber faces penalties for early termination and must give twice as much notice",
        why_risky: "Provider can suddenly terminate with 30 days notice, disrupting your operations, while you're locked in with financial penalties for early exit.",
        negotiation_suggestion: "Request: (1) Equal 30-day notice for both parties, (2) 'Data Export Period' of 30 days after notice, (3) Pro-rata refund for prepaid fees on Provider-initiated termination, (4) Termination for cause carve-out with no early termination fees."
      }
    },
    {
      id: "clause-6",
      clause_type: "confidentiality",
      title: "Confidentiality Obligations",
      page_number: 10,
      text: "Each party agrees to maintain the confidentiality of the other party's Confidential Information using at least the same degree of care it uses to protect its own confidential information, but no less than reasonable care. This obligation shall survive termination for a period of three (3) years.",
      plain_english: "Both sides must keep each other's private information secret, treating it at least as carefully as their own secrets. This duty continues for 3 years after the contract ends.",
      risk_assessment: {
        clause_id: "clause-6",
        risk_score: 3.5,
        risk_level: "LOW",
        concern: "Standard confidentiality language with reasonable 3-year survival",
        recommendation: "Consider extending survival period for trade secrets to 'indefinitely'",
        issue_description: "Generally balanced and standard. Consider whether 3-year period is sufficient for sensitive business information.",
        why_risky: "Minimal risk. Industry-standard mutual confidentiality obligations.",
        negotiation_suggestion: "Add: 'Notwithstanding the foregoing, obligations with respect to trade secrets shall survive indefinitely.' This protects your most sensitive information beyond 3 years."
      }
    },
    {
      id: "clause-7",
      clause_type: "payment",
      title: "Payment Terms and Late Fees",
      page_number: 3,
      text: "Subscriber shall pay all fees within fifteen (15) days of invoice date. Late payments shall accrue interest at the rate of 1.5% per month (18% annually) from the due date until paid. Provider reserves the right to suspend Service immediately upon payment default without notice.",
      plain_english: "You must pay within 15 days of getting an invoice. If you're late, you'll be charged 18% annual interest. They can shut off your access immediately if you don't pay — no warning required.",
      risk_assessment: {
        clause_id: "clause-7",
        risk_score: 5.5,
        risk_level: "MEDIUM",
        concern: "Immediate service suspension without notice creates operational risk",
        recommendation: "Negotiate for a grace period and cure opportunity before suspension",
        issue_description: "Immediate suspension without notice could disrupt critical business operations for minor payment delays",
        why_risky: "A billing error or bank delay could result in complete service cutoff without warning, potentially disrupting customer-facing operations.",
        negotiation_suggestion: "Request: '...suspend Service upon [10] days written notice and opportunity to cure following payment default.' Also negotiate: 'Interest shall not accrue if payment is received within 5 business days after due date.'"
      }
    },
    {
      id: "clause-8",
      clause_type: "dispute_resolution",
      title: "Dispute Resolution and Arbitration",
      page_number: 12,
      text: "Any dispute arising out of or relating to this Agreement shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) in San Francisco, California, under its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator. Each party shall bear its own costs.",
      plain_english: "If there's a disagreement, you can't sue in court — you must go to private arbitration in San Francisco, California. You each pay your own legal costs, and the decision is final with very limited appeals.",
      risk_assessment: {
        clause_id: "clause-8",
        risk_score: 4.5,
        risk_level: "MEDIUM",
        concern: "Mandatory arbitration with geographic limitation may be burdensome",
        recommendation: "Negotiate for virtual arbitration or home jurisdiction option for disputes under threshold",
        issue_description: "Requiring arbitration in San Francisco imposes travel costs on non-California companies. Arbitration limits class action rights.",
        why_risky: "If you're not in California, you'll spend significant money just to travel to arbitration. Arbitration can also favor repeat players (the provider) over one-time claimants.",
        negotiation_suggestion: "Request: (1) Remote arbitration option via videoconference, (2) For disputes under $50,000, allow small claims court in Subscriber's jurisdiction, (3) Add class action waiver carve-out for consumer protection claims."
      }
    },
    {
      id: "clause-9",
      clause_type: "governing_law",
      title: "Governing Law",
      page_number: 12,
      text: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws provisions. The parties consent to exclusive jurisdiction and venue in the state and federal courts located in New Castle County, Delaware.",
      plain_english: "Delaware law applies to this contract, and any lawsuits must be filed in Delaware courts. Even if you're based in another state, you'd need to litigate there.",
      risk_assessment: {
        clause_id: "clause-9",
        risk_score: 3.0,
        risk_level: "LOW",
        concern: "Delaware jurisdiction standard for incorporated entities",
        recommendation: "Acceptable if your company is Delaware-incorporated; negotiate for mutual home venue otherwise",
        issue_description: "Delaware is a common and generally neutral choice for business contracts. Risk is low for Delaware entities.",
        why_risky: "Low risk for most businesses. Delaware courts are experienced in commercial disputes.",
        negotiation_suggestion: "If not incorporated in Delaware, request: 'Jurisdiction shall be the state where Subscriber maintains its principal place of business, or Delaware, at Subscriber's election.'"
      }
    },
    {
      id: "clause-10",
      clause_type: "force_majeure",
      title: "Force Majeure",
      page_number: 13,
      text: "Neither party shall be liable for any delay or failure to perform its obligations under this Agreement to the extent such delay or failure is caused by circumstances beyond that party's reasonable control, including acts of God, natural disasters, pandemic, government action, or failure of internet infrastructure. Provider's obligation to refund prepaid fees shall be suspended during any force majeure event.",
      plain_english: "Neither side is responsible for problems caused by events outside their control (like disasters or government shutdowns). Importantly, if the Provider can't deliver the service due to such events, they don't have to give you a refund for time you couldn't use it.",
      risk_assessment: {
        clause_id: "clause-10",
        risk_score: 4.0,
        risk_level: "MEDIUM",
        concern: "Force majeure suspends refund obligation, potentially trapping prepaid fees",
        recommendation: "Limit force majeure duration and add right to terminate with refund after extended outage",
        issue_description: "No time limit on force majeure means theoretically unlimited service suspension without refund",
        why_risky: "If Provider experiences prolonged outage and claims force majeure, your prepaid subscription fees could be trapped indefinitely.",
        negotiation_suggestion: "Add: 'If a force majeure event continues for more than thirty (30) days, Subscriber may terminate this Agreement and receive a pro-rata refund of all prepaid fees for unused periods.'"
      }
    },
    {
      id: "clause-11",
      clause_type: "confidentiality",
      title: "Data Privacy and Security",
      page_number: 7,
      text: "Provider shall implement commercially reasonable technical and organizational security measures to protect Subscriber's data. Provider shall process Subscriber's data only as necessary to provide the Service and in accordance with Subscriber's instructions. Provider's liability for any data breach shall be subject to the limitations set forth in Section 8 (Limitation of Liability).",
      plain_english: "The company will use reasonable security measures to protect your data and only use it to provide the service. However, if there's a data breach and your data is stolen, their financial liability is still capped by the very low liability limit in Section 8.",
      risk_assessment: {
        clause_id: "clause-11",
        risk_score: 7.0,
        risk_level: "HIGH",
        concern: "Data breach liability capped by inadequate liability limits; no breach notification timeline",
        recommendation: "Carve data breach liability out from general liability cap and specify notification obligations",
        issue_description: "Using 'commercially reasonable' measures is vague. No specific notification timeline. Breach liability capped at 3 months of fees regardless of actual harm.",
        why_risky: "If your customer data is breached, you may face regulatory fines (GDPR: up to 4% of annual revenue) while only recovering 3 months of subscription fees from the provider.",
        negotiation_suggestion: "Add: (1) 'Data breach liability is excluded from Section 8 limitations', (2) 'Provider shall notify Subscriber within 72 hours of discovering a breach', (3) 'Provider warrants compliance with applicable data protection laws including GDPR and CCPA.'"
      }
    },
    {
      id: "clause-12",
      clause_type: "payment",
      title: "Price Adjustment",
      page_number: 3,
      text: "Provider reserves the right to modify pricing for any renewal term upon thirty (30) days written notice. Continued use of the Service after the effective date of the price change constitutes acceptance of the new pricing.",
      plain_english: "They can raise your price at renewal with just 30 days notice. If you keep using the service after the new price kicks in, you're automatically agreeing to pay the higher price.",
      risk_assessment: {
        clause_id: "clause-12",
        risk_score: 5.0,
        risk_level: "MEDIUM",
        concern: "Unlimited price increases with short notice period",
        recommendation: "Negotiate a price increase cap (e.g., CPI + 5%) and longer notice period for annual contracts",
        issue_description: "No cap on price increases. 30-day notice is insufficient time to migrate to alternative solutions.",
        why_risky: "Provider could double pricing at renewal with only 30 days notice, leaving no time to evaluate alternatives.",
        negotiation_suggestion: "Request: (1) 'Price increases shall not exceed the greater of 5% or the Consumer Price Index increase for the prior year', (2) '90 days notice for price changes on annual contracts', (3) 'Subscriber may terminate without penalty if price increase exceeds cap.'"
      }
    },
    {
      id: "clause-13",
      clause_type: "termination",
      title: "Effect of Termination — Data Deletion",
      page_number: 9,
      text: "Upon termination of this Agreement for any reason, Provider shall delete all Subscriber data within thirty (30) days. Subscriber shall have access to export its data during a fifteen (15) day window following termination. Provider shall have no liability for any data deleted in accordance with this section.",
      plain_english: "When the contract ends, you have 15 days to download all your data, then they delete everything within 30 days. If they delete it, they're not responsible for any loss.",
      risk_assessment: {
        clause_id: "clause-13",
        risk_score: 4.5,
        risk_level: "MEDIUM",
        concern: "Short 15-day data export window with no liability for deletion",
        recommendation: "Negotiate for 30-day export window and data return option before deletion",
        issue_description: "15 days may be insufficient to export large datasets. No obligation to assist with data migration.",
        why_risky: "If you have large amounts of data, 15 days may not be enough time to export everything, especially if you're dealing with operational disruption from the transition.",
        negotiation_suggestion: "Request: (1) Extend data export window to 30 days, (2) 'Provider shall provide reasonable assistance with data export at no additional cost', (3) 'Data deletion shall only occur after Subscriber confirms successful export or 30-day window expires, whichever is later.'"
      }
    },
    {
      id: "clause-14",
      clause_type: "governing_law",
      title: "Entire Agreement and Amendments",
      page_number: 14,
      text: "This Agreement constitutes the entire agreement between the parties with respect to its subject matter. Provider reserves the right to modify these terms at any time by posting updated terms on its website. Continued use of the Service following such posting constitutes acceptance of the modified terms.",
      plain_english: "They can change the contract at any time just by updating their website. If you keep using the service after the changes go live, you've automatically agreed to the new terms — even if you didn't read them.",
      risk_assessment: {
        clause_id: "clause-14",
        risk_score: 3.0,
        risk_level: "LOW",
        concern: "Unilateral modification rights without direct notice",
        recommendation: "Request email notification of material changes with explicit acceptance required",
        issue_description: "Posting on website is insufficient notice for material contract changes",
        why_risky: "Contract could be materially changed without you knowing, and your continued use would be deemed acceptance.",
        negotiation_suggestion: "Add: 'Material modifications to this Agreement shall require email notice to Subscriber with 30 days advance notice. Subscriber's explicit written acceptance shall be required for any modifications that materially and adversely affect Subscriber's rights.'"
      }
    },
    {
      id: "clause-15",
      clause_type: "force_majeure",
      title: "Service Level Agreement",
      page_number: 2,
      text: "Provider shall use commercially reasonable efforts to maintain Service availability of 99.5% uptime per calendar month, excluding scheduled maintenance windows. Service credits for downtime below the SLA threshold shall be limited to a maximum of 10% of monthly fees paid. Service credits are Subscriber's sole remedy for service availability failures.",
      plain_english: "They promise 99.5% uptime (about 3.6 hours of allowed downtime per month). If they miss this, you get at most a 10% refund of that month's fee. And that's literally your only option — you can't sue for lost business due to outages.",
      risk_assessment: {
        clause_id: "clause-15",
        risk_score: 2.5,
        risk_level: "LOW",
        concern: "Service credits as sole remedy limit recourse for significant outages",
        recommendation: "Negotiate for higher SLA (99.9%) and escalating credits for extended outages",
        issue_description: "10% credit cap is minimal compensation for availability failures. 99.5% allows 3.6 hours monthly downtime.",
        why_risky: "A major outage during peak business hours could cause significant losses with only a small credit as compensation.",
        negotiation_suggestion: "Request: (1) 99.9% uptime SLA (4.4 hours downtime/year), (2) Escalating credits: 10% for <99.9%, 25% for <99.5%, 50% for <99%, (3) Termination right for repeated SLA failures in 3 consecutive months."
      }
    }
  ]
};

export const mockAnalysis: ContractAnalysis = {
  contract_id: "demo-contract-001",
  overall_risk_score: 6.2,
  risk_distribution: { HIGH: 3, MEDIUM: 6, LOW: 6 },
  clause_risks: mockContract.clauses
    .filter((c) => c.risk_assessment)
    .map((c) => c.risk_assessment!),
  missing_clauses: [
    "Limitation of Liability Cap for Data Breaches — No separate liability cap for data security incidents, leaving you exposed to unlimited liability from the general cap",
    "Data Breach Notification Timeline — No specified timeline for notifying you of security incidents (industry standard: 72 hours per GDPR)"
  ],
  key_concerns: [
    "One-sided indemnification with unlimited subscriber exposure",
    "Data breach liability capped at 3 months of fees",
    "Perpetual, irrevocable feedback license without compensation"
  ],
  summary: "This SaaS subscription agreement presents **moderate to high risk** for the subscriber (TechStartup LLC). The contract is heavily weighted in favor of AcmeCorp (the provider), particularly in three critical areas.\n\nThe most significant concerns are the **indemnification clause** (risk score: 8.5/10), which imposes unlimited liability on the subscriber while severely limiting the provider's exposure; the **data security provisions** (7/10), where breach liability is capped at a mere 3 months of fees despite potentially enormous regulatory exposure; and the **IP ownership clause** (7.2/10), which grants the provider perpetual rights to any feedback or suggestions you provide.\n\nOn the positive side, the confidentiality and governing law provisions are standard and balanced. The SLA is below industry standard (99.5% vs. the typical 99.9%), but service credits are provided.\n\n**Recommendation: Do not sign as-is.** This contract requires negotiation on at least 4 key provisions before signing. Priority negotiation targets: (1) mutual indemnification, (2) data breach liability carve-out, (3) extended liability cap, (4) symmetric termination rights.",
  analyzed_at: "2025-01-15T10:35:00Z"
};

export const DEMO_CONTRACT_ID = "demo-contract-001";
