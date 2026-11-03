import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  EmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";

let serviceAdapter: any;

if (apiKey && apiKey !== "your_gemini_api_key_here") {
  serviceAdapter = new GoogleGenerativeAIAdapter({
    model: "gemini-2.5-flash",
  });
} else {
  // Empty adapter for standalone or test mode
  serviceAdapter = new EmptyAdapter();
}

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

