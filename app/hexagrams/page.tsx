import Link from "next/link"
import { hexagramData } from "@/components/hexagram-data"
import { HexagramDisplay } from "@/components/hexagram-display"

export default function HexagramsPage() {
  // Convert the hexagram data object to an array and sort by number
  const hexagrams = Object.entries(hexagramData)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => a.number - b.number)

  return (
    <div className="container pb-20">
      <div className="py-4">
        <div className="relative">
          <input type="search" placeholder="搜索" className="w-full bg-[#e9e2d5] rounded-lg py-2 px-10 text-gray-700" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="divide-y divide-amber-200">
        {hexagrams.map((hexagram) => {
          // Convert the key string to an array of numbers (0s and 1s)
          const lines = hexagram.key.split("").map(Number)

          return (
            <Link href={`/hexagrams/${hexagram.number}`} key={hexagram.key} className="flex items-center py-4 px-2">
              <div className="w-8 text-center font-medium text-gray-700">{hexagram.number}</div>
              <div className="ml-4">
                <HexagramDisplay lines={lines} className="scale-75" />
              </div>
              <div className="ml-8 flex-1">
                <div className="text-lg">{hexagram.name.split("为")[1] || hexagram.name}</div>
                <div className="text-sm text-gray-600 truncate max-w-xs">
                  {hexagram.description.substring(0, 20)}...
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 ml-4">{
                hexagram.name.includes("为")
                  ? hexagram.name.split("为")[0]
                  : hexagram.name.length === 3
                  ? hexagram.name.slice(-1)
                  : hexagram.name.slice(-2)
              }</div>
              <div className="ml-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
