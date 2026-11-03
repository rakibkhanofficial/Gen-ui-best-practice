from typing import Dict, Any, List
from app.models.schemas import CodeSnippetData, CodeFile


def generate_code_snippet(topic: str = "FastAPI SSE Streaming with React Client", language: str = "TypeScript") -> Dict[str, Any]:
    """Generates multi-file production-grade code snippets dynamically tailored to the user's coding topic."""
    t_lower = topic.lower()

    # 1. Binary Search / Algorithms
    if any(k in t_lower for k in ["binary search", "tree", "bst", "algorithm", "sort", "graph"]):
        py_code = '''# Production-Grade Binary Search Tree (BST) with Type Annotations
from typing import Optional, List

class TreeNode:
    def __init__(self, val: int):
        self.val: int = val
        self.left: Optional[TreeNode] = None
        self.right: Optional[TreeNode] = None

class BinarySearchTree:
    def __init__(self):
        self.root: Optional[TreeNode] = None

    def insert(self, val: int) -> None:
        """Inserts a value into the BST in O(log n) average time."""
        if not self.root:
            self.root = TreeNode(val)
            return

        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    break
                curr = curr.left
            elif val > curr.val:
                if not curr.right:
                    curr.right = TreeNode(val)
                    break
                curr = curr.right
            else:
                break  # Duplicate values ignored

    def search(self, target: int) -> bool:
        """Search for a target value in O(log n) time."""
        curr = self.root
        while curr:
            if curr.val == target:
                return True
            curr = curr.left if target < curr.val else curr.right
        return False

# Benchmark Example
bst = BinarySearchTree()
for num in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(num)

print(f"Search 40 in BST: {bst.search(40)}")  # True
print(f"Search 99 in BST: {bst.search(99)}")  # False'''

        ts_code = '''// Type-safe Binary Search Tree implementation in TypeScript
export class BSTNode<T> {
  value: T;
  left: BSTNode<T> | null = null;
  right: BSTNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class BinarySearchTree<T> {
  root: BSTNode<T> | null = null;

  insert(value: T): void {
    const newNode = new BSTNode(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      } else {
        break;
      }
    }
  }

  has(target: T): boolean {
    let current = this.root;
    while (current) {
      if (current.value === target) return true;
      current = target < current.value ? current.left : current.right;
    }
    return false;
  }
}'''

        files = [
            CodeFile(
                filename="bst_algorithm.py",
                language="python",
                code=py_code,
                explanation="Binary Search Tree with iterative logarithmic insertion and search routines to avoid recursion depth limits.",
                output_simulation="Search 40 in BST: True\nSearch 99 in BST: False\nBenchmark: 100,000 node inserts executed in 14.2ms.",
                complexity="O(log n) average, O(n) worst-case",
            ),
            CodeFile(
                filename="BinarySearchTree.ts",
                language="typescript",
                code=ts_code,
                explanation="Generic TypeScript implementation supporting comparable primitives and custom comparator hooks.",
                output_simulation="[TypeScript 5.6] All type checks passed with 0 errors.",
                complexity="O(log n)",
            )
        ]

    # 2. Authentication / JWT / Security
    elif any(k in t_lower for k in ["auth", "jwt", "login", "token", "security", "middleware"]):
        ts_code = '''// Next.js 16 Edge Middleware JWT Verification
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secure-secret-key");

export async function verifyAuthToken(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });

    // Attach user context headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(payload.sub));
    requestHeaders.set("x-user-role", String(payload.role || "user"));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }
}'''

        py_code = '''# FastAPI JWT Authentication Dependency with PyJWT
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "super-secret-genui-signing-key"
ALGORITHM = "HS256"
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=24)) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {"user_id": user_id, "role": payload.get("role", "user")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")'''

        files = [
            CodeFile(
                filename="auth_middleware.ts",
                language="typescript",
                code=ts_code,
                explanation="Edge-runtime JWT validator using jose library for sub-millisecond verification without cold starts.",
                output_simulation="✓ Valid token received for subject: usr_9941\n✓ Headers injected: x-user-id, x-user-role\n✓ Handshake completed in 1.4ms.",
                complexity="O(1)",
            ),
            CodeFile(
                filename="security_deps.py",
                language="python",
                code=py_code,
                explanation="FastAPI HTTPBearer dependency with strict token expiration and role-based access control (RBAC).",
                output_simulation="Generated token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nVerification: HTTP 200 OK for sub='usr_9941'.",
                complexity="O(1)",
            )
        ]

    # 3. Default / SSE Streaming & GenUI Pattern
    else:
        ts_code = '''// Real-time SSE Stream Consumer in Next.js 16 with Streamdown
import { useState, useEffect } from "react";

export function useSSEStream(endpoint: string) {
  const [content, setContent] = useState("");
  const [stage, setStage] = useState<"Thinking" | "Searching" | "Analysing" | "Completed">("Thinking");

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

        py_code = '''# FastAPI Server-Sent Events (SSE) Streaming Endpoint with Gemini 3.8 Flash
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

async def event_generator(prompt: str):
    # Stage 1: Thinking
    yield f"data: {json.dumps({'event': 'status', 'stage': 'Thinking', 'detail': 'Evaluating query with Gemini 3.8 Flash'})}\\n\\n"
    await asyncio.sleep(1.2)

    # Stage 2: Searching
    yield f"data: {json.dumps({'event': 'status', 'stage': 'Searching', 'detail': 'Scanning active knowledge tools'})}\\n\\n"
    await asyncio.sleep(1.6)

    # Stage 3: Streaming Tokens
    tokens = ["Generative", "UI", "empowers", "AI", "agents", "with", "React!"]
    for token in tokens:
        yield f"data: {json.dumps({'event': 'delta', 'text': token + ' '})}\\n\\n"
        await asyncio.sleep(0.04)

    yield f"data: {json.dumps({'event': 'status', 'stage': 'Completed'})}\\n\\n"
    yield f"data: {json.dumps({'event': 'done'})}\\n\\n"

@app.post("/api/chat/stream")
def stream_chat(prompt: str):
    return StreamingResponse(event_generator(prompt), media_type="text/event-stream")'''

        files = [
            CodeFile(
                filename="useSSEStream.ts",
                language="typescript",
                code=ts_code,
                explanation="Custom React Hook for consuming Server-Sent Events (SSE) with stage tracking and token accumulation.",
                output_simulation="Connected to SSE proxy at /api/chat/stream...\nStage: Thinking -> Searching -> Analysing -> Completed\nTokens buffered: 48 tokens in 1.4s.",
                complexity="O(n) where n is stream token length",
            ),
            CodeFile(
                filename="main.py",
                language="python",
                code=py_code,
                explanation="FastAPI async generator emitting SSE standard text/event-stream chunks with JSON payloads.",
                output_simulation="INFO: Uvicorn running on http://127.0.0.1:8000\nINFO: SSE Connection accepted (Status 200 OK)",
                complexity="O(1) memory per client stream",
            )
        ]

    data = CodeSnippetData(
        title=f"Code Studio: {topic.title()}",
        description=f"Multi-file production architecture and algorithm implementation for '{topic}'.",
        active_language=language,
        execution_command="python -m pytest tests/ -v" if "py" in language.lower() else "npm run test",
        files=files,
    )
    return data.model_dump()
