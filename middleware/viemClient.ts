import { createPublicClient, createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";

// Set up your Ethereum provider endpoint (Infura, Alchemy, etc.)
const providerUrl =
  process.env.NEXT_PUBLIC_ETH_PROVIDER_URL ||
  "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";
const chain = mainnet;

// Initialize the public client for reading data from the blockchain
export const publicClient = createPublicClient({
  chain,
  transport: http(providerUrl),
});

// Initialize the wallet client for sending transactions
export const walletClient = () => {
  // Retrieve the private key from environment variables (never hardcode this)
  const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Private key is missing from environment variables");
  }

  const account = privateKeyToAccount(`0x${privateKey}`);

  return createWalletClient({
    account,
    chain,
    transport: http(providerUrl),
  });
};

// Optionally, if you're using ethers.js in combination with viem,
// here's an ethers.js provider as well:
export const ethersProvider = new ethers.JsonRpcProvider(providerUrl);
