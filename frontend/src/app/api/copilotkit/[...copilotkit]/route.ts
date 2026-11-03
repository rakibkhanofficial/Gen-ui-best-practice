import {
  CopilotRuntime,
  BuiltInAgent,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

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
  cors: true,
});

export const GET = async (req: NextRequest) => handleRequest(req);
export const POST = async (req: NextRequest) => handleRequest(req);
export const OPTIONS = async (req: NextRequest) => handleRequest(req);
export const PATCH = async (req: NextRequest) => handleRequest(req);
export const DELETE = async (req: NextRequest) => handleRequest(req);

