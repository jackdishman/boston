"use client"

import { INeynarChannelMemberDetailedResponse } from '@/types/interfaces';
import { getAccessToken } from '@privy-io/react-auth';
import React, { useEffect, useState } from 'react'

export default function ChannelMemberships({ fid }: { fid: number }) {
  const [memberships, setMemberships] = useState<INeynarChannelMemberDetailedResponse[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

  const fetchMemberships = async (currentCursor: string | null = null) => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/fetch-memberships`, {
        method: "POST",
        body: JSON.stringify({ fid: fid.toString(), cursor: currentCursor }),
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.members) {
        setMemberships(prevMemberships => [...prevMemberships, ...data.members]);
        console.log(data.members);
        setCursor(data.next_cursor);
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemberships();
  }, [fid]);

  const loadMore = () => {
    if (cursor) {
      fetchMemberships(cursor);
    }
  };

  const toggleExpand = (channelId: string) => {
    setExpandedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {memberships.map((membership, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <img src={membership.channel.image_url} alt={membership.channel.name} className="w-12 h-12 rounded-full" />
              <div>
                <h4 className="text-lg font-semibold truncate">{membership.channel.name}</h4>
                <p className="text-sm text-gray-500">@{membership.channel.id}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>{membership.channel.follower_count.toLocaleString()} followers</span>
              <span>{membership.channel.member_count.toLocaleString()} members</span>
            </div>
            <button 
              onClick={() => toggleExpand(membership.channel.id)}
              className="text-blue-500 hover:underline text-sm w-full text-left"
            >
              {expandedChannels.has(membership.channel.id) ? 'Show less' : 'Show more'}
            </button>
            {expandedChannels.has(membership.channel.id) && (
              <div className="mt-2 space-y-2 text-sm">
                <p className="text-gray-600">{membership.channel.description}</p>
                <div>
                  <span className="font-semibold">Created:</span> {new Date(membership.channel.created_at * 1000).toLocaleDateString()}
                </div>
                {membership.channel.lead && (
                  <div className="mt-2">
                    <h5 className="font-semibold mb-1">Channel Lead:</h5>
                    <div className="flex items-center space-x-2">
                      <img src={membership.channel.lead.pfp_url} alt={membership.channel.lead.display_name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium">{membership.channel.lead.display_name}</p>
                        <p className="text-xs text-gray-500">@{membership.channel.lead.username}</p>
                      </div>
                    </div>
                  </div>
                )}
                <a href={membership.channel.url} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline">
                  View on Warpcast
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      {cursor && !loading && (
        <button onClick={loadMore} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Load More
        </button>
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
}
