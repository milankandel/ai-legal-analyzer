import os
import json
from typing import List, Optional
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))


async def explain_clause(clause_text: str, context: Optional[str] = None, contract_type: str = "general") -> dict:
    """Explain a contract clause in plain English."""
    context_str = f"\nContract context: {context}" if context else ""
    prompt = f"""You are a legal expert helping non-lawyers understand contract clauses.

Contract type: {contract_type}{context_str}

Clause text:
\"\"\"{clause_text}\"\"\"

Explain this clause in plain English. Return a JSON object with:
- plain_english: A clear, simple explanation (2-3 sentences max)
- key_points: Array of 3-5 bullet points highlighting what this means for the signing party
- implications: What this means practically for someone signing this contract

Return only valid JSON, no markdown.
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        return json.loads(message.content[0].text)
    except Exception:
        return {
            "plain_english": message.content[0].text,
            "key_points": [],
            "implications": "",
        }


async def suggest_negotiation(
    clause_text: str, party_perspective: str = "buyer", contract_type: str = "general"
) -> dict:
    """Generate negotiation talking points for a clause."""
    prompt = f"""You are an experienced contract negotiation attorney.

Contract type: {contract_type}
Party perspective: {party_perspective}

Clause text:
\"\"\"{clause_text}\"\"\"

Provide negotiation talking points. Return a JSON object with:
- strategy: Overall negotiation approach (1-2 sentences)
- talking_points: Array of 3-5 specific negotiation points
- alternative_language: Suggested alternative clause wording
- leverage_points: What leverage does the {party_perspective} have?
- red_lines: What should absolutely be changed?

Return only valid JSON, no markdown.
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        return json.loads(message.content[0].text)
    except Exception:
        return {
            "strategy": message.content[0].text,
            "talking_points": [],
            "alternative_language": "",
            "leverage_points": [],
            "red_lines": [],
        }


async def check_missing_clauses(contract_type: str, existing_clauses: List[str]) -> dict:
    """Check what standard clauses are missing from the contract."""
    prompt = f"""You are a legal expert reviewing a {contract_type} contract.

Existing clause types in the contract: {', '.join(existing_clauses)}

For a standard {contract_type} contract, identify missing important clauses. Return a JSON object with:
- missing_clauses: Array of clause names that are missing
- risk_of_missing: Object mapping clause name to why it's risky to not have it
- recommended_additions: Array of objects with: clause_name, importance (HIGH/MEDIUM/LOW), sample_language
- compliance_note: Any regulatory compliance issues

Return only valid JSON, no markdown.
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1536,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        return json.loads(message.content[0].text)
    except Exception:
        return {
            "missing_clauses": [],
            "risk_of_missing": {},
            "recommended_additions": [],
            "compliance_note": "",
        }


async def generate_summary(contract_text: str, analysis_data: dict) -> str:
    """Generate an executive summary of the contract analysis."""
    prompt = f"""You are a senior legal analyst. Based on the following contract analysis data, write a concise executive summary (3-5 paragraphs) for a business person.

Analysis data: {json.dumps(analysis_data, indent=2)[:2000]}

Cover:
1. Overall risk assessment
2. Most critical concerns
3. Key negotiation priorities
4. Recommendation (sign as-is, negotiate, or reject)

Be direct and actionable. No legal jargon.
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
