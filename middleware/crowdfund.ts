import { supabase } from "./supabase";

export const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export const getCrowdfund = async (id: string) => {
  const { data, error } = await supabase
    .from("crowdfunds")
    .select("*")
    .eq("id", id);

  if (error) {
    console.error("Error fetching crowdfund:", error);
    return null;
  }

  return data?.[0];
};

export const getAllCrowdfunds = async () => {
  const { data, error } = await supabase
    .from("crowdfunds")
    .select("*");

  if (error) {
    console.error("Error fetching all crowdfunds:", error);
    return null;
  }

  return data;
};

export const getCrowdfundABI = async () => {
  const CrowdfundArtifact = await import('../abi/Crowdfund.json');
  return CrowdfundArtifact.abi;
}

export const getCrowdfundBytecode = async () => {
  const CrowdfundArtifact = await import('../abi/Crowdfund.json');
  return CrowdfundArtifact.bytecode.object;
}