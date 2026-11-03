import {
  CopilotRuntime,
  BuiltInAgent,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";

// Read API key strictly from environment variables (.env.local / .env)
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

// Configure CopilotKit V2 Runtime with full Generative UI capabilities:
// - A2UI (Agent-to-UI) declarative schema support
// - Open Generative UI protocol middleware
// - Rich Threads with open guest access
// - Gemini 3.8 Flash model execution
const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: "google/gemini-3.8-flash",
      apiKey: apiKey,
    }),
  },
  a2ui: {
    enabled: true,
  },
  openGenerativeUI: true,
  generativeUI: true,
  threads: {
    access: "open",
  },
  identifyUser: () => ({
    id: "guest_presenter",
    name: "Guest Presenter",
  }),
});

const handleRequest = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
  cors: true,
});

export const GET = async (req: NextRequest) => {
  return handleRequest(req);
};

export const POST = async (req: NextRequest) => {
  return handleRequest(req);
};

export const OPTIONS = async (req: NextRequest) => {
  return handleRequest(req);
};
