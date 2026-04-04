"""Risk Assessor Sub-Agent — uses Google ADK to score contract clause risk."""
import os
from typing import List

from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from models.schemas import Clause, RiskAssessment, RiskLevel, ContractAnalysis
from services.risk_service import assess_clause_risk, calculate_overall_risk


def _assess_risk_sync(
    clause_text: str,
    clause_type: str = "other",
    clause_id: str = "unknown",
    contract_type: str = "general",
) -> dict:
    """Synchronous wrapper for risk assessment (used by ADK FunctionTool)."""
    import asyncio
    import uuid
    from models.schemas import ClauseType

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        try:
            ct = ClauseType(clause_type)
        except ValueError:
            ct = ClauseType.OTHER

        clause = Clause(
            id=clause_id or str(uuid.uuid4()),
            clause_type=ct,
            title=f"{clause_type.replace('_', ' ').title()} Clause",
            text=clause_text,
        )
        assessment = loop.run_until_complete(assess_clause_risk(clause, contract_type))
        return assessment.model_dump(mode="json")
    finally:
        loop.close()


risk_tool = FunctionTool(
    func=_assess_risk_sync,
    name="assess_clause_risk",
    description=(
        "Score the risk level of a contract clause on a scale of 1-10. "
        "Identifies risk category (HIGH/MEDIUM/LOW), provides risk description, "
        "explains why the clause is risky, and suggests negotiation improvements."
    ),
)


class RiskAssessorAgent:
    """
    Google ADK Sub-Agent: Risk Assessor

    Responsible for:
    - Scoring each clause on a 1-10 risk scale
    - Categorizing risk: HIGH (red, 7-10), MEDIUM (yellow, 4-6), LOW (green, 1-3)
    - Generating issue descriptions, risk explanations, negotiation suggestions
    - Calculating overall_risk_score for the entire contract
    - Identifying common high-risk patterns:
      * One-sided indemnification
      * Unlimited liability exposure
      * Perpetual non-compete clauses
    """

    def __init__(self):
        self.agent = Agent(
            name="risk_assessor",
            model=os.getenv("GOOGLE_ADK_MODEL", "gemini-2.0-flash"),
            description=(
                "Specialized agent for assessing legal and business risk in contract clauses. "
                "Provides detailed risk scores and negotiation recommendations."
            ),
            instruction=(
                "You are an expert legal risk analyst. For each clause provided, "
                "use the assess_clause_risk tool to score risk (1-10 scale). "
                "HIGH risk (7-10) = significant exposure, requires immediate attention. "
                "MEDIUM risk (4-6) = moderate concern, should be reviewed. "
                "LOW risk (1-3) = standard language, minor or no concerns. "
                "Focus on: indemnification scope, liability caps, IP ownership, "
                "non-compete breadth, termination triggers, and payment terms. "
                "Always provide actionable negotiation suggestions."
            ),
            tools=[risk_tool],
        )

    async def assess_contract(
        self, clauses: List[Clause], contract_type: str = "general"
    ) -> ContractAnalysis:
        """Assess risk for all clauses in a contract."""
        assessments = []
        for clause in clauses:
            assessment = await assess_clause_risk(clause, contract_type)
            assessments.append(assessment)

        risk_summary = calculate_overall_risk(assessments)
        high_risk_concerns = [a.concern for a in assessments if a.risk_level == RiskLevel.HIGH]

        return ContractAnalysis(
            contract_id="pending",
            overall_risk_score=risk_summary["overall_risk_score"],
            risk_distribution=risk_summary["risk_distribution"],
            clause_risks=assessments,
            key_concerns=high_risk_concerns,
        )
