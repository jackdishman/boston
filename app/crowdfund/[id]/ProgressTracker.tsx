import React from 'react';

interface ThermometerProps {
  currentAmount: number; // Current amount raised in dollars
  targetAmount: number;  // Target amount in dollars
}

const Thermometer: React.FC<ThermometerProps> = ({ currentAmount, targetAmount }) => {
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100);

  return (
    <div className="flex flex-col items-center p-6">
      <div className="relative h-72 w-20 flex items-end">
        {/* Thermometer Bulb */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-red-500 h-12 w-12 rounded-full z-10 shadow-md"></div>

        {/* Thermometer Tube */}
        <div className="relative h-full w-8 bg-gray-300 rounded-full overflow-hidden shadow-inner">
          {/* Mercury Level */}
          <div
            className="absolute bottom-0 left-0 w-full bg-red-500 transition-all duration-700 ease-out"
            style={{ height: `${percentage}%` }}
          ></div>
        </div>

        {/* Thermometer Outline */}
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="h-full w-8 border-4 border-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Animated Flames or Confetti */}
      {percentage >= 100 && (
        <div className="mt-4 animate-bounce">
          <span role="img" aria-label="Confetti" className="text-4xl">
            🎉
          </span>
        </div>
      )}

      {/* Progress Text */}
      <div className="mt-6 text-center">
        <p className="text-2xl font-bold text-gray-800">
          ${currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-gray-600 text-lg">
          raised of ${targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} goal
        </p>
      </div>

      {/* Encouraging Messages */}
      <div className="mt-4 text-center">
        {percentage < 25 && (
          <p className="text-blue-500 font-medium">
            Let&apos;s get things started! 🚀
          </p>
        )}
        {percentage >= 25 && percentage < 50 && (
          <p className="text-green-500 font-medium">
            Making progress! Keep it up! 🌱
          </p>
        )}
        {percentage >= 50 && percentage < 75 && (
          <p className="text-yellow-500 font-medium">
            Over halfway there! 🎯
          </p>
        )}
        {percentage >= 75 && percentage < 100 && (
          <p className="text-orange-500 font-medium">
            Almost at the finish line! 🏁
          </p>
        )}
        {percentage >= 100 && (
          <p className="text-red-500 font-bold">
            Goal achieved! Thank you! 🥳
          </p>
        )}
      </div>
    </div>
  );
};

export default Thermometer;
