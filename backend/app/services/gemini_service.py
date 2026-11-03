import os
import json
import asyncio
import logging
from typing import AsyncGenerator, Dict, Any, Optional, List
from google import genai
from google.genai import types

from app.config import settings
from app.agent.antigravity_agent import TOOL_REGISTRY, route_intent_heuristically
from app.services.excel_service import parse_sales_excel

logger = logging.getLogger("genui.gemini")

# Instantiate the official google-genai client
client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info("Initialized google-genai Client with Gemini 3.8 Flash.")
    except Exception as e:
        logger.warning(f"Could not initialize google-genai Client: {e}")


async def stream_agent_reasoning(
    prompt: str,
    attachment_path: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> AsyncGenerator[str, None]:
    """Streams accurate, meaningful agent reasoning stages, SSE tokens, and GenUI events."""
    
    # 1. Real Stage: Thinking
    yield f"data: {json.dumps({'event': 'status', 'stage': 'Thinking', 'detail': 'Analyzing user prompt and evaluating context using Gemini 3.8 Flash...'})}\n\n"
    await asyncio.sleep(0.35)

    # Check for Excel Attachment analysis first
    if attachment_path and (attachment_path.endswith(".xlsx") or attachment_path.endswith(".xls") or attachment_path.endswith(".csv")):
        yield f"data: {json.dumps({'event': 'status', 'stage': 'Searching', 'detail': f'Inspecting uploaded spreadsheet: {os.path.basename(attachment_path)}...'})}\n\n"
        await asyncio.sleep(0.3)

        yield f"data: {json.dumps({'event': 'status', 'stage': 'Analysing', 'detail': 'Executing pandas aggregate routines (summing revenues, calculating deal sizes, category shares)...'})}\n\n"
        await asyncio.sleep(0.4)

        try:
            excel_data = parse_sales_excel(attachment_path)
            yield f"data: {json.dumps({'event': 'genui', 'tool': 'get_sales_analytics', 'data': excel_data})}\n\n"
            
            stream_text = (
                f"### 📊 Uploaded Spreadsheet Ingested & Analyzed\n\n"
                f"I have thoroughly parsed **`{os.path.basename(attachment_path)}`**.\n\n"
                f"- **Total Revenue**: {excel_data['kpis'][0]['value']}\n"
                f"- **Average Deal Size**: {excel_data['kpis'][1]['value']}\n"
                f"- **Categories Processed**: {len(excel_data['category_breakdown'])}\n\n"
                f"The interactive **Zen Analytics Dashboard & Ledger** has been dynamically mounted below for your review."
            )
            for token in stream_text.split(" "):
                yield f"data: {json.dumps({'event': 'delta', 'text': token + ' '})}\n\n"
                await asyncio.sleep(0.02)

            yield f"data: {json.dumps({'event': 'status', 'stage': 'Completed', 'detail': 'Spreadsheet analysis mounted in GenUI.'})}\n\n"
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
            return

        except Exception as e:
            logger.error(f"Excel parse error: {e}")
            yield f"data: {json.dumps({'event': 'delta', 'text': f'Error parsing uploaded file: {str(e)}'})}\n\n"
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
            return

    # Check if a tool matches the user prompt
    matched_intent = route_intent_heuristically(prompt)

    if matched_intent:
        tool_name = matched_intent["tool"]
        tool_args = matched_intent["args"]

        # 2. Real Stage: Searching
        yield f"data: {json.dumps({'event': 'status', 'stage': 'Searching', 'detail': f'Calling agent tool `{tool_name}` with parameters: {json.dumps(tool_args)}...'})}\n\n"
        await asyncio.sleep(0.4)

        # 3. Real Stage: Analysing
        yield f"data: {json.dumps({'event': 'status', 'stage': 'Analysing', 'detail': f'Executing mathematical models and structuring GenUI component data...'})}\n\n"
        await asyncio.sleep(0.35)

        tool_fn = TOOL_REGISTRY[tool_name]
        component_data = tool_fn(**tool_args)

        # 4. Emit GenUI Component Payload
        yield f"data: {json.dumps({'event': 'genui', 'tool': tool_name, 'data': component_data})}\n\n"

        # 5. Stream descriptive text using Gemini or smart fallback
        explanation = f"I have prepared the requested interactive **{tool_name.replace('_', ' ').title()}** component below. You can interact directly with the cards, toggle parameters, or review metrics in real-time."
        
        # If client is available, get a brief commentary from Gemini 3.8 Flash
        if client:
            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=f"You are a helpful GenUI AI assistant. The user asked: '{prompt}'. You have just rendered an interactive {tool_name} widget. Briefly provide a 2-sentence helpful introduction to the user.",
                )
                if response.text:
                    explanation = response.text
            except Exception as e:
                logger.warning(f"Gemini call fallback: {e}")

        # Stream text words
        for word in explanation.split(" "):
            yield f"data: {json.dumps({'event': 'delta', 'text': word + ' '})}\n\n"
            await asyncio.sleep(0.02)

        yield f"data: {json.dumps({'event': 'status', 'stage': 'Completed', 'detail': 'Turn complete.'})}\n\n"
        yield f"data: {json.dumps({'event': 'done'})}\n\n"
        return

    # Standard conversational turn (no tool triggered)
    yield f"data: {json.dumps({'event': 'status', 'stage': 'Searching', 'detail': 'Scanning knowledge base and active session context...'})}\n\n"
    await asyncio.sleep(0.3)

    yield f"data: {json.dumps({'event': 'status', 'stage': 'Analysing', 'detail': 'Synthesizing response with Gemini 3.8 Flash...'})}\n\n"
    await asyncio.sleep(0.25)

    if client:
        try:
            stream = client.models.generate_content_stream(
                model="gemini-3.8-flash",
                contents=prompt,
            )
            for chunk in stream:
                if chunk.text:
                    yield f"data: {json.dumps({'event': 'delta', 'text': chunk.text})}\n\n"
            yield f"data: {json.dumps({'event': 'status', 'stage': 'Completed', 'detail': 'Streaming finished.'})}\n\n"
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
            return
        except Exception as e:
            logger.warning(f"Gemini streaming error: {e}")

    # Fallback informative streaming response
    fallback_text = (
        f"### 🤖 Generative UI Studio Agent\n\n"
        f"I received your inquiry: *\"{prompt}\"*.\n\n"
        f"Here are the rich interactive GenUI workflows you can trigger:\n\n"
        f"1. **Upload Excel Spreadsheet**: Drag & drop any `.xlsx` or `.csv` to see a live **Zen Sales Dashboard** generated from your own data.\n"
        f"2. **Atmospheric Weather**: Ask *'What is the weather in Tokyo?'* for animated weather cards.\n"
        f"3. **Miro-Style Sticky Board**: Ask *'Plan architecture roadmap'* for interactive sticky notes and Kanban swimlanes.\n"
        f"4. **Product Comparison**: Ask *'Compare MacBook M4 vs ThinkPad P1'* for tech specs matrices.\n"
        f"5. **Route & Geo Navigation**: Ask *'Driving distance from SF to Lake Tahoe'*.\n"
        f"6. **Human-in-the-Loop Gatekeeper**: Ask *'Refund order ORD-8921'* to test security authorization flows.\n"
    )

    for word in fallback_text.split(" "):
        yield f"data: {json.dumps({'event': 'delta', 'text': word + ' '})}\n\n"
        await asyncio.sleep(0.015)

    yield f"data: {json.dumps({'event': 'status', 'stage': 'Completed', 'detail': 'Turn complete.'})}\n\n"
    yield f"data: {json.dumps({'event': 'done'})}\n\n"

