import logging
import json
from typing import Dict, Any, List, Optional
from google import genai

from app.config import settings
from app.models.schemas import CodeSnippetData, CodeFile

logger = logging.getLogger("genui.code")

# Initialize Gemini client if API key is present
_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize Gemini Client for code_tool: {e}")


def _generate_dynamic_code(topic: str, language: str) -> Optional[CodeSnippetData]:
    """Uses Gemini 3.5 Flash Lite to dynamically synthesize customized production-grade code for any prompt."""
    if not _client:
        return None

    try:
        prompt = f"""You are an expert software engineer. The user is asking for code implementation for: "{topic}".
Preferred primary language: {language}.

Generate a production-grade, complete, working code solution.
Requirements:
1. Provide 1 to 2 focused, clean, practical files.
2. The primary file MUST be placed first at index 0 and be in the requested language ({language}), with an appropriate filename (e.g. main.py for Python, index.html for HTML, useDebounce.ts for TypeScript, scraper.py for scraping).
3. If the user asks for HTML, CSS, JS, web component, interactive calculator, game, dashboard, or web UI artifact:
   - Provide a complete, self-contained single-file HTML document named "index.html" (language: "html") that includes modern responsive styling (<style>) and interactive JavaScript (<script>) so it can be previewed live in an iframe sandbox without build tools. You can also load Tailwind via `<script src="https://cdn.tailwindcss.com"></script>`.
4. Do not truncate code with placeholders like "TODO: implement here". Write real, idiomatic, fully functional code with clear comments.
5. Give a clean, concise title (e.g. "FastAPI Async SSE Streaming", "Interactive Calculator", "Binary Search Algorithm"). Do NOT repeat raw prompts like "Write a script for...".
6. Provide a 1-sentence description.
"""

        for model_name in ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash"]:
            try:
                response = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": CodeSnippetData,
                        "temperature": 0.2,
                    },
                )
                if response and response.text:
                    data = json.loads(response.text)
                    return CodeSnippetData(**data)
            except Exception as model_err:
                logger.debug(f"Code generation with {model_name} failed: {model_err}")
                continue

        return None
    except Exception as e:
        logger.warning(f"Dynamic code synthesis failed: {e}")
        return None


def _get_static_fallback_code(topic: str, language: str) -> CodeSnippetData:
    """High-quality categorized fallback code if dynamic generation is unavailable."""
    t_lower = topic.lower()
    is_html = "html" in language.lower() or any(k in t_lower for k in ["calc", "game", "canvas", "artifact", "website", "landing page"])
    is_python = "python" in language.lower() or "py" in language.lower() or "fastapi" in t_lower

    if is_html:
        html_code = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-xs bg-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-700">
    <div id="display" class="w-full h-16 bg-slate-950 rounded-xl mb-4 px-4 flex items-center justify-end text-3xl font-mono text-emerald-400 overflow-x-auto">
      0
    </div>
    <div class="grid grid-cols-4 gap-2">
      <button onclick="clearDisplay()" class="col-span-2 p-3 bg-rose-600/80 hover:bg-rose-600 rounded-xl font-bold transition">AC</button>
      <button onclick="deleteLast()" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">⌫</button>
      <button onclick="appendOp('/')" class="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition">÷</button>

      <button onclick="appendNum('7')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">7</button>
      <button onclick="appendNum('8')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">8</button>
      <button onclick="appendNum('9')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">9</button>
      <button onclick="appendOp('*')" class="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition">×</button>

      <button onclick="appendNum('4')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">4</button>
      <button onclick="appendNum('5')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">5</button>
      <button onclick="appendNum('6')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">6</button>
      <button onclick="appendOp('-')" class="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition">-</button>

      <button onclick="appendNum('1')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">1</button>
      <button onclick="appendNum('2')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">2</button>
      <button onclick="appendNum('3')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">3</button>
      <button onclick="appendOp('+')" class="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition">+</button>

      <button onclick="appendNum('0')" class="col-span-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">0</button>
      <button onclick="appendNum('.')" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">.</button>
      <button onclick="calculate()" class="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition">=</button>
    </div>
  </div>
  <script>
    let current = '0';
    const display = document.getElementById('display');
    function update() { display.innerText = current; }
    function clearDisplay() { current = '0'; update(); }
    function deleteLast() { current = current.length > 1 ? current.slice(0, -1) : '0'; update(); }
    function appendNum(n) { current = current === '0' && n !== '.' ? n : current + n; update(); }
    function appendOp(op) { if (!['+','-','*','/'].includes(current.slice(-1))) current += op; update(); }
    function calculate() {
      try {
        current = String(Function('"use strict";return (' + current + ')')());
      } catch (e) {
        current = 'Error';
      }
      update();
    }
  </script>
</body>
</html>"""
        return CodeSnippetData(
            title="Interactive Calculator",
            description="Complete single-file web artifact with modern styling and responsive arithmetic calculation logic.",
            active_language="html",
            execution_command="Open in browser or click Preview",
            files=[
                CodeFile(
                    filename="index.html",
                    language="html",
                    code=html_code,
                    explanation="Interactive calculator web application with embedded Tailwind CSS and JavaScript handlers.",
                )
            ]
        )

    if is_python:
        code = '''"""High-Performance Async Server-Sent Events (SSE) Streaming with FastAPI."""
import asyncio
import json
from typing import AsyncGenerator
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI(title="Async SSE Streaming Service")


async def event_stream_generator() -> AsyncGenerator[str, None]:
    """Simulates an asynchronous real-time event generator streaming metrics."""
    stages = ["Initializing", "Searching Knowledge Base", "Synthesizing", "Completed"]
    for idx, stage in enumerate(stages, start=1):
        payload = {
            "step": idx,
            "stage": stage,
            "progress_pct": idx * 25,
            "status": "in_progress" if idx < len(stages) else "done",
        }
        # Standard SSE format requires 'data: <json>\\n\\n'
        yield f"data: {json.dumps(payload)}\\n\\n"
        await asyncio.sleep(0.5)


@app.get("/stream/events")
async def stream_events(request: Request):
    """Streams server-sent events to connected HTTP clients."""
    return StreamingResponse(
        event_stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
'''
        reqs = '''fastapi>=0.115.0
uvicorn>=0.30.0
pydantic>=2.8.0
'''
        return CodeSnippetData(
            title="FastAPI Async SSE Streaming",
            description="Production-grade asynchronous Server-Sent Events (SSE) streaming endpoint with non-blocking event generators.",
            active_language="python",
            execution_command="uvicorn main:app --reload --port 8000",
            files=[
                CodeFile(
                    filename="main.py",
                    language="python",
                    code=code,
                    explanation="Asynchronous generator yielding standard SSE chunks with proper streaming response headers.",
                    output_simulation="INFO: Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)\nStreaming 4 SSE chunks successfully.",
                    complexity="O(1) memory buffer",
                ),
                CodeFile(
                    filename="requirements.txt",
                    language="plaintext",
                    code=reqs,
                    explanation="Runtime dependencies required for FastAPI and Uvicorn ASGI server.",
                    output_simulation="Successfully installed fastapi uvicorn pydantic.",
                    complexity="N/A",
                ),
            ],
        )

    # TypeScript / Frontend fallback
    ts_code = '''/**
 * Real-time Server-Sent Events (SSE) React Hook.
 * Consumes streaming text and status events with auto-reconnect.
 */
import { useState, useCallback } from "react";

export interface StreamEvent {
  event: "delta" | "status" | "done";
  text?: string;
  stage?: string;
}

export function useSSEStream(endpoint: string) {
  const [content, setContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(
    async (prompt: string) => {
      setContent("");
      setError(null);
      setIsStreaming(true);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\\n\\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data: StreamEvent = JSON.parse(line.replace("data: ", ""));
            if (data.event === "delta" && data.text) {
              setContent((prev) => prev + data.text);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Stream error");
      } finally {
        setIsStreaming(false);
      }
    },
    [endpoint]
  );

  return { content, isStreaming, error, startStream };
}
'''
    return CodeSnippetData(
        title="React SSE Stream Consumer Hook",
        description="Type-safe React hook for consuming Server-Sent Events with ReadableStream decoders.",
        active_language="typescript",
        execution_command="npx tsc --noEmit",
        files=[
            CodeFile(
                filename="useSSEStream.ts",
                language="typescript",
                code=ts_code,
                explanation="Stream consumer hook utilizing native Fetch API and TextDecoder for chunk-by-chunk accumulation.",
                output_simulation="[TypeScript] Compilation check passed. 0 errors.",
                complexity="O(n) where n is stream length",
            )
        ],
    )


def generate_code_snippet(
    topic: str = "FastAPI SSE Streaming with React Client",
    language: str = "TypeScript",
) -> Dict[str, Any]:
    """Generates tailored code snippets dynamically using Gemini, falling back to clean static templates."""
    # 1. Attempt dynamic generation with Gemini
    dynamic_solution = _generate_dynamic_code(topic, language)
    if dynamic_solution:
        logger.info(f"Synthesized dynamic code snippet for topic: '{topic}' ({len(dynamic_solution.files)} files)")
        return dynamic_solution.model_dump()

    # 2. Fall back to curated clean code
    logger.info(f"Using fallback code template for topic: '{topic}'")
    fallback_solution = _get_static_fallback_code(topic, language)
    return fallback_solution.model_dump()
