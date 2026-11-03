import os
import re
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
from app.agent.tools.code_tool import generate_code_snippet
from app.agent.tools.job_tool import search_jobs
from app.agent.tools.flight_tool import search_flights
from app.agent.tools.currency_tool import convert_currency
from app.agent.tools.youtube_tool import search_youtube_videos
from app.agent.tools.website_tool import fetch_website_info

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
    "generate_code_snippet": generate_code_snippet,
    "search_jobs": search_jobs,
    "search_flights": search_flights,
    "convert_currency": convert_currency,
    "search_youtube_videos": search_youtube_videos,
    "fetch_website_info": fetch_website_info,
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
        },
        {
            "type": "function",
            "function": {
                "name": "generate_code_snippet",
                "description": "Generate multi-file type-safe code solutions with simulated execution output and syntax complexity.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string", "description": "The coding problem or framework implementation"},
                        "language": {"type": "string", "description": "Programming language (TypeScript, Python, Go, Rust)"}
                    },
                    "required": ["topic"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_jobs",
                "description": "Search tech job listings aggregated from BDJobs, LinkedIn, and remote platforms.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Job title or skill (e.g. 'Frontend', 'Next.js', 'AI')"},
                        "location": {"type": "string", "description": "Location (e.g. 'Dhaka', 'Bangladesh', 'Remote')"},
                        "platform": {"type": "string", "enum": ["All", "BDJobs", "LinkedIn"]}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_flights",
                "description": "Search flights between cities with prices, airlines, schedules, and duration.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "origin": {"type": "string", "description": "Origin city, e.g. 'Dhaka'"},
                        "destination": {"type": "string", "description": "Destination city, e.g. 'Tokyo'"},
                        "departure_date": {"type": "string", "description": "Departure date YYYY-MM-DD"}
                    },
                    "required": ["origin", "destination"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "convert_currency",
                "description": "Convert currencies and check real-time exchange rates and historical trends.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "from_currency": {"type": "string", "description": "Source currency (e.g. USD, EUR, BDT)"},
                        "to_currency": {"type": "string", "description": "Target currency (e.g. BDT, JPY, GBP)"},
                        "amount": {"type": "number", "description": "Amount to convert"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_youtube_videos",
                "description": "Search YouTube for videos with thumbnails, channel details, duration, and embedded preview.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Topic or video search query"}
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "fetch_website_info",
                "description": "Suggest authoritative websites with favicons, domain metadata, and rich previews.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Domain or subject to recommend sites for"}
                    },
                    "required": ["query"]
                }
            }
        }
    ]


def route_intent_heuristically(prompt: str) -> Optional[Dict[str, Any]]:
    """Heuristic tool dispatcher for instant, reliable interactive GenUI demo execution."""
    p = prompt.lower()
    if any(k in p for k in ["code", "typescript", "python script", "how to write", "snippet", "implementation", "algorithm", "coder"]):
        lang = "TypeScript"
        if "python" in p:
            lang = "Python"
        elif "go" in p or "golang" in p:
            lang = "Go"
        return {"tool": "generate_code_snippet", "args": {"topic": prompt, "language": lang}}

    if any(k in p for k in ["job", "jobs", "bdjob", "bdjobs", "linkedin", "hiring", "career", "vacancy", "internship", "developer job"]):
        platform = "All"
        if "bdjob" in p:
            platform = "BDJobs"
        elif "linkedin" in p:
            platform = "LinkedIn"
        return {"tool": "search_jobs", "args": {"query": prompt, "location": "Dhaka, Bangladesh", "platform": platform}}

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

    # Flight search and details
    if any(k in p for k in ["flight", "flights", "fly to", "airline", "booking", "plane ticket", "airfare", "aviation"]):
        # Clean up stop words and trailing descriptive phrases
        cleaned = re.sub(
            r"\b(with\s+(airlines?|pricing|prices?|schedules?|options?|costs?)|and\s+(pricing|prices?|airlines?)|for\s+(next\s+week|tomorrow|\d+\s+people)|round\s*trip|one\s*way|tickets?|cheap(est)?|please|details?)\b.*",
            "",
            p,
            flags=re.IGNORECASE
        ).strip()

        origin = "Delhi"
        destination = "Tokyo"

        # Match 'from <origin> to <destination>'
        from_to_match = re.search(r"\bfrom\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)", cleaned, re.IGNORECASE)
        if from_to_match:
            cand_orig = from_to_match.group(1).strip()
            cand_dest = from_to_match.group(2).strip()
            cand_orig = re.sub(r"^(flights?|find|search|show|book|fly|cheap|get|the)\s+", "", cand_orig, flags=re.IGNORECASE).strip()
            cand_dest = re.sub(r"\s+(flights?|tickets?|airlines?)$", "", cand_dest, flags=re.IGNORECASE).strip()
            if cand_orig:
                origin = cand_orig.title()
            if cand_dest:
                destination = cand_dest.title()
        else:
            to_match = re.search(r"([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)", cleaned, re.IGNORECASE)
            if to_match:
                cand_orig = to_match.group(1).strip()
                cand_dest = to_match.group(2).strip()
                cand_orig = re.sub(r"^(flights?|find|search|show|book|fly|cheap|get|the|from)\s+", "", cand_orig, flags=re.IGNORECASE).strip()
                cand_dest = re.sub(r"\s+(flights?|tickets?|airlines?)$", "", cand_dest, flags=re.IGNORECASE).strip()
                if cand_orig:
                    origin = cand_orig.title()
                if cand_dest:
                    destination = cand_dest.title()

        return {"tool": "search_flights", "args": {"origin": origin, "destination": destination}}

    # Currency conversion & exchange rates
    if any(k in p for k in ["currency", "convert", "exchange rate", "forex", "usd", "bdt", "eur", "gbp", "jpy", "dollar", "taka", "rupee", "yen", "pound"]):
        fc, tc, amt = "USD", "BDT", 100.0
        # Check for currency symbols or names
        currency_map = {
            "usd": "USD", "dollar": "USD", "$": "USD",
            "bdt": "BDT", "taka": "BDT", "৳": "BDT",
            "eur": "EUR", "euro": "EUR", "€": "EUR",
            "gbp": "GBP", "pound": "GBP", "£": "GBP",
            "jpy": "JPY", "yen": "JPY", "¥": "JPY",
            "inr": "INR", "rupee": "INR", "₹": "INR",
            "cad": "CAD", "aud": "AUD", "sgd": "SGD", "aed": "AED",
            "cny": "CNY", "krw": "KRW", "myr": "MYR", "thb": "THB", "try": "TRY"
        }
        to_splits = re.split(r"\bto\b", p, flags=re.IGNORECASE)
        if len(to_splits) > 1:
            # First half has source currency
            for word, code in currency_map.items():
                if re.search(r"\b" + re.escape(word) + r"\b", to_splits[0], flags=re.IGNORECASE):
                    fc = code
                    break
            # Second half has target currency
            for word, code in currency_map.items():
                if re.search(r"\b" + re.escape(word) + r"\b", to_splits[1], flags=re.IGNORECASE):
                    tc = code
                    break
        else:
            found_codes = []
            for word, code in currency_map.items():
                if re.search(r"\b" + re.escape(word) + r"\b", p, flags=re.IGNORECASE):
                    if code not in found_codes:
                        found_codes.append(code)
            if len(found_codes) >= 2:
                fc, tc = found_codes[0], found_codes[1]
            elif len(found_codes) == 1:
                tc = found_codes[0]

        nums = re.findall(r"[\d,]+\.?\d*", p)
        if nums:
            try:
                amt = float(nums[0].replace(",", ""))
            except:
                amt = 100.0
        return {"tool": "convert_currency", "args": {"from_currency": fc, "to_currency": tc, "amount": amt}}

    # YouTube video suggestions & playback preview
    if any(k in p for k in ["youtube", "video", "watch", "tutorial video", "yt"]):
        return {"tool": "search_youtube_videos", "args": {"query": prompt}}

    # Website link previews & metadata
    if any(k in p for k in ["website", "recommend site", "suggest site", "best site", "url", "web link", "resource", "favicon", "links"]):
        return {"tool": "fetch_website_info", "args": {"query": prompt}}

    return None

