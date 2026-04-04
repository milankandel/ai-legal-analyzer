"""Contract Parser Sub-Agent — uses Google ADK to parse contract structure."""
import os
from typing import Optional

from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from services.contract_service import parse_contract
from models.schemas import Contract


def _parse_contract_sync(file_path: str, contract_type: str = "general") -> dict:
    """Synchronous wrapper for contract parsing (used by ADK FunctionTool)."""
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        contract = loop.run_until_complete(parse_contract(file_path, contract_type))
        return contract.model_dump(mode="json")
    finally:
        loop.close()


parse_tool = FunctionTool(
    func=_parse_contract_sync,
    name="parse_contract",
    description=(
        "Parse a contract file (PDF/DOCX) and extract its structure including "
        "parties, effective date, term, governing law, and all identified clauses. "
        "Returns: clause_list with type, text, page_number."
    ),
)


class ContractParserAgent:
    """
    Google ADK Sub-Agent: Contract Parser

    Responsible for:
    - Parsing contract structure from PDF/DOCX
    - Identifying parties, effective date, term, governing law
    - Extracting individual clauses with types:
      indemnification, limitation_of_liability, non_compete, termination,
      IP_ownership, payment, confidentiality, dispute_resolution,
      governing_law, force_majeure
    - Returns: clause_list with type, text, page_number
    """

    def __init__(self):
        self.agent = Agent(
            name="contract_parser",
            model=os.getenv("GOOGLE_ADK_MODEL", "gemini-2.0-flash"),
            description=(
                "Specialized agent for parsing legal contracts. "
                "Extracts structured information from PDF and DOCX contract files."
            ),
            instruction=(
                "You are a legal document parser. When given a contract file path, "
                "use the parse_contract tool to extract all clauses, parties, and key terms. "
                "Return the structured contract data including all identified clauses with their types. "
                "Ensure every clause has an appropriate type from the supported list. "
                "If a clause doesn't fit a known type, use 'other'."
            ),
            tools=[parse_tool],
        )

    async def parse(self, file_path: str, contract_type: str = "general") -> dict:
        """Parse a contract and return structured data."""
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
            parts=[Part(text=f"Parse this contract: {file_path} (type: {contract_type})")],
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

        return {"result": result_text}
