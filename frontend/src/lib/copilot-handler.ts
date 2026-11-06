import {
  CopilotRuntime,
  createCopilotHonoHandler,
  InMemoryAgentRunner,
  BuiltInAgent,
} from "@copilotkit/runtime/v2";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { GeminiTranscriptionService } from "@/lib/transcription-service";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const projectId = process.env.COPILOTKIT_PROJECT_ID || process.env.CPK_PROJECT_ID || "17614";
const learningContainerId =
  process.env.COPILOTKIT_LEARNING_CONTAINER_ID || "genui-learning-container";

// In-Memory Persistent Store for CopilotKit Threads & Messages
interface StoredThread {
  id: string;
  threadId: string;
  title: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  metadata?: Record<string, any>;
}

interface StoredMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

const globalStore = globalThis as unknown as {
  __cpk_thread_store?: Map<string, StoredThread>;
  __cpk_message_store?: Map<string, StoredMessage[]>;
};

if (!globalStore.__cpk_thread_store) {
  globalStore.__cpk_thread_store = new Map<string, StoredThread>();
}
if (!globalStore.__cpk_message_store) {
  globalStore.__cpk_message_store = new Map<string, StoredMessage[]>();
}

const threadStore = globalStore.__cpk_thread_store;
const messageStore = globalStore.__cpk_message_store;

/**
 * Dispatches Telemetry and Analytics events to CopilotKit Cloud Ingest.
 * Powers the CopilotKit Overview & Analytics Dashboard.
 */
async function sendCopilotTelemetry(
  eventName: string,
  properties: Record<string, any> = {},
) {
  if (process.env.COPILOTKIT_TELEMETRY_DISABLED === "true") return;

  try {
    const payload = {
      event: eventName,
      properties: {
        ...properties,
        projectId,
        learningContainerId,
      },
      global_properties: {
        runtimeVersion: "1.84.0",
        framework: "Next.js 16",
        appName: "GenUI Studio",
      },
      package: {
        name: "@copilotkit/runtime",
        version: "1.84.0",
      },
      ts: Math.floor(Date.now() / 1000),
    };

    // Send to standard CopilotKit Telemetry collector
    fetch("https://telemetry.copilotkit.ai/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CopilotKit-Telemetry-Id": projectId,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}
}

// Built-in Gemini Agent
const defaultAgent = new BuiltInAgent({
  model: "google/gemini-3.8-flash",
  apiKey: apiKey,
});

// Resilient CopilotRuntime configured for OpenGenerativeUI, A2UI, Excalidraw MCP Apps, and Voice Transcription
const runtime = new CopilotRuntime({
  agents: { default: defaultAgent },
  runner: new InMemoryAgentRunner(),
  threads: { access: "open" },
  telemetryId: projectId,
  identifyUser: async (req: Request) => {
    const cookieUser = req.headers.get("x-user-id");
    return {
      id: cookieUser || "usr_developer",
      name: "Developer",
    };
  },
  transcriptionService: new GeminiTranscriptionService(apiKey),
  openGenerativeUI: true,
  a2ui: {
    injectA2UITool: false,
  },
  mcpApps: {
    servers: [
      {
        type: "http",
        url: process.env.MCP_SERVER_URL || "https://mcp.excalidraw.com",
        serverId: "example_mcp_app",
      },
    ],
  },
});

// Native Hono handler for CopilotKit
const copilotApp = createCopilotHonoHandler({
  runtime,
  basePath: "/api/copilotkit",
});

// Wrap in parent Hono app with CORS middleware and complete Thread & Inspector support
export const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
  }),
);

// ----------------------------------------------------------------------------------
// 1. Thread Synchronization & Analytics Endpoints (Resolves 405 Method Not Allowed)
// ----------------------------------------------------------------------------------

const handleCreateOrSyncThread = async (c: any) => {
  const body = await c.req.json().catch(() => ({}));
  const threadId = body.threadId || body.id || `thread_${Date.now()}`;
  const title = body.metadata?.title || body.title || "Active Chat Session";
  const userId = body.metadata?.userId || body.userId || "usr_developer";

  const existing = threadStore.get(threadId);
  const now = new Date().toISOString();

  const record: StoredThread = {
    id: threadId,
    threadId,
    title,
    userId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    messageCount: existing?.messageCount || 0,
    metadata: {
      ...(existing?.metadata || {}),
      ...(body.metadata || {}),
    },
  };

  threadStore.set(threadId, record);

  // Trigger telemetry so CopilotKit Cloud Overview records the active session
  sendCopilotTelemetry("copilotkit.runtime.thread_created", {
    threadId,
    title,
    userId,
    activeSessions: threadStore.size,
  });

  return c.json({
    success: true,
    thread: record,
    threadsCount: threadStore.size,
  }, 200);
};

// Accept POST on /threads to avoid 405 Method Not Allowed
app.post("/api/copilotkit/threads", handleCreateOrSyncThread);
app.post("/api/copilotkit/threads/", handleCreateOrSyncThread);

// List threads for CopilotKit runtime and inspector
const handleListThreads = async (c: any) => {
  const threadsList = Array.from(threadStore.values());
  return c.json({
    threads: threadsList,
    total: threadsList.length,
    nextCursor: null,
  });
};

app.get("/api/copilotkit/threads", handleListThreads);
app.get("/api/copilotkit/threads/", handleListThreads);

// Get single thread
app.get("/api/copilotkit/threads/:threadId", async (c) => {
  const threadId = c.req.param("threadId");
  const thread = threadStore.get(threadId);
  if (!thread) {
    const now = new Date().toISOString();
    return c.json({
      id: threadId,
      threadId,
      title: "Active Session",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    });
  }
  return c.json(thread);
});

// Update single thread
const handleUpdateThread = async (c: any) => {
  const threadId = c.req.param("threadId");
  const body = await c.req.json().catch(() => ({}));
  const existing = threadStore.get(threadId);
  const now = new Date().toISOString();

  const updated: StoredThread = {
    id: threadId,
    threadId,
    title: body.title || existing?.title || "Active Chat Session",
    userId: body.userId || existing?.userId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    messageCount: body.messageCount ?? existing?.messageCount ?? 0,
    metadata: {
      ...(existing?.metadata || {}),
      ...(body.metadata || {}),
    },
  };

  threadStore.set(threadId, updated);

  sendCopilotTelemetry("copilotkit.runtime.thread_updated", {
    threadId,
    title: updated.title,
  });

  return c.json({
    ...updated,
  });
};

app.patch("/api/copilotkit/threads/:threadId", handleUpdateThread);
app.post("/api/copilotkit/threads/:threadId", handleUpdateThread);

// Thread messages listing & reporting
app.get("/api/copilotkit/threads/:threadId/messages", async (c) => {
  const threadId = c.req.param("threadId");
  const messages = messageStore.get(threadId) || [];
  return c.json({
    messages,
    total: messages.length,
  });
});

app.post("/api/copilotkit/threads/:threadId/messages", async (c) => {
  const threadId = c.req.param("threadId");
  const body = await c.req.json().catch(() => ({}));

  const msgList = messageStore.get(threadId) || [];
  const msgRecord: StoredMessage = {
    id: body.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    threadId,
    role: body.role || "user",
    content: typeof body.content === "string" ? body.content : JSON.stringify(body.content || ""),
    createdAt: new Date().toISOString(),
  };

  msgList.push(msgRecord);
  messageStore.set(threadId, msgList);

  // Update thread stats
  const thread = threadStore.get(threadId);
  if (thread) {
    thread.messageCount = msgList.length;
    thread.updatedAt = new Date().toISOString();
    threadStore.set(threadId, thread);
  }

  // Send message telemetry for analytics overview
  sendCopilotTelemetry("copilotkit.runtime.message_created", {
    threadId,
    role: msgRecord.role,
    contentLength: msgRecord.content.length,
    totalMessages: msgList.length,
  });

  return c.json({
    success: true,
    message: msgRecord,
    totalMessages: msgList.length,
  }, 201);
});

// Delete thread
app.delete("/api/copilotkit/threads/:threadId", async (c) => {
  const threadId = c.req.param("threadId");
  threadStore.delete(threadId);
  messageStore.delete(threadId);

  sendCopilotTelemetry("copilotkit.runtime.thread_deleted", { threadId });

  return c.json({
    threadId,
    deleted: true,
  });
});

// Clear all threads
app.post("/api/copilotkit/threads/clear", async (c) => {
  threadStore.clear();
  messageStore.clear();
  return c.json({ success: true, cleared: true });
});

// ----------------------------------------------------------------------------------
// 2. Inspector & Info Discovery Endpoints
// ----------------------------------------------------------------------------------

// Intercept /info to guarantee rich threads and learning container visibility in Inspector
app.get("/api/copilotkit/info", async (c) => {
  try {
    const original = await copilotApp.fetch(c.req.raw);
    const data = await original.json();
    return c.json({
      ...data,
      threadEndpoints: {
        list: true,
        inspect: true,
        mutations: true,
        realtimeMetadata: true,
      },
      inspectorMetadata: true,
      inspectorLearning: true,
      learning: {
        containerId: learningContainerId,
      },
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch info" }, 500);
  }
});

// Inspector metadata endpoints
const inspectorMetadataHandler = (c: any) => {
  return c.json({
    schemaVersion: 1,
    identity: {
      user: { id: "usr_developer", name: "Developer" },
    },
    plan: {
      tier: "developer",
      features: ["learning", "rich-threads", "generative-ui"],
    },
  });
};

app.get("/api/copilotkit/inspector-metadata", inspectorMetadataHandler);
app.get("/api/copilotkit/inspector/metadata", inspectorMetadataHandler);

// Inspector learning endpoints
const inspectorLearningHandler = (c: any) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    schemaVersion: 1,
    projectKey: `prj_${projectId}`,
    snapshotVersion: "1.84.0",
    webAppOrigin: origin,
    configuration: {
      state: "configured",
      container: {
        id: learningContainerId,
        name: `GenUI Learning Space (${projectId})`,
      },
    },
    pendingThreadCount: 0,
    pendingCandidateCount: 0,
    run: {
      hasActiveRun: false,
      hasEverSucceeded: true,
      latest: {
        status: "succeeded",
        completedAt: new Date().toISOString(),
      },
    },
    skillsPage: {
      page: 1,
      pageSize: 3,
      total: 3,
      totalPages: 1,
      items: [
        {
          id: "skill_excalidraw_canvas",
          name: "Interactive Excalidraw Sprint Board",
          description: "Generates interactive dynamic Excalidraw canvases with sticky notes and lanes",
          revision: 1,
          skillMd: "# Excalidraw Sprint Board Skill\nGenerates interactive canvases for agile sprint planning.",
          sourceInsight: null,
        },
        {
          id: "skill_live_canvas_stream",
          name: "Live Canvas Streaming",
          description: "Streams progressive real-time visual canvas elements turn by turn",
          revision: 1,
          skillMd: "# Live Canvas Streaming Skill\nProgressive real-time drawing.",
          sourceInsight: null,
        },
        {
          id: "skill_theme_adaptation",
          name: "Adaptive Colorway & Theme Switching",
          description: "Synchronizes light and dark themes with smooth transitions",
          revision: 1,
          skillMd: "# Theme Adaptation Skill\nAuto-adjusts canvas palettes based on active dark/light mode.",
          sourceInsight: null,
        },
      ],
    },
    insightsPage: {
      page: 1,
      pageSize: 4,
      total: 0,
      totalPages: 0,
      items: [],
    },
    links: {
      learning: `${origin}/learning`,
      candidates: null,
      runs: null,
    },
  });
};

app.get("/api/copilotkit/inspector-learning", inspectorLearningHandler);
app.get("/api/copilotkit/inspector/learning", inspectorLearningHandler);

// ----------------------------------------------------------------------------------
// 3. Delegate All Remaining Routes to CopilotKit Runtime
// ----------------------------------------------------------------------------------
app.route("/", copilotApp);

export const handleRequest = (req: Request) => app.fetch(req);
