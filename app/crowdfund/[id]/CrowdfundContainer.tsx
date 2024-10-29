"use client"

import React, { useEffect, useState } from 'react';
import { getCrowdfundABI, USDC_ADDRESS, getERC20ABI } from '@/middleware/crowdfund';
import { base } from 'viem/chains';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import DonationInput from './DonationInput';
import { parseUnits } from 'viem';
import ProgressTracker from './ProgressTracker';
import { INeynarUserResponse } from "@/types/interfaces";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import Contributions from './Contributions';
import { ICrowdfund } from '@/types/crowdfund';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

interface IProps {
  contractAddress: string;
  crowdfund: ICrowdfund;
}

export default function CrowdfundContainer(props: IProps) {
  const { contractAddress, crowdfund } = props;
  const [contributors, setContributors] = useState<string[] | null>();
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
  const [deadline, setDeadline] = useState<number | null>(null);
  const [isApprovingUSDC, setIsApprovingUSDC] = useState(false);
  const [donorProfiles, setDonorProfiles] = useState<Record<string, INeynarUserResponse[]> | null>(null);
  const { user } = usePrivy();
  const [txHash, setTxHash] = useState<string | null>(null);

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

        const formattedContributions = contributions.map(
          (contribution) => parseInt(contribution.toString()) / 100
        );
        setContributionsUSD(formattedContributions);
      } catch (error) {
        console.error('Error fetching contributor totals in USD:', error);
      }
    };

    const fetchDeadline = async () => {
      try {
        const deadlineTimestamp = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'deadline',
          args: [],
        }) as bigint;

        setDeadline(Number(deadlineTimestamp));
      } catch (error) {
        console.error('Error fetching deadline:', error);
      }
    };

    fetchContributors();
    fetchTotalAmountRaised();
    fetchTargetAmountInUSD();
    fetchContributionsUSD();
    fetchDeadline();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractABI, contractAddress]);

  // Add this new useEffect to check USDC approval on component mount and when account changes
  useEffect(() => {
    if (account) {
      checkUSDCApproval();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // Replace the existing useEffect for fetching donor profiles with this one
  useEffect(() => {
    const fetchDonorProfiles = async () => {
      if (!contributors || contributors.length === 0) return;

      try {
        const accessToken = await getAccessToken();
        const response = await fetch('/api/search-users/by-eth-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ addresses: contributors }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }

        const data = await response.json();
        setDonorProfiles(data);
      } catch (error) {
        console.error('Error fetching donor profiles:', error);
      }
    };

    fetchDonorProfiles();
  }, [contributors]);

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

  const checkUSDCApproval = async () => {
    if (!ERC20ABI || !account) return;

    try {
      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [account, contractAddress],
      }) as bigint;

      const sufficientAllowance = allowance >= parseUnits('1000000', 6); // Check for a large allowance (e.g., 1 million USDC)
      setIsUSDCApproved(sufficientAllowance);
    } catch (error) {
      console.error('Error checking USDC allowance:', error);
    }
  };

  const approveUSDC = async (amount: string) => {
    if (!ERC20ABI || !walletClient || !account) {
      console.error('ERC20ABI, walletClient, or account is not available');
      return;
    }

    setIsApprovingUSDC(true);

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
      
      // Wait for the transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
      
      setIsUSDCApproved(true);
      setIsApprovingUSDC(false);
      return hash;
    } catch (error) {
      console.error('Error approving USDC:', error);
      setIsApprovingUSDC(false);
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
      toast.error('Please connect your wallet first.');
      return;
    }

    try {
      if (donationCurrency === 'USDC') {
        const isApproved = await checkUSDCAllowance();
        if (!isApproved) {
          toast.error('Please approve USDC spending first.');
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
        setTxHash(hash);
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
        setTxHash(hash);
      }

      toast.success('Donation successful!');
      // Reset donation amount and refresh data
      setDonationAmount('0');
      // Add function calls here to refresh contributors, total amount raised, etc.
    } catch (error) {
      console.error('Error during donation:', error);
      toast.error('An error occurred during the donation. Please try again.');
    }
  };

  // Add this new function
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Add ToastContainer at the top of your JSX */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{crowdfund.name}</h1>
          <p className="text-gray-600 leading-relaxed">{crowdfund.description}</p>
          <div className="flex justify-around">
            <a
              href={`https://basescan.org/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-full transition duration-300 ease-in-out"
              >
                <span className="mr-2">View Contract</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {/* add button to copy URL */}
              <button 
                onClick={handleCopyLink} 
                className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-full transition duration-300 ease-in-out"
              >
                Share Frame Link
              </button>
            </div>
          </div>
      </div>
      
      <ProgressTracker
        currentAmount={parseFloat(totalAmountRaised.replace('$', ''))}
        targetAmount={parseFloat(targetAmountInUSD.replace('$', ''))}
        deadline={deadline ?? 0}
        sponsors={contributors?.length ?? 0}
      />

      {donorProfiles && (
        <Contributions 
          contributors={contributors ?? []}
          contributionsUSD={contributionsUSD}
          donorProfiles={donorProfiles}
        />
      )}

      <div className="space-y-4">
        {!isConnected ? (
          <button 
            onClick={connectWallet}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </div>

            <DonationInput
              donationCurrency={donationCurrency}
              setDonationCurrency={setDonationCurrency}
              donationAmount={donationAmount}
              setDonationAmount={setDonationAmount}
            />

            {donationCurrency === 'USDC' && !isUSDCApproved ? (
              <button 
                onClick={() => approveUSDC(donationAmount)}
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded"
                disabled={isApprovingUSDC}
              >
                {isApprovingUSDC ? 'Approving...' : 'Approve USDC'}
              </button>
            ) : (
              <button 
                onClick={handleDonate}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
                disabled={!isConnected || (donationCurrency === 'USDC' && !isUSDCApproved)}
              >
                Donate
              </button>
            )}
          </div>
        )}
        <div className='flex justify-around'>
          <Link href="/crowdfund/create" className="text-blue-500 hover:underline mt-4">Create a Crowdfund</Link>
          <Link href="/crowdfund" className="text-blue-500 hover:underline mt-4">View all Crowdfunds</Link>
        </div>
      </div>

      {/* Success Alert - Add state to control visibility */}
      {/* 
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Donation Successful!</h3>
          <p>Thank you for your contribution.</p>
          <a href="#" className="text-blue-500 hover:underline">View Transaction</a>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
      */}
    </div>
  );
}