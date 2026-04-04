import os
import json
from typing import List
import anthropic

from models.schemas import Contract, ClauseDiff, ComparisonResult

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))


def _find_clause_by_type(contract: Contract, clause_type: str):
    """Find a clause by type in a contract."""
    for clause in contract.clauses:
        if clause.clause_type == clause_type:
            return clause
    return None


async def compare_contracts(contract_a: Contract, contract_b: Contract) -> ComparisonResult:
    """Compare two contracts and generate a detailed diff."""
    added_clauses: List[ClauseDiff] = []
    removed_clauses: List[ClauseDiff] = []
    modified_clauses: List[ClauseDiff] = []

    types_a = {c.clause_type: c for c in contract_a.clauses}
    types_b = {c.clause_type: c for c in contract_b.clauses}

    all_types = set(list(types_a.keys()) + list(types_b.keys()))

    for clause_type in all_types:
        clause_a = types_a.get(clause_type)
        clause_b = types_b.get(clause_type)

        if clause_a and not clause_b:
            removed_clauses.append(
                ClauseDiff(
                    clause_type=str(clause_type),
                    title=clause_a.title,
                    change_type="removed",
                    original_text=clause_a.text,
                    diff_summary=f"Clause '{clause_a.title}' present in Contract A but missing in Contract B",
                )
            )
        elif clause_b and not clause_a:
            added_clauses.append(
                ClauseDiff(
                    clause_type=str(clause_type),
                    title=clause_b.title,
                    change_type="added",
                    new_text=clause_b.text,
                    diff_summary=f"Clause '{clause_b.title}' added in Contract B",
                )
            )
        elif clause_a and clause_b and clause_a.text != clause_b.text:
            modified_clauses.append(
                ClauseDiff(
                    clause_type=str(clause_type),
                    title=clause_a.title,
                    change_type="modified",
                    original_text=clause_a.text,
                    new_text=clause_b.text,
                    diff_summary=f"Clause '{clause_a.title}' has been modified between versions",
                )
            )

    # Use Claude to generate AI summary
    ai_analysis = await _generate_comparison_summary(
        contract_a, contract_b, added_clauses, removed_clauses, modified_clauses
    )

    return ComparisonResult(
        contract_a_id=contract_a.id or "",
        contract_b_id=contract_b.id or "",
        added_clauses=added_clauses,
        removed_clauses=removed_clauses,
        modified_clauses=modified_clauses,
        ai_summary=ai_analysis.get("summary", ""),
        more_favorable=ai_analysis.get("more_favorable", ""),
        key_changes=ai_analysis.get("key_changes", []),
    )


async def _generate_comparison_summary(
    contract_a: Contract,
    contract_b: Contract,
    added: List[ClauseDiff],
    removed: List[ClauseDiff],
    modified: List[ClauseDiff],
) -> dict:
    """Generate an AI summary of the contract comparison."""
    changes_summary = {
        "added_count": len(added),
        "removed_count": len(removed),
        "modified_count": len(modified),
        "added_clauses": [c.title for c in added],
        "removed_clauses": [c.title for c in removed],
        "modified_clauses": [
            {
                "title": c.title,
                "original": c.original_text[:200] if c.original_text else "",
                "new": c.new_text[:200] if c.new_text else "",
            }
            for c in modified[:3]  # Limit to first 3 for token efficiency
        ],
    }

    prompt = f"""You are a legal expert comparing two versions of a {contract_a.contract_type} contract.

Contract A: {contract_a.filename}
Contract B: {contract_b.filename}

Changes found:
{json.dumps(changes_summary, indent=2)}

Analyze these changes and return a JSON object with:
- summary: A 2-3 paragraph executive summary of the key differences
- more_favorable: Which contract is more favorable for the signing party ("contract_a" or "contract_b") and why (1-2 sentences)
- key_changes: Array of 5 most important changes (strings)
- risk_shift: Whether the risk increased or decreased from A to B ("increased", "decreased", "neutral")

Return only valid JSON, no markdown.
"""
    try:
        message = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(message.content[0].text)
    except Exception:
        return {
            "summary": f"Contract B has {len(added)} added, {len(removed)} removed, and {len(modified)} modified clauses compared to Contract A.",
            "more_favorable": "contract_b" if len(added) > len(removed) else "contract_a",
            "key_changes": [],
            "risk_shift": "neutral",
        }
