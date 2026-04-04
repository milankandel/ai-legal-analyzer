from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ClauseType(str, Enum):
    INDEMNIFICATION = "indemnification"
    LIMITATION_OF_LIABILITY = "limitation_of_liability"
    NON_COMPETE = "non_compete"
    TERMINATION = "termination"
    IP_OWNERSHIP = "IP_ownership"
    PAYMENT = "payment"
    CONFIDENTIALITY = "confidentiality"
    DISPUTE_RESOLUTION = "dispute_resolution"
    GOVERNING_LAW = "governing_law"
    FORCE_MAJEURE = "force_majeure"
    OTHER = "other"


class RiskLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RiskAssessment(BaseModel):
    clause_id: str
    risk_score: float = Field(ge=1, le=10)
    risk_level: RiskLevel
    concern: str
    recommendation: str
    issue_description: str
    why_risky: str
    negotiation_suggestion: str


class Clause(BaseModel):
    id: str
    clause_type: ClauseType
    title: str
    text: str
    page_number: Optional[int] = None
    plain_english: Optional[str] = None
    risk_assessment: Optional[RiskAssessment] = None


class Contract(BaseModel):
    id: Optional[str] = None
    filename: str
    contract_type: str = "general"
    file_path: Optional[str] = None
    text_content: Optional[str] = None
    parties: List[str] = []
    effective_date: Optional[str] = None
    term: Optional[str] = None
    governing_law: Optional[str] = None
    clauses: List[Clause] = []
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed: bool = False


class ContractAnalysis(BaseModel):
    contract_id: str
    overall_risk_score: float = Field(ge=1, le=10)
    risk_distribution: Dict[str, int] = {
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
    }
    clause_risks: List[RiskAssessment] = []
    missing_clauses: List[str] = []
    key_concerns: List[str] = []
    summary: str = ""
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


class ClauseDiff(BaseModel):
    clause_type: str
    title: str
    change_type: str  # "added", "removed", "modified"
    original_text: Optional[str] = None
    new_text: Optional[str] = None
    diff_summary: str = ""


class ComparisonResult(BaseModel):
    contract_a_id: str
    contract_b_id: str
    added_clauses: List[ClauseDiff] = []
    removed_clauses: List[ClauseDiff] = []
    modified_clauses: List[ClauseDiff] = []
    ai_summary: str = ""
    more_favorable: str = ""  # "contract_a" or "contract_b"
    key_changes: List[str] = []
    compared_at: datetime = Field(default_factory=datetime.utcnow)


# Request/Response models
class UploadResponse(BaseModel):
    contract_id: str
    filename: str
    message: str


class AnalyzeRequest(BaseModel):
    contract_id: str
    contract_type: str = "general"


class CompareRequest(BaseModel):
    contract_a_id: str
    contract_b_id: str


class ExplainClauseRequest(BaseModel):
    clause_text: str
    context: Optional[str] = None
    contract_type: Optional[str] = "general"


class ExplainClauseResponse(BaseModel):
    plain_english: str
    key_points: List[str] = []
    implications: str = ""


class RiskAssessmentRequest(BaseModel):
    clause_text: str
    clause_type: Optional[str] = "other"
    contract_type: Optional[str] = "general"


class TemplateCheckResponse(BaseModel):
    contract_id: str
    contract_type: str
    missing_clauses: List[str]
    present_clauses: List[str]
    compliance_score: float
    recommendations: List[str]
