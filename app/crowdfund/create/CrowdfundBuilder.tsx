"use client";

import { ICrowdfundBuilder, ICrowdfund } from '@/types/crowdfund';
import React, { useEffect, useState } from 'react';
import { createWalletClient, http, custom, createPublicClient, isAddress } from 'viem';
import { base } from 'viem/chains'; // Or whatever network you're using
import CrowdfundABI from '@/abi/Crowdfund.json';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@privy-io/react-auth';
import { toast } from "react-toastify";

export default function CrowdfundBuilder() {
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ICrowdfundBuilder, string>>>({});
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [crowdfund, setCrowdfund] = useState<ICrowdfundBuilder>({
    targetAmountInUSD: 0,
    deadline: new Date().toISOString(),
    recipient: '',
    paymentTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    priceFeedAddress: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
  });
  const [deployedAddress, setDeployedAddress] = useState<string>();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
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

  const connectWallet = async () => {
    if (!walletClient) {
      toast.error('Wallet client not initialized');
      return;
    }

    try {
      const [address] = await walletClient.requestAddresses();
      setAccount(address);
      setIsConnected(true);
      
      setCrowdfund(prev => ({
        ...prev,
        recipient: address
      }));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet', {
        autoClose: 3000,
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ICrowdfundBuilder, string>> = {};

    // Target amount validation
    if (!crowdfund.targetAmountInUSD || Number(crowdfund.targetAmountInUSD) <= 0) {
      errors.targetAmountInUSD = 'Target amount must be greater than 0';
    }

    // Deadline validation
    const deadlineDate = new Date(crowdfund.deadline);
    if (!crowdfund.deadline || deadlineDate <= new Date()) {
      errors.deadline = 'Deadline must be in the future';
    }

    // Recipient address validation
    if (!crowdfund.recipient || !isAddress(crowdfund.recipient)) {
      errors.recipient = 'Invalid recipient address';
    }

    // Payment token address validation
    if (!crowdfund.paymentTokenAddress || !isAddress(crowdfund.paymentTokenAddress)) {
      errors.paymentTokenAddress = 'Invalid payment token address';
    }

    // Price feed address validation
    if (!crowdfund.priceFeedAddress || !isAddress(crowdfund.priceFeedAddress)) {
      errors.priceFeedAddress = 'Invalid price feed address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setCrowdfund(prev => ({
      ...prev,
      [name]: name === 'targetAmountInUSD' 
        ? Number(value) || 0
        : name === 'deadline'
        ? value
        : value
    }));
  };

  const deployContract = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsDeploying(true);
      
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(window.ethereum)
      });

      // check if on base chain
      const chain = await walletClient.getChainId();
      if (chain !== base.id) {
        toast.error('Please switch to the Base chain');
        return;
      }
      const [address] = await walletClient.requestAddresses();

      const deadlineDate = new Date(crowdfund.deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000)
      const targetAmount = BigInt(Math.floor(crowdfund.targetAmountInUSD * 1e6));

      const hash = await walletClient.deployContract({
        abi: CrowdfundABI.abi,
        bytecode: CrowdfundABI.bytecode.object as `0x${string}`,
        account: address,
        args: [
          targetAmount,
          deadlineTimestamp,
          crowdfund.recipient,
          crowdfund.paymentTokenAddress,
          crowdfund.priceFeedAddress
        ],
      });

      const publicClient = createPublicClient({
        chain: base,
        transport: http()
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.contractAddress) {
        setDeployedAddress(receipt.contractAddress);
        console.log('Deployed contract address:', receipt.contractAddress);
      }
    } catch (error) {
      console.error('Error deploying contract:', error);
    } finally {
      setIsDeploying(false);
    }
  };

      const storeCrowdfund = async () => {
      if (!deployedAddress || !name || !description) return;
      
      try {
        const accessToken = await getAccessToken();
        const response = await fetch('/api/crowdfund/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Adjust based on how you store the token
          },
          body: JSON.stringify({
            contractAddress: deployedAddress,
            name,
            description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to store crowdfund');
        }

        const data = await response.json();
        const crowdfund: ICrowdfund = data.data[0];
        // Redirect to the crowdfund page
        router.push(`/crowdfund/${crowdfund.id}`);
      } catch (error) {
        console.error('Error storing crowdfund:', error);
      }
  };

  useEffect(() => {
    if (deployedAddress) {
      storeCrowdfund();
    }
  }, [deployedAddress]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {!isConnected ? (
        <button 
          onClick={connectWallet}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-gray-100 p-3 rounded mb-4 flex justify-between items-center cursor-pointer hover:bg-gray-200" onClick={ () => {
          navigator.clipboard.writeText(account || '');
          toast.success('Copied to clipboard');
        }}>
          <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
          <span className="text-green-600">✓ Connected</span>
        </div>
      )}

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter crowdfund name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter crowdfund description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Amount (USD)</label>
          <input
            type="number"
            name="targetAmountInUSD"
            value={crowdfund.targetAmountInUSD || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Enter target amount"
            min="0"
            step="0.01"
          />
          {formErrors.targetAmountInUSD && (
            <p className="text-red-500 text-sm">{formErrors.targetAmountInUSD}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="datetime-local"
            name="deadline"
            value={typeof crowdfund.deadline === 'string' 
              ? crowdfund.deadline 
              : new Date().toISOString().slice(0, 16)}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min={new Date().toISOString().slice(0, 16)}
          />
          {formErrors.deadline && (
            <p className="text-red-500 text-sm">{formErrors.deadline}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Recipient Address</label>
          <input
            type="text"
            name="recipient"
            value={crowdfund.recipient}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="0x..."
          />
          {formErrors.recipient && (
            <p className="text-red-500 text-sm">{formErrors.recipient}</p>
          )}
        </div>

        <button
          type="button"
          onClick={deployContract}
          disabled={isDeploying || !isConnected}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {!isConnected 
            ? 'Connect Wallet to Deploy' 
            : isDeploying 
              ? 'Deploying...' 
              : 'Deploy Contract'}
        </button>

        {deployedAddress && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <p className="text-green-800">Contract deployed at: {deployedAddress}</p>
          </div>
        )}
      </form>
    </div>
  );
}
