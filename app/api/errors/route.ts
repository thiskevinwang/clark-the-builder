import { generateText, Output } from "ai";
import { checkBotId } from "botid/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { DEFAULT_MODEL } from "@/ai/constants";
import { getModelOptions } from "@/ai/gateway";

import { linesSchema, resultSchema } from "@/components/error-monitor/schemas";

import prompt from "./prompt.md";

export async function POST(req: Request) {
  const checkResult = await checkBotId();
  if (checkResult.isBot) {
    return NextResponse.json({ error: `Bot detected` }, { status: 403 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsedBody = linesSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: `Invalid request` }, { status: 400 });
  }

  const result = await generateText({
    system: prompt,
    ...getModelOptions(DEFAULT_MODEL),
    messages: [{ role: "user", content: JSON.stringify(parsedBody.data) }],
    output: Output.object({ schema: resultSchema }),
  });

  return NextResponse.json(result.output, {
    status: 200,
  });
}
