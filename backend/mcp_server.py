"""MCP Server for AI Legal Analyzer - exposes legal analysis tools via MCP protocol."""
import asyncio
import json
import os
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from tools.legal_tools import (
    parse_contract_tool,
    score_risk_tool,
    explain_clause_tool,
    compare_versions_tool,
    check_standards_tool,
)

app = Server("ai-legal-analyzer")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List all available legal analysis MCP tools."""
    return [
        Tool(
            name="parse_contract",
            description="Parse a contract file (PDF/DOCX) and extract structured information including clauses, parties, and key terms",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Absolute path to the contract file",
                    },
                    "contract_type": {
                        "type": "string",
                        "description": "Type of contract (saas, employment, nda, general)",
                        "default": "general",
                    },
                },
                "required": ["file_path"],
            },
        ),
        Tool(
            name="score_risk",
            description="Score the risk level of a specific contract clause on a 1-10 scale with detailed analysis",
            inputSchema={
                "type": "object",
                "properties": {
                    "clause_text": {
                        "type": "string",
                        "description": "The text of the clause to analyze",
                    },
                    "clause_type": {
                        "type": "string",
                        "description": "Type of clause (indemnification, termination, non_compete, etc.)",
                        "default": "other",
                    },
                    "contract_type": {
                        "type": "string",
                        "description": "Type of contract for context",
                        "default": "general",
                    },
                },
                "required": ["clause_text"],
            },
        ),
        Tool(
            name="explain_clause",
            description="Explain a contract clause in plain English with key points and practical implications",
            inputSchema={
                "type": "object",
                "properties": {
                    "clause_text": {
                        "type": "string",
                        "description": "The clause text to explain",
                    },
                    "context": {
                        "type": "string",
                        "description": "Additional context about the contract",
                    },
                    "contract_type": {
                        "type": "string",
                        "description": "Type of contract",
                        "default": "general",
                    },
                },
                "required": ["clause_text"],
            },
        ),
        Tool(
            name="compare_versions",
            description="Compare two contract versions to identify added, removed, and modified clauses with AI summary",
            inputSchema={
                "type": "object",
                "properties": {
                    "contract_a_path": {
                        "type": "string",
                        "description": "Path to the first contract file",
                    },
                    "contract_b_path": {
                        "type": "string",
                        "description": "Path to the second contract file",
                    },
                    "contract_type": {
                        "type": "string",
                        "description": "Type of contract",
                        "default": "general",
                    },
                },
                "required": ["contract_a_path", "contract_b_path"],
            },
        ),
        Tool(
            name="check_standards",
            description="Check a contract against industry standard templates to identify missing clauses",
            inputSchema={
                "type": "object",
                "properties": {
                    "contract_type": {
                        "type": "string",
                        "description": "Type of contract to check against (saas, employment, nda)",
                    },
                    "existing_clause_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of clause types already present in the contract",
                    },
                },
                "required": ["contract_type", "existing_clause_types"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Route tool calls to the appropriate handler."""
    try:
        if name == "parse_contract":
            result = await parse_contract_tool(
                file_path=arguments["file_path"],
                contract_type=arguments.get("contract_type", "general"),
            )
        elif name == "score_risk":
            result = await score_risk_tool(
                clause_text=arguments["clause_text"],
                clause_type=arguments.get("clause_type", "other"),
                contract_type=arguments.get("contract_type", "general"),
            )
        elif name == "explain_clause":
            result = await explain_clause_tool(
                clause_text=arguments["clause_text"],
                context=arguments.get("context"),
                contract_type=arguments.get("contract_type", "general"),
            )
        elif name == "compare_versions":
            result = await compare_versions_tool(
                contract_a_path=arguments["contract_a_path"],
                contract_b_path=arguments["contract_b_path"],
                contract_type=arguments.get("contract_type", "general"),
            )
        elif name == "check_standards":
            result = await check_standards_tool(
                contract_type=arguments["contract_type"],
                existing_clause_types=arguments.get("existing_clause_types", []),
            )
        else:
            result = {"error": f"Unknown tool: {name}"}

        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]

    except Exception as e:
        return [TextContent(type="text", text=json.dumps({"error": str(e)}))]


async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
