"use client";
import { INeynarCastResponse } from "@/types/interfaces";
import Image from "next/image";

interface CastItemProps {
  cast: INeynarCastResponse;
}

export function CastItem({ cast }: CastItemProps) {
  const renderEmbed = (embed: any, index: number) => {
    // Check if metadata and content_type exist before accessing
    if (embed.metadata?.content_type?.includes("image")) {
      // Handle image embeds
      return (
        <img
          key={index}
          src={embed.url}
          alt="embed"
          className="w-full h-auto rounded-md"
        />
      );
    } else if (embed.metadata?.content_type?.includes("text/html")) {
      // Handle web previews (open graph metadata)
      const ogTitle = embed.metadata.html?.ogTitle || "Link Preview";
      const ogImage = embed.metadata.html?.ogImage?.[0]?.url || "";
      return (
        <div
          key={index}
          className="w-full h-auto rounded-md border p-4 bg-gray-100"
        >
          {ogImage && (
            <img
              src={ogImage}
              alt={ogTitle}
              className="mb-4 w-full h-auto rounded-md"
            />
          )}
          <a
            href={embed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {ogTitle}
          </a>
        </div>
      );
    } else if (embed.cast_id) {
      // Handle cast_id embeds (displaying fid and hash)
      return (
        <div
          key={index}
          className="w-full h-auto rounded-md border p-4 bg-gray-100"
        >
          <p>
            <strong>Cast ID:</strong> {embed.cast_id.fid}
          </p>
          <p>
            <strong>Hash:</strong> {embed.cast_id.hash}
          </p>
        </div>
      );
    } else {
      // Fallback for unsupported embed types or missing metadata
      return (
        <div key={index} className="w-full h-auto rounded-md border p-4">
          <a
            href={embed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View content
          </a>
        </div>
      );
    }
  };

  return (
    <div className="border rounded-lg shadow-md p-6 bg-white overflow-hidden">
      <div className="flex items-center space-x-4">
        <img
          src={cast.author.pfp_url}
          alt="avatar"
          className="w-12 h-12 rounded-full"
          style={{ objectFit: "cover" }}
        />
        <div>
          <h3 className="text-lg font-bold">{cast.author.display_name}</h3>
          <p className="text-sm text-gray-500">@{cast.author.username}</p>

          {/* Reflect viewer context in UI */}
          {cast.viewer_context && (
            <div className="mt-2 text-sm text-gray-600">
              {cast.viewer_context.liked && <span>❤️ You liked this | </span>}
              {cast.viewer_context.recasted && (
                <span>🔁 You recasted this</span>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-lg">{cast.text}</p>
      <p className="mt-2 text-sm text-gray-500">
        <strong>Timestamp:</strong> {new Date(cast.timestamp).toLocaleString()}
      </p>

      {cast.embeds.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {cast.embeds.map((embed, index) => renderEmbed(embed, index))}
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <h4 className="font-semibold text-lg">Stats</h4>
        <div className="flex items-center space-x-4 mt-2">
          <span className="font-semibold">❤️ {cast.reactions.likes_count}</span>
          <span className="font-semibold">
            🔁 {cast.reactions.recasts_count}
          </span>
        </div>
      </div>
    </div>
  );
}
