import { TranscriptionService, TranscribeFileOptions } from "@copilotkit/runtime/v2";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * GeminiTranscriptionService
 *
 * Implements CopilotKit Runtime's TranscriptionService using Google Gemini.
 * Enables Speech-to-Text audio transcription for CopilotKit Runtime (/api/copilotkit/transcribe)
 * and activates "audioFileTranscriptionEnabled: true" for the CopilotKit Inspector.
 */
export class GeminiTranscriptionService extends TranscriptionService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    const { audioFile, mimeType } = options;

    if (!audioFile) {
      throw new Error("No audio file provided to transcribeFile.");
    }

    // Fallback if no Gemini API Key is present in the environment
    if (!this.genAI || !this.apiKey) {
      console.warn(
        "[GeminiTranscriptionService] GEMINI_API_KEY is not set. Returning mock voice transcript for testing."
      );
      return "Hello, this is a simulated transcription. Please set GEMINI_API_KEY for live audio models.";
    }

    try {
      // 1. Read the audio file buffer and convert to Base64
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");
      const resolvedMime = mimeType || audioFile.type || "audio/webm";

      // 2. Query Gemini 2.5 Flash / 1.5 Flash for multimodal audio transcription
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const response = await model.generateContent([
        {
          inlineData: {
            mimeType: resolvedMime.includes("audio") ? resolvedMime : "audio/webm",
            data: base64Audio,
          },
        },
        {
          text: "Transcribe the spoken audio verbatim in the speaker's language. Provide only the plain transcribed words with zero commentary, formatting, or labels.",
        },
      ]);

      const resultText = response.response.text()?.trim();
      return resultText || "";
    } catch (err: any) {
      console.error("[GeminiTranscriptionService] Gemini transcription error:", err);
      // If quota or format fails, attempt graceful fallback
      throw new Error(`Audio transcription failed: ${err.message || String(err)}`);
    }
  }
}
