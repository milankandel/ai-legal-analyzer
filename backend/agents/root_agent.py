"""Root Agent — Google ADK orchestrator for the AI Legal Analyzer."""
import os
from typing import Optional

from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from agents.sub_agents.parser import ContractParserAgent
from agents.sub_agents.risk_assessor import RiskAssessorAgent
from models.schemas import Contract, ContractAnalysis, ComparisonResult


def _full_analysis_sync(file_path: str, contract_type: str = "general") -> dict:
    """Synchronous wrapper for full contract analysis pipeline."""
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_run_full_analysis(file_path, contract_type))
    finally:
        loop.close()


async def _run_full_analysis(file_path: str, contract_type: str = "general") -> dict:
    """Run the full analysis pipeline: parse → assess risk → generate report."""
    from services.contract_service import parse_contract
    from services.risk_service import analyze_all_clauses, calculate_overall_risk, build_contract_analysis
    from services.ai_service import check_missing_clauses, generate_summary

    # Step 1: Parse contract
    contract = await parse_contract(file_path, contract_type)

    # Step 2: Assess risk for all clauses
    clause_risks = await analyze_all_clauses(contract.clauses, contract_type)

    # Step 3: Check for missing clauses
    existing_types = [str(c.clause_type) for c in contract.clauses]
    missing_data = await check_missing_clauses(contract_type, existing_types)
    missing_clauses = missing_data.get("missing_clauses", [])

    # Step 4: Build analysis
    analysis = await build_contract_analysis(
        contract_id=contract.id or "unknown",
        clauses=contract.clauses,
        clause_risks=clause_risks,
        missing_clauses=missing_clauses,
        contract_type=contract_type,
    )

    # Step 5: Generate summary
    risk_summary = calculate_overall_risk(clause_risks)
    summary = await generate_summary(
        contract_text=contract.text_content or "",
        analysis_data={
            "contract_type": contract_type,
            "overall_risk_score": risk_summary["overall_risk_score"],
            "risk_distribution": risk_summary["risk_distribution"],
            "missing_clauses": missing_clauses,
            "high_risk_clauses": [
                {"title": c.title, "concern": r.concern}
                for c, r in zip(contract.clauses, clause_risks)
                if r.risk_level == "HIGH"
            ],
        },
    )
    analysis.summary = summary

    return {
        "contract": contract.model_dump(mode="json"),
        "analysis": analysis.model_dump(mode="json"),
    }


full_analysis_tool = FunctionTool(
    func=_full_analysis_sync,
    name="analyze_contract",
    description=(
        "Run a complete contract analysis pipeline: parse the document, "
        "identify all clauses, assess risk for each clause, check for missing "
        "standard clauses, and generate an executive summary report."
    ),
)


class LegalAnalyzerAgent:
    """
    Google ADK Root Agent: Legal Analyzer Orchestrator

    Coordinates sub-agents to provide complete contract intelligence:
    1. ContractParserAgent — extracts structure
    2. RiskAssessorAgent — scores risk
    3. Generates final report with AI summary

    Supports:
    - Single contract analysis
    - Contract comparison
    - Clause-level explanation
    - Missing clause detection
    """

    def __init__(self):
        self.parser = ContractParserAgent()
        self.risk_assessor = RiskAssessorAgent()

        self.agent = Agent(
            name="legal_analyzer_root",
            model=os.getenv("GOOGLE_ADK_MODEL", "gemini-2.0-flash"),
            description=(
                "Root orchestrator for AI Legal Contract Analysis. "
                "Coordinates parsing, risk assessment, and report generation."
            ),
            instruction=(
                "You are an expert legal analyst AI. Your job is to orchestrate "
                "the complete contract analysis workflow. "
                "When asked to analyze a contract, use the analyze_contract tool. "
                "Provide clear, actionable insights in plain English. "
                "Always include: overall risk score, top 3 concerns, "
                "and specific negotiation recommendations. "
                "IMPORTANT: This analysis is for informational purposes only "
                "and does not constitute legal advice. Always recommend consulting "
                "a qualified attorney for legal decisions."
            ),
            tools=[full_analysis_tool],
        )

    async def analyze(self, file_path: str, contract_type: str = "general") -> dict:
        """Run full analysis pipeline directly (bypassing ADK runner for simplicity)."""
        return await _run_full_analysis(file_path, contract_type)

    async def run_with_adk(self, file_path: str, contract_type: str = "general") -> str:
        """Run analysis using ADK runner for conversational output."""
        from google.adk.sessions import InMemorySessionService
        from google.adk.runners import Runner
        from google.genai.types import Content, Part

        session_service = InMemorySessionService()
        session = await session_service.create_session(
            app_name="ai-legal-analyzer",
            user_id="system",
        )

        runner = Runner(
            agent=self.agent,
            app_name="ai-legal-analyzer",
            session_service=session_service,
        )

        user_message = Content(
            role="user",
            parts=[Part(text=f"Please analyze this contract: {file_path} (type: {contract_type})")],
        )

        result_text = ""
        async for event in runner.run_async(
            user_id="system",
            session_id=session.id,
            new_message=user_message,
        ):
            if event.is_final_response() and event.content:
                for part in event.content.parts:
                    if hasattr(part, "text"):
                        result_text += part.text

        return result_text
