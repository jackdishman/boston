// Define the TokenBalance type
type TokenBalance = {
  chainId: string;
  chainName: "ethereum" | "base";
  contractAddress: string | null;
  name: string;
  symbol: string;
  balance: number;
};

// Define the IBalanceResponse type as an array of TokenBalance objects
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

  return Promise.all(
    tokenBalances.map(
      async (token: { contractAddress: string; tokenBalance: string }) => {
        const tokenMetadata = await getTokenMetadata(
          token.contractAddress,
          networkName
        );

        const balance =
          Number(token.tokenBalance) / 10 ** tokenMetadata.decimals;

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

  const res = await fetch(url, {
    headers: headers,
    method: "POST",
    body,
  });

  const tokenData = await res.json();
  return tokenData.result;
}

// Combined method to get both native balance and ERC-20 token balances for a given network
export async function getAllBalances(
  address: string,
  networkName: "ethereum" | "base"
): Promise<IBalanceResponse> {
  const nativeBalance = await getNativeBalance(address, networkName);
  const erc20Balances = await getERC20Balances(address, networkName);

  return [nativeBalance, ...erc20Balances];
}
