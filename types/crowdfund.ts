export interface ICrowdfund {
  id: string;
  created_at: string;
  contract_address: string;
  name: string;
  description: string;
}

export interface ICrowdfundBuilder {
  targetAmountInUSD: number;
  deadline: string;
  recipient: string;
  paymentTokenAddress: string;
  priceFeedAddress: string;
}