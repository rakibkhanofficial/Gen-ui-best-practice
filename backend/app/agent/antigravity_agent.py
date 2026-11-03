import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator, Literal
from pydantic import BaseModel
from google.genai import types

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
from app.agent.tools.document_tool import analyze_document, analyze_image
from app.agent.tools.meeting_tool import schedule_meeting

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
    "analyze_document": analyze_document,
    "analyze_image": analyze_image,
    "schedule_meeting": schedule_meeting,
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
                "description": "Create an interactive Excalidraw visual architecture and sprint plan diagram using MCP (Model Context Protocol).",
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
        },
        {
            "type": "function",
            "function": {
                "name": "schedule_meeting",
                "description": "Interactive Meeting Time Picker and calendar scheduling widget with Human-in-the-Loop booking.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "reason": {"type": "string", "description": "Reason or topic for the meeting"},
                        "duration_minutes": {"type": "integer", "description": "Duration in minutes (e.g. 15, 30, 45, 60)"}
                    },
                    "required": ["reason"]
                }
            }
        }
    ]


class ToolCallDecision(BaseModel):
    tool: Literal[
        "get_weather_data",
        "get_sales_analytics",
        "generate_planning_board",
        "search_product_catalog",
        "calculate_route_distance",
        "request_sensitive_action",
        "generate_code_snippet",
        "search_jobs",
        "search_flights",
        "convert_currency",
        "search_youtube_videos",
        "fetch_website_info",
        "schedule_meeting",
        "none"
    ]
    query: Optional[str] = None
    topic: Optional[str] = None
    city: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    reason: Optional[str] = None
    from_currency: Optional[str] = None
    to_currency: Optional[str] = None
    amount: Optional[float] = None
    quarter: Optional[str] = None
    language: Optional[str] = None
    duration_minutes: Optional[int] = None


def route_intent_with_llm(prompt: str, client: Any) -> Optional[Dict[str, Any]]:
    """Uses Gemini to intelligently determine the interactive GenUI tool and arguments."""
    if not client:
        return None

    try:
        decision_prompt = f"""You are the Generative UI Tool Decision Engine.
Available interactive tools:
- search_youtube_videos(query): For finding or showing YouTube videos, tutorials, video lectures, clips, channels, watch recommendations.
- generate_code_snippet(topic, language): For writing, generating, implementing raw code files, scripts, algorithms, code studio.
- generate_planning_board(topic): For visual architecture diagrams, sprint planning, Kanban, Miro/Excalidraw canvas roadmaps.
- search_flights(origin, destination): For flight search, fares, airlines, travel tickets between cities.
- get_weather_data(city): For current weather forecasts, temperatures, meteorological reports.
- get_sales_analytics(quarter): For enterprise sales, ARR, revenue metrics, dashboards.
- search_jobs(query): For tech jobs, hiring, vacancies on BDJobs/LinkedIn.
- convert_currency(from_currency, to_currency, amount): For currency exchange and forex.
- calculate_route_distance(origin, destination): For driving distances, travel routes, directions, maps.
- search_product_catalog(query): For comparing hardware, laptops, MacBooks, gadgets, specs.
- request_sensitive_action(reason): For human-in-the-loop approvals (refunds, prod deploys).
- schedule_meeting(reason, duration_minutes): For booking time slots, calendar availability, Google Meet scheduling.
- fetch_website_info(query): For recommending authoritative websites, developer portals, URLs.

User query: "{prompt}"
Decide the most appropriate tool to display interactive GenUI component for the user query. If no tool is needed, return tool 'none'."""

        # Try ultra-fast gemini-3.5-flash-lite, with fallbacks
        response = None
        for candidate_model in ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash"]:
            try:
                response = client.models.generate_content(
                    model=candidate_model,
                    contents=decision_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=ToolCallDecision,
                        temperature=0.1
                    )
                )
                if response and response.text:
                    break
            except Exception as model_err:
                logger.debug(f"Model {candidate_model} failed in route_intent_with_llm: {model_err}")
                continue

        if not response or not response.text:
            return None

        data = json.loads(response.text)
        tool = data.get("tool")
        if not tool or tool == "none":
            return None

        args: Dict[str, Any] = {}
        if tool == "search_youtube_videos":
            args["query"] = data.get("query") or data.get("topic") or prompt
        elif tool == "generate_planning_board":
            args["topic"] = data.get("topic") or data.get("query") or prompt
        elif tool == "generate_code_snippet":
            args["topic"] = data.get("topic") or data.get("query") or prompt
            args["language"] = data.get("language") or ("Python" if "python" in prompt.lower() else "TypeScript")
        elif tool == "get_weather_data":
            args["city"] = data.get("city") or "Tokyo"
        elif tool == "search_flights":
            args["origin"] = data.get("origin") or "Dhaka"
            args["destination"] = data.get("destination") or "Tokyo"
        elif tool == "convert_currency":
            args["from_currency"] = data.get("from_currency") or "USD"
            args["to_currency"] = data.get("to_currency") or "BDT"
            args["amount"] = data.get("amount") or 100.0
        elif tool == "search_jobs":
            args["query"] = data.get("query") or prompt
            args["location"] = "Dhaka, Bangladesh"
            args["platform"] = "All"
        elif tool == "schedule_meeting":
            args["reason"] = data.get("reason") or prompt
            args["duration_minutes"] = data.get("duration_minutes") or 30
        elif tool == "fetch_website_info":
            args["query"] = data.get("query") or prompt
        elif tool == "get_sales_analytics":
            args["quarter"] = data.get("quarter") or "Q3"
            args["year"] = 2026
        elif tool == "search_product_catalog":
            args["query"] = data.get("query") or prompt
        elif tool == "calculate_route_distance":
            args["origin"] = data.get("origin") or "San Francisco, CA"
            args["destination"] = data.get("destination") or "Lake Tahoe, CA"
        elif tool == "request_sensitive_action":
            args["action_type"] = "customer_refund"
            args["target_id"] = "ORD-8921"
            args["amount"] = 1250.00
            args["reason"] = data.get("reason") or prompt

        logger.info(f"Gemini LLM Intent Decision: tool='{tool}', args={args}")
        return {"tool": tool, "args": args}

    except Exception as e:
        logger.warning(f"Error in route_intent_with_llm: {e}")
        return None


def route_intent_heuristically(prompt: str) -> Optional[Dict[str, Any]]:
    """Priority-ordered, regex-bounded heuristic tool dispatcher for instant, reliable interactive GenUI demo execution."""
    p = prompt.lower().strip()

    # 0. Explicit Code Studio Requests (write/generate scripts, code files, functions, APIs, HTML/CSS web artifacts)
    is_code_request = bool(
        re.search(r"\b(write|generate|build|create)\s+(an?\s+)?(code|script|function|program|algorithm|api|fastapi|backend|frontend|server|html|calculator|game|web\s*app|artifact)\b", p) or
        re.search(r"\b(code\s*studio|code\s*snippet|python\s*script|typescript\s*script|golang\s*script|rust\s*script|html\s*css|html\s*and\s*js|html\s*page)\b", p) or
        re.search(r"\b(write\s+a\s+python|write\s+a\s+typescript|write\s+a\s+fastapi|create\s+.*in\s+html)\b", p)
    )

    # 1. YouTube video search & playback (handles tutorials from youtube, video guides, etc.)
    is_video_request = bool(
        re.search(r"\b(youtube|\byt\b|videos?|vids?)\b", p) or
        (re.search(r"\b(watch|stream)\b", p) and re.search(r"\b(tutorials?|courses?|lectures?|guides?|walkthroughs?|demos?)\b", p)) or
        (re.search(r"\b(tutorials?|guides?)\b", p) and re.search(r"\b(youtube|\byt\b)\b", p))
    )

    # Disambiguation:
    # "show tutorials on gen ui implementation from youtube" -> video
    # "write a python script to download youtube videos" -> code
    if is_code_request and not re.search(r"\b(from\s+youtube|on\s+youtube|show\s+.*video|watch)\b", p):
        lang = "TypeScript"
        if "python" in p or "fastapi" in p:
            lang = "Python"
        elif any(k in p for k in ["html", "css", "calculator", "game", "artifact", "canvas", "web app"]):
            lang = "HTML"
        elif "go" in p or "golang" in p:
            lang = "Go"
        elif "rust" in p:
            lang = "Rust"
        return {"tool": "generate_code_snippet", "args": {"topic": prompt, "language": lang}}

    if is_video_request:
        cleaned_query = re.sub(r"^(show\s+(me\s+)?(the\s+)?|find\s+(me\s+)?(the\s+)?|search\s+(for\s+)?|watch\s+)", "", p, flags=re.IGNORECASE)
        cleaned_query = re.sub(r"\s+(from\s+youtube|on\s+youtube|youtube\s+videos?|videos?)$", "", cleaned_query, flags=re.IGNORECASE).strip()
        return {"tool": "search_youtube_videos", "args": {"query": cleaned_query or prompt}}

    if is_code_request:
        lang = "TypeScript"
        if "python" in p or "fastapi" in p:
            lang = "Python"
        elif any(k in p for k in ["html", "css", "calculator", "game", "artifact", "canvas", "web app"]):
            lang = "HTML"
        elif "go" in p or "golang" in p:
            lang = "Go"
        elif "rust" in p:
            lang = "Rust"
        return {"tool": "generate_code_snippet", "args": {"topic": prompt, "language": lang}}

    # 2. Website link previews & developer documentation portals
    if (
        re.search(r"\b(websites?|web\s*links?|portals?|docs?|documentation|official\s*sites?)\b", p) or
        re.search(r"\b(recommend|suggest|show|find)\b.*\b(sites?|links?|resources?|urls?)\b", p)
    ):
        cleaned_query = re.sub(r"^(recommend\s+(some\s+)?(good\s+)?sites?\s+(for\s+)?|suggest\s+sites?\s+(for\s+)?|find\s+websites?\s+(for\s+)?|show\s+links?\s+(for\s+)?)", "", p, flags=re.IGNORECASE).strip()
        return {"tool": "fetch_website_info", "args": {"query": cleaned_query or prompt}}

    # 3. Interactive Excalidraw visual architecture, sprint planning, and diagrams
    if (
        re.search(r"\b(excalidraw|architecture\s*diagram|system\s*design|sprint\s*plan|kanban|sticky\s*notes?|whiteboard|flowcharts?|wireframes?|planning\s*board|roadmap\s*board)\b", p) or
        re.search(r"\b(draw|plan|visualize)\b.*\b(architecture|infrastructure|workflow|pipeline|sprint|roadmap|canvas)\b", p)
    ):
        return {"tool": "generate_planning_board", "args": {"topic": prompt}}

    # 4. Flight search and route planning
    if (
        re.search(r"\b(flights?|fly\s+to|fly\s+from|plane\s*tickets?|airfares?|airlines?|aviation)\b", p) or
        re.search(r"\btickets?\s+from\s+[a-zA-Z\s]+\s+to\s+[a-zA-Z\s]+", p)
    ):
        cleaned = re.sub(
            r"\b(with\s+(airlines?|pricing|prices?|schedules?|options?|costs?)|and\s+(pricing|prices?|airlines?)|for\s+(next\s+week|tomorrow|\d+\s+people)|round\s*trip|one\s*way|tickets?|cheap(est)?|please|details?)\b.*",
            "",
            p,
            flags=re.IGNORECASE
        ).strip()

        origin = "Dhaka"
        destination = "Tokyo"

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

    # 5. Weather forecasts & climate metrics
    if (
        re.search(r"\b(weather|temperature|forecast|sunny|rain(ing|y)?|climate)\b", p) or
        re.search(r"\b(how\s+is\s+the\s+weather|is\s+it\s+hot|is\s+it\s+cold)\b", p)
    ):
        city = "Tokyo"
        city_match = re.search(r"\b(?:weather|forecast|temperature|climate)\s+(?:in|for|at|of)\s+([a-zA-Z\s]+)", p)
        if city_match:
            candidate = city_match.group(1).strip().rstrip("?.,!")
            candidate = re.sub(r"\b(today|tomorrow|now|please|forecast|temperature)\b", "", candidate, flags=re.IGNORECASE).strip()
            if candidate:
                city = candidate.title()
        else:
            for c in ["tokyo", "delhi", "dhaka", "london", "new york", "paris", "dubai", "singapore", "chicago", "seattle", "sydney", "bangkok", "kolkata", "mumbai", "san francisco", "berlin"]:
                if re.search(r"\b" + re.escape(c) + r"\b", p):
                    city = c.title()
                    break
        return {"tool": "get_weather_data", "args": {"city": city}}

    # 6. Meeting Time Picker & Calendar Scheduling
    if (
        re.search(r"\b(schedule|book)\b.*\b(meeting|call|sync|appointment|slot|time)\b", p) or
        re.search(r"\b(calendar\s*slot|meeting\s*picker|book\s*time|sync\s*up\s*call|1:1\s*sync)\b", p)
    ):
        duration = 30
        if "15" in p or "quick" in p:
            duration = 15
        elif "45" in p:
            duration = 45
        elif "60" in p or "1 hour" in p or "one hour" in p:
            duration = 60
        return {"tool": "schedule_meeting", "args": {"reason": prompt, "duration_minutes": duration}}

    # 7. Currency conversion & exchange rates
    curr_regex = r"(usd|dollars?|bdt|taka|eur|euros?|gbp|pounds?|jpy|yen|inr|rupees?|cad|aud|sgd|aed)"
    if (
        re.search(r"\b(exchange\s*rates?|forex|currency\s*converter|convert\s+currency)\b", p) or
        re.search(rf"\b{curr_regex}\s+(to|in|into)\s+{curr_regex}\b", p) or
        re.search(rf"\bconvert\s+(\$|৳|€|£|¥|₹)?\s*[\d,]+(\.\d+)?\s*{curr_regex}?\s+(to|in|into)\b", p)
    ):
        fc, tc, amt = "USD", "BDT", 100.0
        currency_map = {
            "usd": "USD", "dollar": "USD", "dollars": "USD", "$": "USD",
            "bdt": "BDT", "taka": "BDT", "৳": "BDT",
            "eur": "EUR", "euro": "EUR", "euros": "EUR", "€": "EUR",
            "gbp": "GBP", "pound": "GBP", "pounds": "GBP", "£": "GBP",
            "jpy": "JPY", "yen": "JPY", "¥": "JPY",
            "inr": "INR", "rupee": "INR", "rupees": "INR", "₹": "INR",
            "cad": "CAD", "aud": "AUD", "sgd": "SGD", "aed": "AED",
        }
        to_splits = re.split(r"\b(to|in|into)\b", p, flags=re.IGNORECASE)
        if len(to_splits) > 2:
            left_part = to_splits[0]
            right_part = to_splits[2]
            for word, code in currency_map.items():
                if re.search(r"\b" + re.escape(word) + r"\b", left_part, flags=re.IGNORECASE):
                    fc = code
                    break
            for word, code in currency_map.items():
                if re.search(r"\b" + re.escape(word) + r"\b", right_part, flags=re.IGNORECASE):
                    tc = code
                    break
        nums = re.findall(r"[\d,]+\.?\d*", p)
        if nums:
            try:
                amt = float(nums[0].replace(",", ""))
            except:
                amt = 100.0
        return {"tool": "convert_currency", "args": {"from_currency": fc, "to_currency": tc, "amount": amt}}

    # 8. Tech job search & recruitment
    if (
        re.search(r"\b(tech\s*jobs?|developer\s*jobs?|software\s*engineer\s*jobs?|bdjobs?|linkedin\s*jobs?|job\s*openings?|job\s*vacanc(y|ies)|hiring\s+for|open\s*positions?|engineer\s*vacanc(y|ies))\b", p) or
        (re.search(r"\b(find|search|show|any)\b", p) and re.search(r"\b(jobs?|vacancies|positions)\b", p) and not re.search(r"\b(cron|background|batch)\s*job\b", p))
    ):
        platform = "All"
        if "bdjob" in p:
            platform = "BDJobs"
        elif "linkedin" in p:
            platform = "LinkedIn"
        return {"tool": "search_jobs", "args": {"query": prompt, "location": "Dhaka, Bangladesh", "platform": platform}}

    # 9. Enterprise Sales Analytics & Ledger
    if re.search(r"\b(sales\s*analytics|revenue|arr\b|mrr\b|sales\s*dashboard|quarterly\s*sales|sales\s*ledger|kpi\s*report|annual\s*revenue)\b", p):
        quarter = "Q3"
        for q in ["q1", "q2", "q3", "q4"]:
            if q in p:
                quarter = q.upper()
                break
        return {"tool": "get_sales_analytics", "args": {"quarter": quarter, "year": 2026}}

    # 10. Hardware product catalog comparison
    if (
        re.search(r"\b(macbook|thinkpad|dell\s*xps|laptop\s*specs|compare\s*laptops?|hardware\s*specs|product\s*catalog|macbook\s*vs)\b", p) or
        (re.search(r"\bcompare\b", p) and re.search(r"\b(m3|m4|laptop|specs|macbook|thinkpad)\b", p))
    ):
        return {"tool": "search_product_catalog", "args": {"query": prompt}}

    # 11. Geographic transit routing & distances
    if re.search(r"\b(distance\s+from|driving\s+route|driving\s+distance|directions\s+to|drive\s+from|how\s+far\s+is\s+.*from)\b", p):
        origin = "San Francisco, CA"
        destination = "Lake Tahoe, CA"
        if "to" in p:
            parts = p.split("to")
            if len(parts) > 1:
                destination = parts[1].strip().title()
        return {"tool": "calculate_route_distance", "args": {"origin": origin, "destination": destination}}

    # 12. Human-in-the-Loop Sensitive Action Gatekeeper
    if re.search(r"\b(refund\s*order|refund\s*customer|deploy\s*(to\s*)?prod(uction)?|database\s*migration\s*approval|sensitive\s*action|human\s*in\s*the\s*loop|hitl\b)\b", p):
        return {"tool": "request_sensitive_action", "args": {"action_type": "customer_refund", "target_id": "ORD-8921", "amount": 1250.00, "reason": "Customer billing adjustment"}}

    return None


