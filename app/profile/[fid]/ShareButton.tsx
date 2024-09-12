"use client";

import { INeynarUserResponse } from "@/types/interfaces";
import React, { useEffect } from "react";

interface IProps {
  user: INeynarUserResponse;
}

export default function ShareButton(props: IProps) {
  const { user } = props;
  useEffect(() => {
    // Listen for messages from the parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "createCastResponse") {
        // ("Received confirmation from parent:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div>
      {window === window.parent ? (
        <div>{/* viewing in web app */}</div>
      ) : (
        <div>
          {/* viewing in iframe */}
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600"
            onClick={() => {
              try {
                window.parent.postMessage(
                  {
                    type: "createCast",
                    data: {
                      cast: {
                        text: `Check out ${user.display_name}'s profile!`,
                        embeds: ["https://dish.codes/profile/" + user.fid],
                      },
                    },
                  },
                  "*"
                );
              } catch (error) {
                console.error("Error processing request:", error);
              }
            }}
          >
            Share {user.display_name} Profile
          </button>
        </div>
      )}
    </div>
  );
}
