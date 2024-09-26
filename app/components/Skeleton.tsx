import React from 'react'

export default function Skeleton() {
  return (
    <div className="animate-pulse">
    <div className="h-12 bg-gray-300 rounded mb-4"></div>
    <div className="h-12 bg-gray-300 rounded mb-4"></div>
    <div className="h-12 bg-gray-300 rounded mb-4"></div>
  </div>
  )
}
