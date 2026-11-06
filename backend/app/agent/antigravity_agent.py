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
from app.agent.tools.medicine_tool import search_medicines
from app.agent.tools.doctor_tool import search_doctors
from app.agent.tools.agri_tool import search_agri_products
from app.agent.tools.map_tool import search_places_map
from app.agent.tools.math_tool import solve_math_problem
from app.agent.tools.hotel_tool import search_hotels
from app.agent.tools.news_tool import search_news

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
    "search_medicines": search_medicines,
    "search_doctors": search_doctors,
    "search_agri_products": search_agri_products,
    "search_places_map": search_places_map,
    "solve_math_problem": solve_math_problem,
    "search_hotels": search_hotels,
    "search_news": search_news,
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
                "description": "Search smartphones, flagship devices, laptops, and tech products. Provides deep technical specifications, colors, storage options, and side-by-side comparison matrices with category winners.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Product name or comparison query, e.g. 'iPhone 16 Pro details', 'iPhone 16 Pro vs Samsung Galaxy S24 Ultra'"}
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
        },
        {
            "type": "function",
            "function": {
                "name": "search_hotels",
                "description": "Find premier luxury hotels, resorts, boutique stays, nightly pricing, and amenities for any city, region, or country worldwide. If user has not specified a destination, pass an empty location to trigger interactive clarification.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "City, region, or country name, e.g. 'Paris', 'Tokyo', 'Cox\\'s Bazar', or empty string if unspecified."}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_news",
                "description": "Searches real-time news articles, breaking headlines, and editorial briefings across tech, AI, business, financial markets, science, space, and world affairs.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Specific news topic, keyword, or query (e.g. 'latest AI news', 'NVIDIA Blackwell news', 'SpaceX news', 'Bangladesh economy')."},
                        "category": {"type": "string", "description": "Optional category filter: 'All', 'Technology & AI', 'Business & Markets', 'Science & Space', 'Bangladesh', 'World'."}
                    },
                    "required": ["query"]
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
        "search_medicines",
        "search_doctors",
        "search_agri_products",
        "search_places_map",
        "solve_math_problem",
        "search_hotels",
        "search_news",
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
    specialty: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    expression: Optional[str] = None
    problem_type: Optional[str] = None


def route_intent_with_llm(prompt: str, client: Any) -> Optional[Dict[str, Any]]:
    """Uses Gemini to intelligently determine the interactive GenUI tool and arguments."""
    if not client:
        return None

    try:
        decision_prompt = f"""You are the Generative UI Tool Decision Engine.
Available interactive tools:
- search_medicines(query): For medicine/drug information, generic alternatives (e.g. Napa vs ACI's Xcel, Ace, Paracetamol), dosages, indications, pharmacy pricing.
- search_doctors(query, specialty, location): For finding doctors, top specialists, cardiologists in Dhaka/Bangladesh, chamber addresses, consultation fees, and appointment bookings.
- search_agri_products(query, category): For agricultural products, ACI Agribusiness (seeds, bio-fertilizers, pesticides, tractors), crop care, farming equipment, e-commerce suggestions.
- search_places_map(query, location): For Google Maps embeds, directions, finding hospitals/clinics/places on map, coordinates, opening hours.
- solve_math_problem(expression, problem_type): For math equations, quadratic formulas, calculus derivatives/integrals, algebra, step-by-step LaTeX derivations and graphs.
- search_youtube_videos(query): For finding or showing YouTube videos, tutorials, video lectures, clips, channels, watch recommendations.
- generate_code_snippet(topic, language): For writing, generating, implementing raw code files, scripts, algorithms, HTML/CSS/JS web artifacts, interactive widgets, code studio.
- generate_planning_board(topic): For visual architecture diagrams, sprint planning, Kanban, Miro/Excalidraw canvas roadmaps.
- search_flights(origin, destination): For flight search, fares, airlines, travel tickets between cities.
- get_weather_data(city): For current weather forecasts, temperatures, meteorological reports.
- get_sales_analytics(quarter): For enterprise sales, ARR, revenue metrics, dashboards.
- search_jobs(query): For tech jobs, hiring, vacancies on BDJobs/LinkedIn.
- convert_currency(from_currency, to_currency, amount): For currency exchange and forex.
- calculate_route_distance(origin, destination): For driving distances, travel routes, directions, maps, OpenStreetMap navigation between places (e.g. Mohakhali to Airport Road).
- search_hotels(location): For finding luxury 5-star hotels, resorts, boutique stays, room rates, amenities, and hotel booking in any city, region, or country worldwide. If the user does not specify a location, call search_hotels(location="") so an interactive destination clarification card is presented.
- search_product_catalog(query): For inspecting smartphone specs (e.g. iPhone 16 Pro, Galaxy S24 Ultra, Pixel 9 Pro), flagship hardware, prices in USD and BDT, colors, storage options, and side-by-side device comparison matrices with category winners.
- search_news(query, category): For real-time news articles, breaking headlines, tech & AI developments, financial markets, and global news stories.
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
        if tool == "search_medicines":
            args["query"] = data.get("query") or prompt
        elif tool == "search_doctors":
            args["query"] = data.get("query") or prompt
            args["specialty"] = data.get("specialty") or ("Cardiology" if "cardio" in prompt.lower() or "heart" in prompt.lower() else "General Specialist")
            args["location"] = data.get("location") or "Dhaka, Bangladesh"
        elif tool == "search_agri_products":
            args["query"] = data.get("query") or prompt
            args["category"] = data.get("category") or "All"
        elif tool == "search_places_map":
            args["query"] = data.get("query") or prompt
            args["location"] = data.get("location") or "Dhaka, Bangladesh"
        elif tool == "solve_math_problem":
            args["expression"] = data.get("expression") or prompt
            args["problem_type"] = data.get("problem_type") or ("Calculus" if "deriv" in prompt.lower() or "calculus" in prompt.lower() else "Algebra")
        elif tool == "search_youtube_videos":
            args["query"] = data.get("query") or data.get("topic") or prompt
        elif tool == "generate_planning_board":
            args["topic"] = data.get("topic") or data.get("query") or prompt
        elif tool == "generate_code_snippet":
            args["topic"] = data.get("topic") or data.get("query") or prompt
            detected_lang = data.get("language")
            if not detected_lang:
                if "python" in prompt.lower() or "fastapi" in prompt.lower():
                    detected_lang = "Python"
                elif any(k in prompt.lower() for k in ["html", "css", "calculator", "game", "artifact"]):
                    detected_lang = "HTML"
                else:
                    detected_lang = "TypeScript"
            args["language"] = detected_lang
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
            args["origin"] = data.get("origin") or "Mohakhali, Dhaka"
            args["destination"] = data.get("destination") or "Airport Road, Dhaka"
        elif tool == "search_hotels":
            raw_loc = (data.get("location") or data.get("city") or data.get("destination") or "").strip()
            if raw_loc.lower() in ["any", "anywhere", "hotel", "hotels", "stay", "resort", "unspecified", "none"]:
                raw_loc = ""
            args["location"] = raw_loc
        elif tool == "search_news":
            args["query"] = data.get("query") or prompt
            args["category"] = data.get("category") or "All"
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

    # 10. Hardware product catalog & smartphone specs / comparison
    if (
        re.search(r"\b(iphone|galaxy|s24|pixel\s*[789]|oneplus|xiaomi|macbook|thinkpad|dell\s*xps|smartphone|flagship\s*phone|mobile\s*specs|phone\s*specs|phone\s*details|compare\s*phones?|hardware\s*specs|product\s*catalog|macbook\s*vs|iphone\s*vs)\b", p) or
        (re.search(r"\b(specs|specifications|details|features|price|pricing)\b", p) and re.search(r"\b(iphone|samsung|galaxy|pixel|oneplus|phone|macbook|laptop|m4|s24)\b", p)) or
        (re.search(r"\b(compare|vs|versus)\b", p) and re.search(r"\b(iphone|samsung|galaxy|pixel|oneplus|phone|laptop|macbook|thinkpad|s24)\b", p))
    ):
        return {"tool": "search_product_catalog", "args": {"query": prompt}}

    # 11. OpenStreetMap Directions, Route Planning & Travel Distances
    is_route_request = bool(
        re.search(r"\b(directions?|driving\s*directions?|routes?|driving\s*route|driving\s*distance|how\s+to\s+go|how\s+far|navigation|distance\s+from|distance\s+between)\b", p) and
        (re.search(r"\bfrom\s+.+\s+to\s+", p) or re.search(r"\bto\s+.+\s+from\s+", p) or re.search(r"\bbetween\s+.+\s+and\s+", p) or " to " in p)
    ) or bool(
        re.search(r"\b(direction|directions|route|navigation)\s+from\b", p)
    ) or bool(
        re.search(r"\b(distance|route|how\s+far)\s+(from|between)\b", p)
    )

    if is_route_request:
        origin = "Mohakhali, Dhaka"
        destination = "Airport Road, Dhaka"

        from_to_match = re.search(r"\bfrom\s+(.+?)\s+to\s+(.+)$", p, re.IGNORECASE)
        if from_to_match:
            raw_orig = from_to_match.group(1).strip()
            raw_dest = from_to_match.group(2).strip()
            raw_orig = re.sub(r"^(the|a|my)\s+", "", raw_orig, flags=re.IGNORECASE).strip()
            raw_dest = re.sub(r"\s+(on\s+map|on\s+google\s+map|on\s+osm|please|directions?|route|distance)$", "", raw_dest, flags=re.IGNORECASE).strip()
            if raw_orig:
                origin = raw_orig.title()
            if raw_dest:
                destination = raw_dest.title()
        else:
            between_match = re.search(r"\bbetween\s+(.+?)\s+and\s+(.+)$", p, re.IGNORECASE)
            if between_match:
                origin = between_match.group(1).strip().title()
                destination = re.sub(r"\s+(on\s+map|please)$", "", between_match.group(2).strip(), flags=re.IGNORECASE).title()

        return {"tool": "calculate_route_distance", "args": {"origin": origin, "destination": destination}}

    # 12. Human-in-the-Loop Sensitive Action Gatekeeper
    if re.search(r"\b(refund\s*order|refund\s*customer|deploy\s*(to\s*)?prod(uction)?|database\s*migration\s*approval|sensitive\s*action|human\s*in\s*the\s*loop|hitl\b)\b", p):
        return {"tool": "request_sensitive_action", "args": {"action_type": "customer_refund", "target_id": "ORD-8921", "amount": 1250.00, "reason": "Customer billing adjustment"}}

    # 13. Medicine & Generic Alternatives (Napa, Xcel, Ace, Paracetamol, etc.)
    if (
        re.search(r"\b(napa|xcel|ace|paracetamol|medicines?|drugs?|tablets?|capsules?|syrup|dosage|generic|pharmacy|pharma|alternative\s+to\s+\w+|seclo|losectil|fever\s+medicine|painkiller)\b", p) or
        (re.search(r"\b(find|search|show|get|buy)\b", p) and re.search(r"\b(napa|xcel|paracetamol|medicine|alternative)\b", p))
    ):
        return {"tool": "search_medicines", "args": {"query": prompt}}

    # 14. Doctor Directory & Chamber Booking (Top cardiologists in Dhaka/Bangladesh, etc.)
    if (
        re.search(r"\b(doctors?|physicians?|specialists?|cardiologists?|cardiologist|heart\s+doctor|heart\s+specialist|neurologists?|surgeons?|chamber|visiting\s+hours?|consultant\s+doctor|mbbs|best\s+cardiologist)\b", p) or
        (re.search(r"\b(best|top|find|search)\b", p) and re.search(r"\b(doctor|cardiologist|physician|surgeon|consultant)\b", p))
    ):
        specialty = "Cardiology" if any(k in p for k in ["cardio", "heart", "chest"]) else "General Medicine"
        location = "Dhaka, Bangladesh"
        return {"tool": "search_doctors", "args": {"query": prompt, "specialty": specialty, "location": location}}

    # 15. Agriculture, ACI Agribusiness, Seeds, Fertilizer, Machinery
    if (
        re.search(r"\b(agriculture|agri|agribusiness|crops?|paddy|rice\s+seeds?|hybrid\s+seeds?|fertilizers?|pesticides?|insecticides?|fungicides?|tractor|sonalika|aci\s+crop|aci\s+seed|aci\s+fertilizer|aci\s+agriculture|aci\s+motors|bio\s*fertilizer)\b", p) or
        (re.search(r"\b(aci|crop|farming|farmer|seed|fertilizer)\b", p) and re.search(r"\b(products?|items?|price|catalog|buy)\b", p))
    ):
        category = "All"
        if "seed" in p:
            category = "Hybrid Seeds"
        elif "fertilizer" in p:
            category = "Bio-Fertilizer"
        elif "tractor" in p or "machin" in p:
            category = "Farm Machinery"
        elif "pesticide" in p or "spray" in p:
            category = "Crop Care"
        return {"tool": "search_agri_products", "args": {"query": prompt, "category": category}}

    # 16. Google Maps & Interactive Location Explorer (Specific Landmark/Place/Hospital)
    if (
        re.search(r"\b(where\s+is|find\s+on\s+map|show\s+on\s+map|location\s+of|coordinates\s+of|hospital\s+location|place\s+location|landmark)\b", p) or
        (re.search(r"\b(google\s*maps?|maps?)\b", p) and not is_route_request and re.search(r"\b(where|find|show|locate|hospital|clinic|university|center|station|airport|mirpur|gulshan)\b", p))
    ):
        cleaned_loc = re.sub(r"^(show|find|open|search|where is|get|give me)\s+(the\s+)?(google\s+)?(map\s+(for|of|to)?|location\s+(of|for)?)\s*", "", p, flags=re.IGNORECASE).strip()
        return {"tool": "search_places_map", "args": {"query": cleaned_loc or prompt, "location": "Dhaka, Bangladesh"}}

    # 17. Math Problem Solver & Grapher
    if (
        re.search(r"\b(math|equation|solve|calculate|roots?|quadratic|derivative|differentiat(e|ion)|integrat(e|ion)|calculus|algebra|trigonometry|discriminant|polynomial|formula)\b", p) and
        re.search(r"[0-9xX\+\-\*\/\^=\(\)]", p) and not re.search(r"\b(flights?|usd|bdt|currency)\b", p)
    ):
        p_type = "Calculus" if any(k in p for k in ["deriv", "calculus", "integral", "diff"]) else "Algebra"
        return {"tool": "solve_math_problem", "args": {"expression": prompt, "problem_type": p_type}}

    # 18. Hotel Booking & Resort Directory (Any location worldwide, or interactive clarification if none provided)
    if (
        re.search(r"\b(hotels?|resorts?|motels?|guest\s*houses?|luxury\s*hotel|boutique\s*hotel|hotel\s*rooms?|hotel\s*rates?|hotel\s*price|stay\s+at\s+hotel|book\s+hotel|hotels?\s+in\b|hotels?\s+near\s+me)\b", p) or
        (re.search(r"\b(find|search|show|recommend|book|top|best)\b", p) and re.search(r"\b(hotel|resort|stay|suite)\b", p))
    ):
        loc = ""
        non_loc_tokens = {
            "me", "us", "some", "luxury", "good", "nice", "any", "premier", "cheap", "popular", "great",
            "best", "top", "5-star", "5", "star", "vacation", "weekend", "family", "business", "boutique",
            "recommended", "recommendations", "booking", "stays", "stay", "hotel", "hotels", "resort", "resorts",
            "room", "rooms", "places", "place", "where", "what", "options", "option", "show", "find", "get",
            "a", "an", "the", "for", "with", "at", "to", "my", "our", "trip", "tour", "view", "rates"
        }

        # Pattern 1: "hotels in Paris", "resorts near Inani Beach", "hotels at Gulshan", "hotels around Bali"
        m_in = re.search(r"\b(?:hotels?|resorts?|motels?|stays?|luxury\s+hotel)\s+(?:in|at|near|around|for)\s+([a-zA-Z\s,'\-\.]+?)(?:\s+(?:for|with|from|on|check|next|tomorrow|\d|\?|$)|$)", p)
        if m_in:
            cand = m_in.group(1).strip()
            cand_tokens = [t.strip(",. ") for t in cand.lower().split() if t.strip(",. ")]
            if cand_tokens and not all(t in non_loc_tokens for t in cand_tokens):
                # Filter out leading non-loc words
                meaningful = [t for t in cand.split() if t.lower().strip(",. ") not in {"a", "an", "the", "some", "my", "our", "good", "best", "top", "luxury", "5-star"}]
                if meaningful:
                    loc = " ".join(meaningful).strip(",. ").title()

        # Pattern 2: "Paris hotels", "Tokyo resorts", "Cox's Bazar luxury hotel"
        if not loc:
            m_pre = re.search(r"\b([a-zA-Z\s,'\-\.]+?)\s+(?:hotels?|resorts?|luxury\s+hotel)\b", p)
            if m_pre:
                cand = m_pre.group(1).strip()
                cand_tokens = [t.strip(",. ") for t in cand.lower().split() if t.strip(",. ")]
                if cand_tokens and not all(t in non_loc_tokens for t in cand_tokens):
                    meaningful = [t for t in cand.split() if t.lower().strip(",. ") not in non_loc_tokens]
                    if meaningful:
                        loc = " ".join(meaningful).strip(",. ").title()

        # Pattern 3: Comprehensive recognized destinations list
        if not loc:
            known_destinations = [
                "paris", "tokyo", "dubai", "cox's bazar", "coxs bazar", "cox bazar", "inani",
                "bali", "new york", "london", "sylhet", "sreemangal", "dhaka", "gulshan", "banani",
                "uttara", "chittagong", "bangkok", "singapore", "rome", "switzerland", "maldives",
                "toronto", "amsterdam", "sydney", "barcelona", "kuala lumpur", "istanbul", "kyoto",
                "cairo", "san francisco", "los angeles", "berlin", "vienna", "venice", "santorini"
            ]
            for kd in known_destinations:
                if kd in p:
                    loc = kd.title() + (", Bangladesh" if kd in ["cox's bazar", "coxs bazar", "cox bazar", "inani", "gulshan", "banani", "uttara", "chittagong", "sylhet", "sreemangal", "dhaka"] else "")
                    break

        if "near me" in p or "this location" in p or "current location" in p:
            loc = "Dhaka, Bangladesh"

        # If user explicitly asked without specifying any location, loc remains ""
        # which triggers interactive clarification HITL component!
        return {"tool": "search_hotels", "args": {"location": loc}}

    # 19. Real-Time News, Breaking Headlines & Editorial Reports
    if (
        re.search(r"\b(news|headlines?|breaking\s*news|latest\s*update\s*on|what('s|\s+is)\s+happening|current\s*events|press\s*release|top\s*stories|daily\s*briefing|news\s*feed|wire\s*service)\b", p) or
        (re.search(r"\b(latest|breaking|today'?s|recent)\b", p) and re.search(r"\b(news|updates?|reports?|stories)\b", p))
    ):
        cat = "All"
        if any(k in p for k in ["tech", "ai", "artificial intelligence", "gemini", "deepmind", "gpu", "nvidia", "software", "apple"]):
            cat = "Technology & AI"
        elif any(k in p for k in ["business", "finance", "market", "stocks", "wall street", "economy", "fed", "inflation"]):
            cat = "Business & Markets"
        elif any(k in p for k in ["space", "spacex", "starship", "nasa", "science", "fusion", "quantum"]):
            cat = "Science & Space"
        elif any(k in p for k in ["bangladesh", "dhaka", "bd"]):
            cat = "Bangladesh"
        return {"tool": "search_news", "args": {"query": prompt, "category": cat}}

    return None


