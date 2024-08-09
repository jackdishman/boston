import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { NextRequest, NextResponse } from "next/server";

export async function validateMessage(req: NextRequest): Promise<{
  validatedMessage: Message | undefined;
  fid: number;
  buttonId: number;
  inputText: string;
}> {
  const HUB_URL = process.env["HUB_URL"];
  const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;
  let validatedMessage: Message | undefined = undefined;

  try {
    const body = await req.json(); // Parse the request body as JSON
    const frameMessage = Message.decode(
      Buffer.from(body?.trustedData?.messageBytes || "", "hex")
    );
    const result = await client?.validateMessage(frameMessage);

    if (!result?.isOk()) {
      throw new Error("Failed to validate message. Check HUB_URL");
    }

    if (result && result.isOk() && result.value.valid) {
      validatedMessage = result.value.message;
    }

    // Also validate the frame URL matches the expected URL
    const urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
    const urlString = Buffer.from(urlBuffer).toString("utf-8");

    if (
      validatedMessage &&
      !urlString.startsWith(process.env["NEXT_PUBLIC_HOST"] || "")
    ) {
      throw new Error(`Invalid frame URL: ${urlString}`);
    }
  } catch (e) {
    console.error(`Failed to validate message: ${e}`);
    return { validatedMessage: undefined, fid: 0, buttonId: 0, inputText: "" };
  }

  // If HUB_URL is not provided, don't validate and fall back to untrusted data
  let fid = 0,
    buttonId = 0,
    inputText = "";

  if (client) {
    buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
    fid = validatedMessage?.data?.fid || 0;
    inputText = Buffer.from(
      validatedMessage?.data?.frameActionBody?.inputText || []
    ).toString("utf-8");
  } else {
    const body = await req.json(); // Parse the request body as JSON
    fid = body?.untrustedData?.fid || 0;
    buttonId = body?.untrustedData?.buttonIndex || 0;
    inputText = body?.untrustedData?.inputText || "";
  }

  console.log(`fid`, fid);
  console.log(`input text`, inputText);

  return { validatedMessage, fid, buttonId, inputText };
}
