"use client"

import React, { useEffect, useState } from 'react';
import { getCrowdfundABI, USDC_ADDRESS, getERC20ABI } from '@/middleware/crowdfund';
import { base } from 'viem/chains';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import DonationInput from './DonationInput';
import { parseUnits, formatUnits } from 'viem';
import ProgressTracker from './ProgressTracker';

export default function CrowdfundContainer({ contractAddress }: { contractAddress: string }) {
  const [contributors, setContributors] = useState<string[]>([]);
  const [contributionsUSD, setContributionsUSD] = useState<number[]>([]);
  const [contractABI, setContractABI] = useState<any>(null);
  const [ERC20ABI, setERC20ABI] = useState<any>(null);
  const [totalAmountRaised, setTotalAmountRaised] = useState<string>('');
  const [targetAmountInUSD, setTargetAmountInUSD] = useState<string>('');
  const [donationAmount, setDonationAmount] = useState<string>('0');
  const [donationCurrency, setDonationCurrency] = useState<'ETH' | 'USDC'>('ETH');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isUSDCApproved, setIsUSDCApproved] = useState(false);

  // Initialize clients
  const publicClient = createPublicClient({ chain: base, transport: http() });
  const [walletClient, setWalletClient] = useState<ReturnType<typeof createWalletClient> | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const client = createWalletClient({
        chain: base,
        transport: custom(window.ethereum)
      });
      setWalletClient(client);
    }
  }, []);

  // Fetch ABI once
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const crowdfundAbi = await getCrowdfundABI();
        setContractABI(crowdfundAbi);

        const erc20Abi = await getERC20ABI();
        setERC20ABI(erc20Abi);
      } catch (error) {
        console.error("Error fetching ABIs:", error);
      }
    };
    fetchContractData();
  }, []);

  // Fetch contributors, total amount raised, target amount in USD, and contributions
  useEffect(() => {
    if (!contractABI || !contractAddress) return;

    const fetchContributors = async () => {
      try {
        const contributorsList = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'getContributors',
          args: [],
        }) as string[];
        setContributors(contributorsList);
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    };

    const fetchTotalAmountRaised = async () => {
      try {
        const totalRaised = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'totalRaisedInUSD',
          args: [],
        }) as bigint;

        const formattedRaised = (parseInt(totalRaised.toString()) / 100).toFixed(2);
        setTotalAmountRaised(`$${formattedRaised}`);
      } catch (error) {
        console.error('Error fetching total amount raised:', error);
      }
    };

    const fetchTargetAmountInUSD = async () => {
      try {
        const targetAmount = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'targetAmountInUSD',
          args: [],
        }) as bigint;
    
        const formattedTarget = (parseInt(targetAmount.toString()) / 1e6).toFixed(2);
        setTargetAmountInUSD(`$${formattedTarget}`);
      } catch (error) {
        console.error('Error fetching target amount in USD:', error);
      }
    };
    
    const fetchContributionsUSD = async () => {
      try {
        const contributions = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'getContributorTotalInUSD',
          args: [],
        }) as bigint[];
        console.log('Contributions in USD:', contributions);

        const formattedContributions = contributions.map(
          (contribution) => parseInt(contribution.toString()) / 100
        );
        setContributionsUSD(formattedContributions);
      } catch (error) {
        console.error('Error fetching contributor totals in USD:', error);
      }
    };

    fetchContributors();
    fetchTotalAmountRaised();
    fetchTargetAmountInUSD();
    fetchContributionsUSD();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractABI, contractAddress]);

  const connectWallet = async () => {
    if (!walletClient) {
      console.error('Wallet client not initialized');
      return;
    }

    try {
      const [address] = await walletClient.requestAddresses();
      setAccount(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };

  const approveUSDC = async (amount: string) => {
    if (!ERC20ABI || !walletClient || !account) {
      console.error('ERC20ABI, walletClient, or account is not available');
      return;
    }

    try {
      const amountToApprove = parseUnits(amount, 6); // USDC has 6 decimal places

      const { request } = await publicClient.simulateContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [contractAddress, amountToApprove],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract(request);
      console.log('USDC approval successful:', hash);
      setIsUSDCApproved(true);
      return hash;
    } catch (error) {
      console.error('Error approving USDC:', error);
      throw error;
    }
  };

  const checkUSDCAllowance = async () => {
    if (!ERC20ABI || !account) return false;

    try {
      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [account, contractAddress],
      }) as bigint;

      const donationAmountBigInt = parseUnits(donationAmount, 6);
      return allowance >= donationAmountBigInt;
    } catch (error) {
      console.error('Error checking USDC allowance:', error);
      return false;
    }
  };

  const handleDonate = async () => {
    if (!isConnected || !walletClient || !account || !contractABI) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      if (donationCurrency === 'USDC') {
        const isApproved = await checkUSDCAllowance();
        if (!isApproved) {
          alert('Please approve USDC spending first.');
          return;
        }

        const amountInWei = parseUnits(donationAmount, 6); // USDC has 6 decimal places

        const { request } = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'contributeUSDC',
          args: [amountInWei],
          account: account as `0x${string}`,
        });

        const hash = await walletClient.writeContract(request);
        console.log('USDC donation transaction sent:', hash);
      } else {
        // ETH donation
        const amountInWei = parseUnits(donationAmount, 18); // ETH has 18 decimal places

        const { request } = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'contributeETH',
          args: [],
          account: account as `0x${string}`,
          value: amountInWei,
        });

        const hash = await walletClient.writeContract(request);
        console.log('ETH donation transaction sent:', hash);
      }

      // Reset donation amount and refresh data
      setDonationAmount('0');
      // Add function calls here to refresh contributors, total amount raised, etc.
    } catch (error) {
      console.error('Error during donation:', error);
      alert('An error occurred during the donation. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Contributors</h2>
      {contributors.length === 0 ? (
        <p>No contributors found.</p>
      ) : (
        <ul className="list-disc ml-5">
          {contributors.map((contributor, index) => (
            <li key={index}>
              {contributor} - Total Contribution: ${contributionsUSD[index]?.toFixed(2) ?? '0.00'}
            </li>
          ))}
        </ul>
      )}
      {/* <p>Total amount raised: {totalAmountRaised}</p>
      <p>Target amount: {targetAmountInUSD}</p> */}

      <ProgressTracker currentAmount={parseInt(totalAmountRaised)} targetAmount={parseInt(targetAmountInUSD)} />

      {!isConnected ? (
        <button 
          onClick={connectWallet}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <button 
          onClick={disconnectWallet}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect Wallet ({account?.slice(0, 6)}...{account?.slice(-4)})
        </button>
      )}

      <DonationInput
        donationCurrency={donationCurrency}
        setDonationCurrency={setDonationCurrency}
        donationAmount={donationAmount}
        setDonationAmount={setDonationAmount}
        approveUSDC={(amount: string) => approveUSDC(amount).then(result => result || '0x')}
        isUSDCApproved={isUSDCApproved}
        showApproveButton={donationCurrency === 'USDC' && !isUSDCApproved}
      />
      <button 
        onClick={handleDonate}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={!isConnected || (donationCurrency === 'USDC' && !isUSDCApproved)}
      >
        Donate
      </button>
    </div>
  );
}
