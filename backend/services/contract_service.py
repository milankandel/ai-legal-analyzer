import os
import json
import uuid
from typing import Optional
import anthropic

# Optional imports for file parsing
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

from models.schemas import Contract, Clause, ClauseType

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

CLAUSE_TYPES = [
    "indemnification",
    "limitation_of_liability",
    "non_compete",
    "termination",
    "IP_ownership",
    "payment",
    "confidentiality",
    "dispute_resolution",
    "governing_law",
    "force_majeure",
]


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    if not HAS_PYPDF2:
        raise ImportError("PyPDF2 not installed. Install with: pip install PyPDF2")
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n[Page {page_num + 1}]\n{page_text}"
    return text


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    if not HAS_DOCX:
        raise ImportError("python-docx not installed. Install with: pip install python-docx")
    doc = docx.Document(file_path)
    paragraphs = []
    for para in doc.paragraphs:
        if para.text.strip():
            paragraphs.append(para.text)
    return "\n".join(paragraphs)


def extract_text(file_path: str) -> str:
    """Extract text from PDF or DOCX based on file extension."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file format: {ext}")


async def identify_clauses(text: str, contract_type: str = "general") -> dict:
    """Use Claude to identify and extract clauses from contract text."""
    prompt = f"""You are a legal expert analyzing a {contract_type} contract.

Contract text:
\"\"\"{text[:8000]}\"\"\"

Extract and identify all significant clauses. For each clause, return:
- id: unique identifier (clause_1, clause_2, etc.)
- clause_type: one of {CLAUSE_TYPES} or "other"
- title: short descriptive title
- text: the actual clause text
- page_number: estimated page number if discernible

Also extract:
- parties: list of party names
- effective_date: contract start date if mentioned
- term: contract duration if mentioned
- governing_law: governing jurisdiction if mentioned

Return a JSON object with keys: clauses (array), parties, effective_date, term, governing_law.
Return only valid JSON, no markdown code blocks.
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        response_text = message.content[0].text.strip()
        # Strip markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text)
    except Exception as e:
        return {
            "clauses": [],
            "parties": [],
            "effective_date": None,
            "term": None,
            "governing_law": None,
        }


async def parse_contract(file_path: str, contract_type: str = "general") -> Contract:
    """Parse a contract file and return a structured Contract object."""
    filename = os.path.basename(file_path)
    text_content = extract_text(file_path)

    clause_data = await identify_clauses(text_content, contract_type)

    clauses = []
    for raw_clause in clause_data.get("clauses", []):
        try:
            clause_type = ClauseType(raw_clause.get("clause_type", "other"))
        except ValueError:
            clause_type = ClauseType.OTHER

        clause = Clause(
            id=raw_clause.get("id", str(uuid.uuid4())),
            clause_type=clause_type,
            title=raw_clause.get("title", "Untitled Clause"),
            text=raw_clause.get("text", ""),
            page_number=raw_clause.get("page_number"),
        )
        clauses.append(clause)

    contract = Contract(
        id=str(uuid.uuid4()),
        filename=filename,
        contract_type=contract_type,
        file_path=file_path,
        text_content=text_content,
        parties=clause_data.get("parties", []),
        effective_date=clause_data.get("effective_date"),
        term=clause_data.get("term"),
        governing_law=clause_data.get("governing_law"),
        clauses=clauses,
    )
    return contract
