"""MCP Tool functions for legal contract analysis."""
import json
from typing import Any, Dict, Optional


async def parse_contract_tool(file_path: str, contract_type: str = "general") -> Dict[str, Any]:
    """
    MCP Tool: Parse a contract file and extract structured information.

    Args:
        file_path: Path to the contract file (PDF or DOCX)
        contract_type: Type of contract (e.g., saas, employment, nda)

    Returns:
        Structured contract data with clauses, parties, and metadata
    """
    from services.contract_service import parse_contract
    contract = await parse_contract(file_path, contract_type)
    return contract.model_dump()


async def score_risk_tool(
    clause_text: str,
    clause_type: str = "other",
    contract_type: str = "general",
) -> Dict[str, Any]:
    """
    MCP Tool: Score the risk level of a specific contract clause.

    Args:
        clause_text: The text of the clause to analyze
        clause_type: Type of clause (indemnification, termination, etc.)
        contract_type: Type of contract for context

    Returns:
        Risk assessment with score, level, and recommendations
    """
    from models.schemas import Clause, ClauseType
    import uuid

    try:
        ct = ClauseType(clause_type)
    except ValueError:
        ct = ClauseType.OTHER

    clause = Clause(
        id=str(uuid.uuid4()),
        clause_type=ct,
        title=f"{clause_type.replace('_', ' ').title()} Clause",
        text=clause_text,
    )

    from services.risk_service import assess_clause_risk
    assessment = await assess_clause_risk(clause, contract_type)
    return assessment.model_dump()


async def explain_clause_tool(
    clause_text: str,
    context: Optional[str] = None,
    contract_type: str = "general",
) -> Dict[str, Any]:
    """
    MCP Tool: Explain a contract clause in plain English.

    Args:
        clause_text: The clause text to explain
        context: Additional context about the contract
        contract_type: Type of contract

    Returns:
        Plain English explanation with key points and implications
    """
    from services.ai_service import explain_clause
    return await explain_clause(clause_text, context, contract_type)


async def compare_versions_tool(
    contract_a_path: str,
    contract_b_path: str,
    contract_type: str = "general",
) -> Dict[str, Any]:
    """
    MCP Tool: Compare two versions of a contract and identify differences.

    Args:
        contract_a_path: Path to the first contract
        contract_b_path: Path to the second contract
        contract_type: Type of contract

    Returns:
        Comparison result with added, removed, modified clauses and AI summary
    """
    from services.contract_service import parse_contract
    from services.comparison_service import compare_contracts

    contract_a = await parse_contract(contract_a_path, contract_type)
    contract_b = await parse_contract(contract_b_path, contract_type)
    result = await compare_contracts(contract_a, contract_b)
    return result.model_dump()


async def check_standards_tool(
    contract_type: str,
    existing_clause_types: list,
) -> Dict[str, Any]:
    """
    MCP Tool: Check a contract against industry standard templates.

    Args:
        contract_type: Type of contract to check against
        existing_clause_types: List of clause types already present

    Returns:
        Missing clauses, compliance score, and recommendations
    """
    from services.ai_service import check_missing_clauses
    result = await check_missing_clauses(contract_type, existing_clause_types)
    return result
