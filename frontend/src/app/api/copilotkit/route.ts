import {
  CopilotRuntime,
  createCopilotEndpoint,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

const defaultAgent = new LangGraphAgent({
  deploymentUrl:
    process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
  graphId: "sample_agent",
  langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
});

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
});

const copilotApp = createCopilotEndpoint({
  runtime,
  basePath: "/api/copilotkit",
});

// Wrap the CopilotKit endpoint in a parent Hono app that runs CORS middleware
// FIRST. Order matters in Hono — middleware runs in registration order, so
// CORS must be registered before the CopilotKit routes are mounted.
// This lets the slides dev server (Vite :5173) call this Next.js runtime
// (:3000) cross-origin without preflight failures on /agent/*/connect etc.
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
