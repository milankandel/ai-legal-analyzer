"""Lightweight stub replacing google-adk Agent for production deployment."""
from typing import Any, Optional

class Agent:
    """Stub Agent class — actual LLM calls use Anthropic SDK directly."""
    def __init__(self, name: str = "", model: str = "", description: str = "",
                 instruction: str = "", sub_agents: Optional[list] = None,
                 tools: Optional[list] = None, **kwargs: Any):
        self.name = name
        self.model = model
        self.description = description
        self.instruction = instruction
        self.sub_agents = sub_agents or []
        self.tools = tools or []

LlmAgent = Agent
