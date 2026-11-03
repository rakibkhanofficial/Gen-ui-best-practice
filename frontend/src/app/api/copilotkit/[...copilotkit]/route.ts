import { handleRequest } from "@/lib/copilot-handler";

export const GET = (req: Request) => handleRequest(req);
export const POST = (req: Request) => handleRequest(req);
export const PATCH = (req: Request) => handleRequest(req);
export const DELETE = (req: Request) => handleRequest(req);
export const OPTIONS = (req: Request) => handleRequest(req);
