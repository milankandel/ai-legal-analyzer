import os
import json
from typing import List, Dict
import anthropic

from models.schemas import Clause, RiskAssessment, RiskLevel, ContractAnalysis

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

HIGH_RISK_PATTERNS = {
    "indemnification": [
        "indemnify and hold harmless from any and all claims",
        "unlimited indemnification",
        "one-sided indemnity",
        "indemnify for third party claims",
    ],
    "limitation_of_liability": [
        "in no event shall",
        "excludes all liability",
        "no liability for indirect damages",
    ],
    "non_compete": [
        "perpetual non-compete",
        "worldwide non-compete",
        "broad non-solicitation",
    ],
}


async def assess_clause_risk(clause: Clause, contract_type: str = "general") -> RiskAssessment:
    """Assess risk of a single clause using Claude."""
    prompt = f"""You are a legal risk expert analyzing a {contract_type} contract clause.

Clause type: {clause.clause_type}
Clause title: {clause.title}
Clause text:
\"\"\"{clause.text}\"\"\"

Assess the risk of this clause. Return a JSON object with:
- risk_score: number from 1-10 (1=very low risk, 10=extremely high risk)
- risk_level: "HIGH" (7-10), "MEDIUM" (4-6), or "LOW" (1-3)
- concern: Brief statement of the main concern (1 sentence)
- recommendation: What to do about it (1-2 sentences)
- issue_description: Detailed description of the issue
- why_risky: Why this clause is risky for the signing party
- negotiation_suggestion: Specific language changes to propose

Common high-risk indicators:
- One-sided indemnification
- Unlimited liability exposure
- Perpetual or overly broad restrictions
- Unilateral modification rights
- IP assignment without fair compensation
- Automatic renewal with difficult opt-out

Return only valid JSON, no markdown.
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        data = json.loads(message.content[0].text)
        return RiskAssessment(
            clause_id=clause.id,
            risk_score=float(data.get("risk_score", 5)),
            risk_level=RiskLevel(data.get("risk_level", "MEDIUM")),
            concern=data.get("concern", ""),
            recommendation=data.get("recommendation", ""),
            issue_description=data.get("issue_description", ""),
            why_risky=data.get("why_risky", ""),
            negotiation_suggestion=data.get("negotiation_suggestion", ""),
        )
    except Exception:
        return RiskAssessment(
            clause_id=clause.id,
            risk_score=5.0,
            risk_level=RiskLevel.MEDIUM,
            concern="Could not assess risk automatically",
            recommendation="Review with a legal professional",
            issue_description="Automated assessment failed",
            why_risky="Unknown",
            negotiation_suggestion="Consult an attorney",
        )


async def analyze_all_clauses(clauses: List[Clause], contract_type: str = "general") -> List[RiskAssessment]:
    """Analyze risk for all clauses in a contract."""
    assessments = []
    for clause in clauses:
        assessment = await assess_clause_risk(clause, contract_type)
        assessments.append(assessment)
    return assessments


def calculate_overall_risk(clause_risks: List[RiskAssessment]) -> Dict:
    """Calculate overall risk score and distribution from clause assessments."""
    if not clause_risks:
        return {
            "overall_risk_score": 1.0,
            "risk_distribution": {"HIGH": 0, "MEDIUM": 0, "LOW": 0},
        }

    distribution = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    total_score = 0.0
    weighted_total = 0.0
    weight_sum = 0.0

    # Weight HIGH risk clauses more heavily
    weights = {"HIGH": 3.0, "MEDIUM": 1.5, "LOW": 1.0}

    for risk in clause_risks:
        distribution[risk.risk_level] += 1
        weight = weights.get(risk.risk_level, 1.0)
        weighted_total += risk.risk_score * weight
        weight_sum += weight
        total_score += risk.risk_score

    overall_score = weighted_total / weight_sum if weight_sum > 0 else 5.0
    # Clamp to 1-10
    overall_score = max(1.0, min(10.0, overall_score))

    return {
        "overall_risk_score": round(overall_score, 1),
        "risk_distribution": distribution,
    }


async def build_contract_analysis(
    contract_id: str,
    clauses: List[Clause],
    clause_risks: List[RiskAssessment],
    missing_clauses: List[str],
    contract_type: str = "general",
) -> ContractAnalysis:
    """Build a complete ContractAnalysis object."""
    risk_summary = calculate_overall_risk(clause_risks)

    key_concerns = [
        r.concern
        for r in clause_risks
        if r.risk_level == RiskLevel.HIGH
    ]

    return ContractAnalysis(
        contract_id=contract_id,
        overall_risk_score=risk_summary["overall_risk_score"],
        risk_distribution=risk_summary["risk_distribution"],
        clause_risks=clause_risks,
        missing_clauses=missing_clauses,
        key_concerns=key_concerns,
        summary="",
    )
