import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getCrowdfund, getCrowdfundABI } from "@/middleware/crowdfund";
import { createPublicClient, encodeFunctionData, http, parseUnits } from "viem";
import { base } from "viem/chains";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // validate message
    const { inputText } = await validateMessage(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";
    const crowdfund = await getCrowdfund(id);
    // Load the ABI for the contract
    const contractABI = await getCrowdfundABI();

    const contractAddress = crowdfund?.contract_address;

    // Initialize the viem public client to interact with the blockchain
    const publicClient = createPublicClient({
      chain: base, // Adjust the chain as needed (e.g., Optimism, Base)
      transport: http(),
    });

    // Encode the calldata for the contributeETH function (no parameters)
    const calldata = encodeFunctionData({
      abi: contractABI,
      functionName: "contributeETH",
      args: [], // `contributeETH` takes no arguments
    });

    // Prepare the transaction data
    const transactionData = {
      method: "eth_sendTransaction",
      chainId: "eip155:8453", // base chain id
      params: {
        abi: contractABI, // Contract ABI to inform the client about function encoding
        to: contractAddress, // Contract address to send the transaction
        data: calldata, // Encoded function data
        value: parseUnits(inputText ?? "0", 18).toString(), // Amount of ETH to send (0.1 ETH in wei)
      },
    };
    console.log(transactionData);

    return new NextResponse(JSON.stringify(transactionData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
