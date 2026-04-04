"""FastAPI application for AI Legal Contract Analyzer."""
import os
import uuid
import shutil
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from models.schemas import (
    AnalyzeRequest,
    CompareRequest,
    ExplainClauseRequest,
    ExplainClauseResponse,
    RiskAssessmentRequest,
    TemplateCheckResponse,
    ContractAnalysis,
    ComparisonResult,
    UploadResponse,
)

app = FastAPI(
    title="AI Legal Analyzer API",
    description=(
        "AI Contract Intelligence Platform — analyzes contracts for risk, "
        "explains clauses in plain English, and provides negotiation suggestions. "
        "FOR INFORMATIONAL PURPOSES ONLY — NOT LEGAL ADVICE."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with MongoDB in production)
contracts_store: dict = {}
analyses_store: dict = {}

UPLOAD_DIR = Path("/tmp/ai-legal-analyzer/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}


# ─── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "ai-legal-analyzer",
        "version": "1.0.0",
        "disclaimer": "For informational purposes only — not legal advice.",
    }


# ─── Contracts ─────────────────────────────────────────────────────────────────

@app.post("/api/contracts/upload", response_model=UploadResponse)
async def upload_contract(file: UploadFile = File(...)):
    """Upload a contract PDF or DOCX for analysis."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    contract_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{contract_id}{ext}"

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    contracts_store[contract_id] = {
        "id": contract_id,
        "filename": file.filename,
        "file_path": str(file_path),
        "analyzed": False,
        "contract_type": "general",
    }

    return UploadResponse(
        contract_id=contract_id,
        filename=file.filename,
        message=f"Contract uploaded successfully. Use /api/contracts/analyze to analyze it.",
    )


@app.post("/api/contracts/analyze")
async def analyze_contract(request: AnalyzeRequest):
    """Run full AI analysis on an uploaded contract."""
    if request.contract_id not in contracts_store:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract_data = contracts_store[request.contract_id]
    file_path = contract_data["file_path"]

    if not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Contract file not found on disk")

    try:
        from services.contract_service import parse_contract
        from services.risk_service import analyze_all_clauses, calculate_overall_risk
        from services.ai_service import check_missing_clauses, generate_summary, explain_clause

        # Parse contract
        contract = await parse_contract(file_path, request.contract_type)
        contract.id = request.contract_id

        # Enrich clauses with plain English
        for clause in contract.clauses:
            explanation = await explain_clause(clause.text, contract_type=request.contract_type)
            clause.plain_english = explanation.get("plain_english", "")

        # Assess risks
        clause_risks = await analyze_all_clauses(contract.clauses, request.contract_type)
        risk_summary = calculate_overall_risk(clause_risks)

        # Check missing clauses
        existing_types = [str(c.clause_type) for c in contract.clauses]
        missing_data = await check_missing_clauses(request.contract_type, existing_types)
        missing_clauses = missing_data.get("missing_clauses", [])

        # Build risk map
        risk_by_clause = {r.clause_id: r for r in clause_risks}
        for clause in contract.clauses:
            if clause.id in risk_by_clause:
                clause.risk_assessment = risk_by_clause[clause.id]

        # Generate summary
        summary = await generate_summary(
            contract_text=contract.text_content or "",
            analysis_data={
                "contract_type": request.contract_type,
                "overall_risk_score": risk_summary["overall_risk_score"],
                "risk_distribution": risk_summary["risk_distribution"],
                "missing_clauses": missing_clauses,
                "clause_count": len(contract.clauses),
                "high_risk_clauses": [
                    r.concern for r in clause_risks if r.risk_level == "HIGH"
                ],
            },
        )

        analysis = ContractAnalysis(
            contract_id=request.contract_id,
            overall_risk_score=risk_summary["overall_risk_score"],
            risk_distribution=risk_summary["risk_distribution"],
            clause_risks=clause_risks,
            missing_clauses=missing_clauses,
            key_concerns=[r.concern for r in clause_risks if r.risk_level == "HIGH"],
            summary=summary,
        )

        # Update stores
        contracts_store[request.contract_id].update({
            "analyzed": True,
            "contract_type": request.contract_type,
            "contract": contract.model_dump(mode="json"),
        })
        analyses_store[request.contract_id] = analysis.model_dump(mode="json")

        return {
            "contract": contract.model_dump(mode="json"),
            "analysis": analysis.model_dump(mode="json"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/contracts/compare")
async def compare_contracts(request: CompareRequest):
    """Compare two uploaded contracts side by side."""
    for cid in [request.contract_a_id, request.contract_b_id]:
        if cid not in contracts_store:
            raise HTTPException(status_code=404, detail=f"Contract {cid} not found")

    try:
        from services.contract_service import parse_contract
        from services.comparison_service import compare_contracts as do_compare

        data_a = contracts_store[request.contract_a_id]
        data_b = contracts_store[request.contract_b_id]

        contract_a = await parse_contract(data_a["file_path"])
        contract_a.id = request.contract_a_id

        contract_b = await parse_contract(data_b["file_path"])
        contract_b.id = request.contract_b_id

        result = await do_compare(contract_a, contract_b)
        return result.model_dump(mode="json")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@app.get("/api/contracts")
async def list_contracts():
    """List all uploaded contracts."""
    return {
        "contracts": [
            {
                "id": c["id"],
                "filename": c["filename"],
                "analyzed": c["analyzed"],
                "contract_type": c.get("contract_type", "general"),
            }
            for c in contracts_store.values()
        ],
        "total": len(contracts_store),
    }


@app.get("/api/contracts/{contract_id}")
async def get_contract(contract_id: str):
    """Get a contract with its full analysis."""
    if contract_id not in contracts_store:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract_data = contracts_store[contract_id]
    analysis = analyses_store.get(contract_id)

    return {
        "contract": contract_data.get("contract", {"id": contract_id, "filename": contract_data["filename"]}),
        "analysis": analysis,
    }


# ─── Clauses ───────────────────────────────────────────────────────────────────

@app.post("/api/clauses/explain", response_model=ExplainClauseResponse)
async def explain_clause_endpoint(request: ExplainClauseRequest):
    """Explain a specific clause in plain English."""
    try:
        from services.ai_service import explain_clause
        result = await explain_clause(
            request.clause_text,
            request.context,
            request.contract_type or "general",
        )
        return ExplainClauseResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")


@app.post("/api/clauses/risk")
async def assess_clause_risk_endpoint(request: RiskAssessmentRequest):
    """Assess risk of a specific clause."""
    try:
        from models.schemas import Clause, ClauseType
        from services.risk_service import assess_clause_risk

        try:
            clause_type = ClauseType(request.clause_type or "other")
        except ValueError:
            clause_type = ClauseType.OTHER

        clause = Clause(
            id=str(uuid.uuid4()),
            clause_type=clause_type,
            title="Submitted Clause",
            text=request.clause_text,
        )
        assessment = await assess_clause_risk(clause, request.contract_type or "general")
        return assessment.model_dump(mode="json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")


# ─── Templates ─────────────────────────────────────────────────────────────────

@app.get("/api/templates/check/{contract_id}", response_model=TemplateCheckResponse)
async def check_template(contract_id: str):
    """Check a contract against industry standard templates."""
    if contract_id not in contracts_store:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract_data = contracts_store[contract_id]
    if not contract_data.get("analyzed"):
        raise HTTPException(status_code=400, detail="Contract has not been analyzed yet")

    try:
        from services.ai_service import check_missing_clauses

        contract = contract_data.get("contract", {})
        clauses = contract.get("clauses", [])
        existing_types = [c.get("clause_type", "other") for c in clauses]
        contract_type = contract_data.get("contract_type", "general")

        result = await check_missing_clauses(contract_type, existing_types)

        standard_clauses = [
            "indemnification", "limitation_of_liability", "termination",
            "confidentiality", "governing_law", "dispute_resolution",
            "payment", "IP_ownership", "force_majeure",
        ]
        present = [t for t in existing_types if t in standard_clauses]
        missing = result.get("missing_clauses", [])
        compliance_score = (len(present) / len(standard_clauses)) * 10 if standard_clauses else 0

        return TemplateCheckResponse(
            contract_id=contract_id,
            contract_type=contract_type,
            missing_clauses=missing,
            present_clauses=present,
            compliance_score=round(compliance_score, 1),
            recommendations=result.get("recommended_additions", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template check failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
