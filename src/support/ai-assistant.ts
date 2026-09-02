import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { z } from "zod";
import { GEMINI_API_KEY } from "../lib/constants.ts";
import { SERVICES, SERVICE_DETAILS } from "../service/dummy-services.tsx";

export const HUMAN_SUPPORT_ACTION = {
  type: "human-support",
  label: "Speak with human support",
} as const;

export interface AiAssistantResponse {
  text: string;
  sender: "Ajike AI";
  room?: string;
  actions: readonly [typeof HUMAN_SUPPORT_ACTION];
}

export interface AiConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Ajike AI, the friendly support assistant for Ajike Pest Control and Cleaning Service.

Answer every user question helpfully, clearly, and respectfully. You can answer general questions about pest control and cleaning, explain Ajike's services, preparation, typical duration, starting prices, and next steps. Use the service tools whenever the user asks about a specific Ajike service or needs a service recommendation.

Only use facts returned by the tools or stated in this prompt. Do not invent availability, exact quotes, guarantees, locations, policies, treatment outcomes, medical advice, or appointment confirmations. Prices are starting prices and a technician must confirm the final quote. If a question needs information you do not have, say so plainly and recommend human support. For urgent health or safety situations, advise the user to contact the appropriate local emergency or health service.

Keep responses concise but useful. Ask a focused follow-up question when needed. Never claim to be a human. Always end by inviting the user to use the human support button when they would like personal assistance.`;

const listServicesTool = tool(
  async ({ type }) => {
    const services = SERVICES.filter(
      (service) => !type || service.type === type,
    );
    return JSON.stringify(
      services.map(({ id, name, type: audience, price, detail, slug }) => ({
        id,
        name,
        audience,
        price,
        detail,
        slug,
      })),
    );
  },
  {
    name: "list_ajike_services",
    description:
      "List Ajike pest-control and cleaning services, including starting prices and short descriptions.",
    schema: z.object({
      type: z
        .enum(["Residential", "Commercial"])
        .optional()
        .describe("Filter by customer type when the user specifies one."),
    }),
  },
);

const getServiceDetailsTool = tool(
  async ({ serviceId }) => {
    const service = SERVICES.find(
      (candidate) =>
        candidate.id === serviceId ||
        candidate.slug === serviceId ||
        candidate.name.toLowerCase() === serviceId.toLowerCase(),
    );
    if (!service) {
      return JSON.stringify({
        found: false,
        message: "That service was not found in the Ajike service catalog.",
      });
    }

    return JSON.stringify({
      found: true,
      service,
      details: SERVICE_DETAILS[service.id],
    });
  },
  {
    name: "get_ajike_service_details",
    description:
      "Get the authoritative details for one Ajike service, including audience, included work, duration, preparation, and next steps.",
    schema: z.object({
      serviceId: z
        .string()
        .describe("The service id, slug, or exact service name."),
    }),
  },
);

const requestHumanSupportTool = tool(
  async ({ reason }) =>
    JSON.stringify({
      requested: true,
      reason,
      message:
        "A human support specialist can help with this request. Ask the user to select the Speak with human support button.",
    }),
  {
    name: "request_human_support",
    description:
      "Use when the user asks for a person, needs an appointment or exact quote, or the request requires information unavailable to the assistant.",
    schema: z.object({
      reason: z.string().describe("Why human support is the best next step."),
    }),
  },
);

const model = GEMINI_API_KEY
  ? new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: "gemini-3.6-flash",
      temperature: 0.2,
    })
  : undefined;

const agent = model
  ? createAgent({
      model,
      tools: [listServicesTool, getServiceDetailsTool, requestHumanSupportTool],
      systemPrompt: SYSTEM_PROMPT,
    })
  : undefined;

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (
        typeof part === "object" &&
        part !== null &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }
      return "";
    })
    .join("");
}

export async function answerWithAjikeAssistant(
  message: string,
  history: AiConversationMessage[] = [],
): Promise<string> {
  if (!agent) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const result = await agent.invoke({
    messages: [
      ...history
        .slice(-10)
        .map((entry) =>
          entry.role === "user"
            ? new HumanMessage(entry.content)
            : new AIMessage(entry.content),
        ),
      new HumanMessage(message),
    ],
  });
  const lastMessage = result.messages[result.messages.length - 1];
  const response = contentToText(lastMessage?.content);

  if (!response) {
    throw new Error("The AI assistant returned an empty response");
  }

  return response;
}

export function formatAiAssistantResponse(
  text: string,
  room?: string,
): AiAssistantResponse {
  return {
    text,
    sender: "Ajike AI",
    ...(room ? { room } : {}),
    actions: [HUMAN_SUPPORT_ACTION],
  };
}
