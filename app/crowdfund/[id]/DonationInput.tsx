"use client";

import React from 'react';

interface DonationInputProps {
  donationCurrency: 'ETH' | 'USDC';
  setDonationCurrency: (currency: 'ETH' | 'USDC') => void;
  donationAmount: string;
  setDonationAmount: (amount: string) => void;
}

export default function DonationInput({
  donationCurrency,
  setDonationCurrency,
  donationAmount,
  setDonationAmount,
}: DonationInputProps) {
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(inputValue)) {
      setDonationAmount(inputValue);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Make a Donation</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Donation Amount
          </label>
          <div className="flex">
            <input
              type="text"
              value={donationAmount}
              placeholder="Enter amount"
              onChange={handleChange}
              inputMode="decimal"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            />
            <select
              value={donationCurrency}
              onChange={(e) => setDonationCurrency(e.target.value as 'ETH' | 'USDC')}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
