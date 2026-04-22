import { NextRequest, NextResponse } from "next/server";
import {
  customerSupportAgent, projectIntakeAgent, bidWritingAgent,
  priceEstimationAgent, marketingAgent, bidEvaluatorAgent,
  contractDraftingAgent, documentVerificationAgent, reviewSentimentAgent,
  adminIntelligenceAgent, outreachAgent,
} from "@/lib/agents";

export async function POST(request: NextRequest) {
  try {
    // AUTH: Require authenticated user
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting — 10 AI requests per minute per user
    const { rateLimits } = await import("@/lib/rate-limit");
    const rateCheck = rateLimits.ai(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again.", retryIn: Math.ceil(rateCheck.resetIn / 1000) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { agent, message, locale = "ar", history = [], data = {} } = body;

    let response: any;

    switch (agent) {
      case "support":
      case "customer_support":
        response = await customerSupportAgent(message, locale, history);
        return NextResponse.json({ message: response });

      case "intake":
        response = await projectIntakeAgent(message, locale, history);
        return NextResponse.json(response);

      case "bid-writer":
        response = await bidWritingAgent(data.project, data.contractor, locale);
        return NextResponse.json(response);

      case "bid-evaluator":
        response = await bidEvaluatorAgent(data.projectTitle || message, data.bids || [], locale);
        return NextResponse.json(response);

      case "price-estimate":
        response = await priceEstimationAgent(message, locale);
        return NextResponse.json(response);

      case "marketing":
        response = await marketingAgent({ type: data.type || "instagram_post", topic: message, locale });
        return NextResponse.json(response);

      case "contract-drafter":
        response = await contractDraftingAgent(data.project, data.bid, data.contractType || "SIMPLE", locale);
        return NextResponse.json(response);

      case "doc-verifier":
        response = await documentVerificationAgent(data.documentType || "business_license", message, locale);
        return NextResponse.json(response);

      case "review-sentiment":
        response = await reviewSentimentAgent(data.reviews || [], locale);
        return NextResponse.json(response);

      case "admin-intelligence":
        response = await adminIntelligenceAgent(data.stats || {}, locale);
        return NextResponse.json(response);

      case "outreach":
        response = await outreachAgent(data.project, data.contractor, locale);
        return NextResponse.json(response);

      default:
        return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Agent error:", error);
    return NextResponse.json({ error: "Agent processing failed" }, { status: 500 });
  }
}
