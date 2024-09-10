import { TokenBalance } from "@/types/interfaces";

export type IBalanceResponse = TokenBalance[];

const networks = {
  ethereum: {
    url: "https://eth-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
    chainId: "1",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
    },
  },
  base: {
    url: "https://base-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
    chainId: "8453",
    nativeCurrency: {
      name: "Base",
      symbol: "BASE",
    },
  },
};

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// Fetch native balance for a given network
export async function getNativeBalance(
  address: string,
  networkName: "ethereum" | "base"
): Promise<TokenBalance> {
  const { url, chainId, nativeCurrency } = networks[networkName];

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address, "latest"],
  });

  const res = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  });

  const data = await res.json();
  const balance = Number(data.result) / 10 ** 18;

  return {
    chainId: chainId,
    chainName: networkName,
    contractAddress: null,
    name: nativeCurrency.name,
    symbol: nativeCurrency.symbol,
    balance: balance,
  };
}

// Fetch ERC-20 token balances for a given network
export async function getERC20Balances(
  address: string,
  networkName: "ethereum" | "base"
): Promise<IBalanceResponse> {
  const { url, chainId } = networks[networkName];

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenBalances",
    params: [address],
  });

  const res = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  });

  const data = await res.json();
  const tokenBalances = data.result.tokenBalances;

  const filteredBalances = await Promise.all(
    tokenBalances.map(
      async (token: { contractAddress: string; tokenBalance: string }) => {
        const tokenMetadata = await getTokenMetadata(
          token.contractAddress,
          networkName
        );

        if (!tokenMetadata || Number(token.tokenBalance) === 0) {
          // If no metadata or balance is 0, omit the token
          return null;
        }

        const balance =
          Number(token.tokenBalance) / 10 ** tokenMetadata.decimals;

        if (balance === 0) {
          return null;
        }

        return {
          chainId: chainId,
          chainName: networkName,
          contractAddress: token.contractAddress,
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          balance: balance,
        } as TokenBalance;
      }
    )
  );

  return filteredBalances.filter((token) => token !== null) as IBalanceResponse;
}

// Fetch token metadata for a given contract address
async function getTokenMetadata(
  contractAddress: string,
  networkName: "ethereum" | "base"
) {
  const { url } = networks[networkName];

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenMetadata",
    params: [contractAddress],
  });

  try {
    const res = await fetch(url, {
      headers: headers,
      method: "POST",
      body: body,
    });

    const tokenData = await res.json();
    if (!tokenData.result) {
      console.warn(`No metadata found for contract: ${contractAddress}`);
      return null;
    }

    return tokenData.result;
  } catch (error) {
    console.error(
      `Failed to fetch token metadata for ${contractAddress}:`,
      error
    );
    return null;
  }
}

// Combined method to get both native balance and ERC-20 token balances for a given network
export async function getAllBalances(
  address: string,
  networkName: "ethereum" | "base"
): Promise<IBalanceResponse> {
  const nativeBalance = await getNativeBalance(address, networkName);
  const erc20Balances = await getERC20Balances(address, networkName);

  // Only include native balance if it’s greater than 0
  return nativeBalance.balance > 0
    ? [nativeBalance, ...erc20Balances]
    : erc20Balances;
}

import { INFTResponse } from "@/types/interfaces"; // Assuming the interface is in a file in /types/interfaces

export async function getNFTs(
  address: string,
  pageSize: number = 10,
  network: "ethereum" | "base" = "ethereum"
): Promise<INFTResponse | null> {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const url = `https://${
    network === "base" ? "base-mainnet" : "eth-mainnet"
  }.g.alchemy.com/nft/v2/${alchemyApiKey}/getNFTs?owner=${address}&withMetadata=true&pageSize=${pageSize}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const nftData: INFTResponse = await res.json();

    if (!nftData || !nftData.ownedNfts) {
      console.warn(`No NFTs found for address: ${address}`);
      return null;
    }

    return nftData; // Return the full NFT response
  } catch (error) {
    console.error(`Error fetching NFTs for ${address}:`, error);
    return null;
  }
}

export async function getDishTokenBalance(address: string) {
  const DISH_CONTRACT_ADDRESS = "0x29D2EB697306e9Bd34644B143F43D164Cd0F41F0";
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const url = `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenBalances",
    params: [address, [DISH_CONTRACT_ADDRESS]],
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch, status: ${res.status}`);
    }

    const dishData = await res.json();
    console.log(dishData.result.tokenBalances);
    const tokenBalanceHex = dishData?.result.tokenBalances?.[0]?.tokenBalance;

    if (tokenBalanceHex) {
      // Convert hex to decimal and divide by 10^18 to get the actual balance
      const balance = parseInt(tokenBalanceHex, 16) / 10 ** 18;
      console.log("Dish Token balance:", balance);
      return balance;
    } else {
      console.log("No balance found for the provided token.");
      return 0;
    }
  } catch (error) {
    console.error(`Error fetching Dish Token balance for ${address}:`, error);
  }
}
