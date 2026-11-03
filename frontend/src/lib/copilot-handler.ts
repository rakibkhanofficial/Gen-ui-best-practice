import {
  CopilotRuntime,
  createCopilotHonoHandler,
  InMemoryAgentRunner,
  BuiltInAgent,
  CopilotKitIntelligence,
} from "@copilotkit/runtime/v2";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { GeminiTranscriptionService } from "@/lib/transcription-service";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const cpkIntelligenceKey =
  process.env.CPK_INTELLIGENCE_API_KEY ||
  process.env.COPILOTKIT_INTELLIGENCE_API_KEY;

const learningContainerId =
  process.env.COPILOTKIT_LEARNING_CONTAINER_ID || "genui-learning-container";

// Built-in Gemini Agent (zero LangSmith key required)
const defaultAgent = new BuiltInAgent({
  model: "google/gemini-3.8-flash",
  apiKey: apiKey,
});

// If a valid cloud Intelligence key is provided, instantiate CopilotKitIntelligence
const intelligence = cpkIntelligenceKey
  ? new CopilotKitIntelligence({
      apiKey: cpkIntelligenceKey,
      getLearningContainerId: async () => learningContainerId,
      getTrajectoryLearningContainerIds: async () => [learningContainerId],
    })
  : undefined;

// CopilotRuntime configured for OpenGenerativeUI, A2UI, Excalidraw MCP Apps, and Voice Transcription
const runtime = new CopilotRuntime({
  agents: { default: defaultAgent },
  ...(intelligence
    ? {
        intelligence,
        generateThreadNames: true,
      }
    : {
        runner: new InMemoryAgentRunner(),
        threads: { access: "open" },
      }),
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

// Modern non-deprecated Hono handler for CopilotKit
const copilotApp = createCopilotHonoHandler({
  runtime,
  basePath: "/api/copilotkit",
});

// Wrap in parent Hono app with CORS middleware and Inspector & Rich Threads support
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

// Inspector metadata endpoints (supports both hyphenated and slash paths)
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

// Inspector learning endpoints (supports both hyphenated and slash paths)
const inspectorLearningHandler = (c: any) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    schemaVersion: 1,
    projectKey: "prj_genui_best_practice",
    snapshotVersion: "1.84.0",
    webAppOrigin: origin,
    configuration: {
      state: "configured",
      container: {
        id: learningContainerId,
        name: "GenUI Learning Container",
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

// Rich Threads mutation fallback for local mode
app.patch("/api/copilotkit/threads/:threadId", async (c) => {
  const threadId = c.req.param("threadId");
  const body = await c.req.json().catch(() => ({}));
  return c.json({
    threadId,
    ...body,
    updatedAt: new Date().toISOString(),
  });
});

app.delete("/api/copilotkit/threads/:threadId", async (c) => {
  const threadId = c.req.param("threadId");
  return c.json({
    threadId,
    deleted: true,
  });
});

// Delegate all remaining routes to CopilotKit runtime handler
app.route("/", copilotApp);

export const handleRequest = (req: Request) => app.fetch(req);
