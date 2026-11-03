from typing import Dict, Any, List
from app.models.schemas import CodeSnippetData, CodeFile


def generate_code_snippet(topic: str = "FastAPI SSE Streaming with React Client", language: str = "TypeScript") -> Dict[str, Any]:
    """Generates multi-file production-grade code snippets with simulated output and explanations.
    
    Args:
        topic: The coding question or algorithm (e.g. 'SSE Streaming', 'Binary Search Tree', 'Authentication Middleware').
        language: Primary programming language requested ('TypeScript', 'Python', 'Go', 'Rust').
    """
    ts_code = '''// Real-time SSE Stream consumer in Next.js 16 with Streamdown
import { useState, useEffect } from "react";
import { Streamdown } from "streamdown";

export function useSSEStream(endpoint: string) {
  const [content, setContent] = useState("");
  const [stage, setStage] = useState("Idle");

  const startStream = async (prompt: string) => {
    setContent("");
    setStage("Thinking");

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      // Parse SSE chunks
      for (const line of text.split("\\n\\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = JSON.parse(line.replace("data: ", ""));
        if (data.event === "delta") setContent((c) => c + data.text);
        if (data.event === "status") setStage(data.stage);
      }
    }
  };

  return { content, stage, startStream };
}'''

    py_code = '''# FastAPI Server-Sent Events (SSE) Streaming Endpoint
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

async def event_generator(prompt: str):
    # Stage 1: Thinking
    yield f"data: {json.dumps({'event': 'status', 'stage': 'Thinking'})}\\n\\n"
    await asyncio.sleep(0.3)
    
    # Stage 2: Streaming Tokens
    tokens = ["Generative", "UI", "empowers", "AI", "agents", "with", "React!"]
    for token in tokens:
        yield f"data: {json.dumps({'event': 'delta', 'text': token + ' '})}\\n\\n"
        await asyncio.sleep(0.05)
        
    yield f"data: {json.dumps({'event': 'done'})}\\n\\n"

@app.post("/api/chat/stream")
def stream_chat(prompt: str):
    return StreamingResponse(event_generator(prompt), media_type="text/event-stream")'''

    go_code = '''// High-concurrency SSE handler in Go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SSEEvent struct {
	Event string `json:"event"`
	Text  string `json:"text,omitempty"`
}

func sseHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	tokens := []string{"High", "throughput", "SSE", "stream", "in", "Go!"}
	for _, t := range tokens {
		data, _ := json.Marshal(SSEEvent{Event: "delta", Text: t + " "})
		fmt.Fprintf(w, "data: %s\\n\\n", data)
		flusher.Flush()
		time.Sleep(50 * time.Millisecond)
	}
}'''

    data = CodeSnippetData(
        title=f"Code Solution: {topic.title()}",
        description="Type-safe, production-ready implementation with streaming buffer management.",
        active_language=language,
        execution_command="npm run dev / uvicorn app.main:app",
        files=[
            CodeFile(
                filename="streamClient.ts",
                language="typescript",
                code=ts_code,
                explanation="Frontend hook handling streaming chunk reassembly, decoder buffers, and stage transitions.",
                output_simulation="> Connected to SSE channel\n[Thinking] Analyzing query...\n[Streaming] Outputting tokens: Generative UI empowers AI agents with React!\n[Completed] 200 OK (7 tokens, 42ms)",
                complexity="O(n) time, O(1) buffer space"
            ),
            CodeFile(
                filename="stream_server.py",
                language="python",
                code=py_code,
                explanation="FastAPI streaming response yielding RFC-compliant SSE events formatted with json payloads.",
                output_simulation="INFO: Uvicorn running on http://127.0.0.1:8000\nPOST /api/chat/stream HTTP/1.1 200 OK\nTransfer-Encoding: chunked",
                complexity="O(1) memory per client stream"
            ),
            CodeFile(
                filename="handler.go",
                language="go",
                code=go_code,
                explanation="Idiomatic Go HTTP flusher implementation for ultra-low latency server events.",
                output_simulation="HTTP/1.1 200 OK\nContent-Type: text/event-stream\nTransfer-Encoding: chunked",
                complexity="O(1) memory via zero-allocation byte buffers"
            )
        ]
    )
    return data.model_dump()
