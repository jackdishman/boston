"use client";

import { EventStats } from "@/types/interfaces";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import StatsTile from "./StatsTile";

// Helper function to calculate percentage change
const calculatePercentageChange = (
  current: number,
  previous: number
): string => {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  return `${change.toFixed(1)}%`;
};

// Helper function to determine color based on percentage change
const getChangeColor = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? "text-green-500" : "text-gray-500";
  return current >= previous ? "text-green-500" : "text-red-500";
};

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const EventsStats: React.FC<{ stats: EventStats }> = ({ stats }) => {
  const months = ["july", "august", "september"];

  const data = {
    labels: months,
    datasets: [
      {
        label: "Shares",
        data: months.map(
          (month) =>
            stats.by_month[month as keyof typeof stats.by_month].num_shares
        ),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
      {
        label: "Likes",
        data: months.map(
          (month) =>
            stats.by_month[month as keyof typeof stats.by_month].num_likes
        ),
        borderColor: "rgba(153, 102, 255, 1)",
        fill: false,
      },
      {
        label: "RSVPs",
        data: months.map(
          (month) =>
            stats.by_month[month as keyof typeof stats.by_month].num_rsvps
        ),
        borderColor: "rgba(255, 159, 64, 1)",
        fill: false,
      },
      {
        label: "Recasts",
        data: months.map(
          (month) =>
            stats.by_month[month as keyof typeof stats.by_month].num_recasts
        ),
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
          font: {
            size: 16,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Count",
          font: {
            size: 16,
          },
          beginAtZero: true,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Event Stats Over Months",
        font: {
          size: 18,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
      legend: {
        display: true,
        position: "top" as const, // Specify 'top' as a constant to ensure correct type
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        Event Stats for {stats.channel_id}
      </h2>

      <h3 className="text-xl font-semibold mb-2 text-gray-800">Total Stats</h3>
      {/* Total Stats */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <StatsTile
          title="Events"
          value={stats.total_stats.num_events.toString()}
        />
        <StatsTile
          title="RSVPs"
          value={stats.total_stats.num_rsvps.toString()}
        />
        <StatsTile
          title="Shares"
          value={stats.total_stats.num_shares.toString()}
        />
        <StatsTile
          title="Likes"
          value={stats.total_stats.num_likes.toString()}
        />
        <StatsTile
          title="Recasts"
          value={stats.total_stats.num_recasts.toString()}
        />
      </div>

      {/* Leaderboard */}
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Leaderboard</h3>
      <div className="mb-6 flex gap-4">
        {stats.leaderboard.map((entry, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-md font-medium text-blue-600">
              {entry.username}
            </h4>
            <ul className="space-y-1 text-gray-700">
              <li>Likes: {entry.user_likes}</li>
              <li>Shares: {entry.user_shares}</li>
              <li>Recasts: {entry.user_recasts}</li>
            </ul>
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Monthly Metrics Graph
        </h3>
        <Line data={data} options={options} />
      </div>

      {/* Monthly Stats with percentage change */}
      <h3 className="text-xl font-semibold mb-2 text-gray-800">
        Monthly Stats
      </h3>

      <div className="mb-6 flex gap-4">
        {months.map((month, index) => {
          const currentMonthStats =
            stats.by_month[month as keyof typeof stats.by_month];
          const previousMonthStats =
            index > 0
              ? stats.by_month[months[index - 1] as keyof typeof stats.by_month]
              : null;

          return (
            <div key={month} className="mb-4">
              <h4 className="text-md font-medium capitalize text-blue-600">
                {month}
              </h4>
              <ul className="space-y-1 text-gray-700">
                <li>
                  Shares: {currentMonthStats.num_shares}{" "}
                  {previousMonthStats && (
                    <span
                      className={`${getChangeColor(
                        currentMonthStats.num_shares,
                        previousMonthStats.num_shares
                      )} text-sm`}
                    >
                      (
                      {calculatePercentageChange(
                        currentMonthStats.num_shares,
                        previousMonthStats.num_shares
                      )}
                      )
                    </span>
                  )}
                </li>
                <li>
                  Likes: {currentMonthStats.num_likes}{" "}
                  {previousMonthStats && (
                    <span
                      className={`${getChangeColor(
                        currentMonthStats.num_likes,
                        previousMonthStats.num_likes
                      )} text-sm`}
                    >
                      (
                      {calculatePercentageChange(
                        currentMonthStats.num_likes,
                        previousMonthStats.num_likes
                      )}
                      )
                    </span>
                  )}
                </li>
                <li>
                  Recasts: {currentMonthStats.num_recasts}{" "}
                  {previousMonthStats && (
                    <span
                      className={`${getChangeColor(
                        currentMonthStats.num_recasts,
                        previousMonthStats.num_recasts
                      )} text-sm`}
                    >
                      (
                      {calculatePercentageChange(
                        currentMonthStats.num_recasts,
                        previousMonthStats.num_recasts
                      )}
                      )
                    </span>
                  )}
                </li>
                <li>
                  RSVPs: {currentMonthStats.num_rsvps}{" "}
                  {previousMonthStats && (
                    <span
                      className={`${getChangeColor(
                        currentMonthStats.num_rsvps,
                        previousMonthStats.num_rsvps
                      )} text-sm`}
                    >
                      (
                      {calculatePercentageChange(
                        currentMonthStats.num_rsvps,
                        previousMonthStats.num_rsvps
                      )}
                      )
                    </span>
                  )}
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
