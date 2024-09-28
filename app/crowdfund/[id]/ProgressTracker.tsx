import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import CountUp from 'react-countup';

interface ProgressTrackerProps {
  currentAmount: number;
  targetAmount: number;
  deadline: number; // Unix timestamp of the deadline
  sponsors: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentAmount,
  targetAmount,
  deadline,
  sponsors,
}) => {
  const [percentage, setPercentage] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    // Calculate percentage funded
    const percent = Math.min((currentAmount / targetAmount) * 100, 100);
    setPercentage(percent);

    // Calculate days remaining
    const now = Date.now();
    const distance = deadline * 1000 - now; // Convert deadline to milliseconds
    if (distance > 0) {
      const days = Math.ceil(distance / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
    } else {
      setDaysRemaining(0);
    }
  }, [currentAmount, targetAmount, deadline]);

  // Add animation for the progress bar
  const progressAnimation = useSpring({
    width: `${percentage}%`,
    from: { width: '0%' },
    config: { duration: 1000 },
  });

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-4 bg-blue-900 text-white rounded-lg">
      {/* Goal Amount */}
      <div className="text-right text-4xl font-bold mb-4">${targetAmount.toLocaleString()}</div>

      {/* Progress Bar */}
      <div className="w-full h-6 bg-gray-300 rounded-full overflow-hidden">
        <animated.div
          className="h-full bg-red-500 rounded-full"
          style={progressAnimation}
        ></animated.div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap mt-6 -mx-2 text-center">
        {/* Percentage Funded */}
        <div className="w-1/2 md:w-1/4 px-2 mb-4">
          <span className="block text-2xl font-bold">
            <CountUp end={percentage} duration={1.5} decimals={0} suffix="%" />
          </span>
          <span className="block text-sm">Funded</span>
        </div>

        {/* Amount Raised */}
        <div className="w-1/2 md:w-1/4 px-2 mb-4">
          <span className="block text-2xl font-bold">
            $<CountUp end={currentAmount} duration={1.5} separator="," decimals={2} />
          </span>
          <span className="block text-sm">Raised</span>
        </div>

        {/* Days to Go */}
        <div className="w-1/2 md:w-1/4 px-2 mb-4">
          <span className="block text-2xl font-bold">
            <CountUp end={daysRemaining} duration={1.5} />
          </span>
          <span className="block text-sm">Days to Go</span>
        </div>

        {/* Sponsors */}
        <div className="w-1/2 md:w-1/4 px-2 mb-4">
          <span className="block text-2xl font-bold">
            <CountUp end={sponsors} duration={1.5} />
          </span>
          <span className="block text-sm">Sponsors</span>
        </div>
      </div>

      {/* Encouraging Message */}
      <div className="mt-4 text-center">
        {percentage < 25 && (
          <p className="text-blue-300 font-medium">Let&apos;s get things started! 🚀</p>
        )}
        {percentage >= 25 && percentage < 50 && (
          <p className="text-green-300 font-medium">Making progress! Keep it up! 🌱</p>
        )}
        {percentage >= 50 && percentage < 75 && (
          <p className="text-yellow-300 font-medium">Over halfway there! 🎯</p>
        )}
        {percentage >= 75 && percentage < 100 && (
          <p className="text-orange-300 font-medium">Almost at the finish line! 🏁</p>
        )}
        {percentage >= 100 && (
          <p className="text-red-300 font-bold">Goal achieved! Thank you! 🥳</p>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
