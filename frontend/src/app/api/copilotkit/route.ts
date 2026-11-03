import {
  CopilotRuntime,
  createCopilotEndpoint,
  InMemoryAgentRunner,
  BuiltInAgent,
} from "@copilotkit/runtime/v2";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

// Built-in Gemini Agent (no LangSmith API key required)
const defaultAgent = new BuiltInAgent({
  model: "google/gemini-3.8-flash",
  apiKey: apiKey,
});

// CopilotRuntime with OpenGenerativeUI, A2UI, and Excalidraw MCP Apps
const runtime = new CopilotRuntime({
  agents: { default: defaultAgent },
  runner: new InMemoryAgentRunner(),
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
  threads: {
    access: "open",
  },
});

const copilotApp = createCopilotEndpoint({
  runtime,
  basePath: "/api/copilotkit",
});

// Wrap the CopilotKit endpoint in a parent Hono app with CORS middleware registered first
const app = new Hono();
app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["*"],
  }),
);
app.route("/", copilotApp);

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
