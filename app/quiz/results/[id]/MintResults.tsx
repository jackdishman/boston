"use client";

import { INeynarUserResponse } from '@/types/interfaces';
import { ISubmission } from '@/types/quiz';
import React, { useState, useEffect } from 'react';
import { createPublicClient, http, createWalletClient, custom, parseAbi } from 'viem';
import { base } from 'viem/chains';

const contractAddress = '0x840B72a9b16Dc28f3a94f3cD1d628fA941828749';

interface IProps {
  submission: ISubmission;
  quizId: number;
  quizTaker: string; //address of quiz taker
  score: number;
  timeCompleted: number;
  proctor: INeynarUserResponse;
}

export default function MintResults({ submission, quizId, quizTaker, score, timeCompleted, proctor }: IProps) {
  const [contractABI, setContractABI] = useState<any>(null);
  const [contractBytecode, setContractBytecode] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContractData = async () => {
      try {
        const QuizResultArtifact = await import('../../../../abi/QuizResult.json');
        setContractABI(QuizResultArtifact.abi);
        setContractBytecode(QuizResultArtifact.bytecode.object);
      } catch (err) {
        console.error('Error loading contract data:', err);
        setError('Failed to load contract data');
      }
    };

    loadContractData();
  }, []);

  const handleMint = async () => {
    try {
      setMinting(true);

      const response = await fetch('/api/pinata/pin-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizResults: submission,
          metadata: { name: `quiz_submission_${submission.id}.json` }
        })
      });
      const data = await response.json();
      const metadataURI = data.metadataUrl;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Continue with minting transaction
      if (typeof window.ethereum !== 'undefined') {
        const publicClient = createPublicClient({
          chain: base,
          transport: http()
        });

        const walletClient = createWalletClient({
          chain: base,
          transport: custom(window.ethereum)
        });

        const [address] = await walletClient.requestAddresses();

        const { request } = await publicClient.simulateContract({
          account: address,
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'mintQuizResult',
          args: [quizTaker, quizId, score, timeCompleted, metadataURI],
        });

        const hash = await walletClient.writeContract(request);
        console.log('Transaction hash:', hash);

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Transaction receipt:', receipt);

        // Handle successful mint
        alert('NFT minted successfully!');
      } else {
        throw new Error('Ethereum wallet not detected');
      }
    } catch (error) {
      console.error('Minting error:', error);
      setError('Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const setQuizProctor = async (quizId: string, proctorAddress: string) => {
    console.log('Setting quiz proctor', quizId, proctorAddress);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const publicClient = createPublicClient({
          chain: base,
          transport: http()
        });

        const walletClient = createWalletClient({
          chain: base,
          transport: custom(window.ethereum)
        });

        const [address] = await walletClient.requestAddresses();

        const { request } = await publicClient.simulateContract({
          account: address,
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'setQuizProctor',
          args: [quizId, proctorAddress],
        });

        const hash = await walletClient.writeContract(request);
        console.log('Transaction hash:', hash);

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Transaction receipt:', receipt);

        // Handle successful proctor setting
        alert('Quiz proctor set successfully!');
      } else {
        throw new Error('Ethereum wallet not detected');
      }
    } catch (error) {
      console.error('Setting proctor error:', error);
      alert(`Failed to set quiz proctor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  return (
    <div>
      <h1>Mint Quiz Results</h1>
      <button onClick={handleMint} disabled={minting || !contractABI || !contractBytecode}>
        {minting ? 'Minting...' : 'Mint Result NFT'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={() => setQuizProctor(quizId.toString(), proctor.verified_addresses.eth_addresses[0])}>Set Quiz Proctor</button>
    </div>
  );
}
