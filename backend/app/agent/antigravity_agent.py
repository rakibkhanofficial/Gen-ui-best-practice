import os
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator

from app.config import settings
from app.agent.tools.weather_tool import get_weather_data
from app.agent.tools.sales_tool import get_sales_analytics
from app.agent.tools.planning_tool import generate_planning_board
from app.agent.tools.product_tool import search_product_catalog
from app.agent.tools.route_tool import calculate_route_distance
from app.agent.tools.operations_tool import request_sensitive_action, execute_approved_action

logger = logging.getLogger("genui.agent")

# Map of tool functions available to the agent
TOOL_REGISTRY = {
    "get_weather_data": get_weather_data,
    "get_sales_analytics": get_sales_analytics,
    "generate_planning_board": generate_planning_board,
    "search_product_catalog": search_product_catalog,
    "calculate_route_distance": calculate_route_distance,
    "request_sensitive_action": request_sensitive_action,
    "execute_approved_action": execute_approved_action,
}


def get_available_tools_schema() -> List[Dict[str, Any]]:
    """Returns OpenAI/CopilotKit compatible tool definitions."""
    return [
        {
            "type": "function",
            "function": {
                "name": "get_weather_data",
                "description": "Get current live weather conditions and 5-day forecast for any city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "The city name, e.g. 'Tokyo', 'San Francisco', 'London'"}
                    },
                    "required": ["city"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_sales_analytics",
                "description": "Fetch enterprise sales performance KPIs, quarterly trends, category breakdowns, and transaction rows.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "quarter": {"type": "string", "description": "Fiscal quarter, e.g. 'Q1', 'Q2', 'Q3', 'Q4'"},
                        "year": {"type": "integer", "description": "Year, e.g. 2026"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "generate_planning_board",
                "description": "Create a Miro-style visual roadmap and planning board with draggable sticky notes and status columns.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string", "description": "The topic or project plan, e.g. 'Generative AI Release Roadmap'"}
                    },
                    "required": ["topic"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_product_catalog",
                "description": "Search e-commerce tech product catalog and compare specifications, pricing, and ratings side-by-side.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query or category, e.g. 'MacBook M4', 'AI Workstation'"}
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_route_distance",
                "description": "Compute travel distance, durations across travel modes (drive, transit, fly), waypoints, and step-by-step route directions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "origin": {"type": "string", "description": "Starting location, e.g. 'San Francisco, CA'"},
                        "destination": {"type": "string", "description": "Destination location, e.g. 'Lake Tahoe, CA'"}
                    },
                    "required": ["origin", "destination"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "request_sensitive_action",
                "description": "Request human authorization for high-risk operations (e.g. customer refunds, production deploys).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "action_type": {"type": "string", "enum": ["customer_refund", "production_deployment", "database_migration"]},
                        "target_id": {"type": "string", "description": "Target ID, e.g. 'ORD-8921'"},
                        "amount": {"type": "number", "description": "Amount in USD if financial refund"},
                        "reason": {"type": "string", "description": "Reason for action"}
                    },
                    "required": ["action_type", "target_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "execute_approved_action",
                "description": "Execute or abort a pending sensitive action after human confirmation.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "action_id": {"type": "string", "description": "The ID of the action"},
                        "decision": {"type": "string", "enum": ["approve", "reject"]}
                    },
                    "required": ["action_id", "decision"]
                }
            }
        }
    ]


def route_intent_heuristically(prompt: str) -> Optional[Dict[str, Any]]:
    """Heuristic tool dispatcher for instant, reliable interactive GenUI demo execution."""
    p = prompt.lower()
    if any(k in p for k in ["weather", "temperature", "forecast", "rain", "sunny", "climate"]):
        city = "San Francisco"
        for c in ["tokyo", "london", "new york", "paris", "dhaka", "chicago", "seattle"]:
            if c in p:
                city = c
                break
        return {"tool": "get_weather_data", "args": {"city": city}}

    if any(k in p for k in ["sales", "revenue", "analytics", "arr", "deal", "kpi", "zen journey", "financial", "growth"]):
        quarter = "Q3"
        for q in ["q1", "q2", "q3", "q4"]:
            if q in p:
                quarter = q.upper()
                break
        return {"tool": "get_sales_analytics", "args": {"quarter": quarter, "year": 2026}}

    if any(k in p for k in ["plan", "planning", "miro", "roadmap", "sticky", "board", "kanban", "sprint"]):
        return {"tool": "generate_planning_board", "args": {"topic": prompt}}

    if any(k in p for k in ["product", "laptop", "macbook", "spec", "specs", "compare", "price", "hardware", "workstation"]):
        return {"tool": "search_product_catalog", "args": {"query": prompt}}

    if any(k in p for k in ["distance", "route", "map", "direction", "miles", "km", "drive to", "travel"]):
        origin = "San Francisco, CA"
        destination = "Lake Tahoe, CA"
        if "to" in p:
            parts = p.split("to")
            if len(parts) > 1:
                destination = parts[1].strip().title()
        return {"tool": "calculate_route_distance", "args": {"origin": origin, "destination": destination}}

    if any(k in p for k in ["refund", "deploy", "approve", "delete", "sensitive", "danger", "human in the loop", "hitl"]):
        amount = 1250.00
        order_id = "ORD-8921"
        return {"tool": "request_sensitive_action", "args": {"action_type": "customer_refund", "target_id": order_id, "amount": amount, "reason": "Customer billing adjustment"}}

    return None

