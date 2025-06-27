"use client"
import { hexagramData } from "@/components/hexagram-data"
import { HexagramDisplay } from "@/components/hexagram-display"
import { Button } from "@/components/ui/button"

export default function HexagramDetailPage({ params }: { params: { id: string } }) {
  // Find the hexagram by number
  const hexagramId = Number.parseInt(params.id)
  const hexagramEntry = Object.entries(hexagramData).find(([_, data]) => data.number === hexagramId)

  if (!hexagramEntry) {
    return <div className="container py-8">卦象不存在</div>
  }

  const [key, hexagram] = hexagramEntry
  const lines = key.split("").map(Number)

  return (
    <div className="bg-[#f5eee1] min-h-screen pb-20">
      <div className="container pt-6 pb-16">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            返回
          </Button>
          <h1 className="text-2xl font-bold text-center flex-1 pr-16">每日一卦</h1>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">{hexagram.name}</h2>
          <p className="text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="text-sm text-gray-500 mb-1">本卦</div>
              <HexagramDisplay lines={lines} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium">上下卦名</div>
                <div className="flex items-center">
                  <span className="text-xl font-bold">{hexagram.name}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 ml-2 text-amber-700"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">【解卦】▼</h3>
            <div className="text-amber-700">焦氏易林</div>
          </div>

          <div className="text-gray-800">
            <div className="mb-4">
              <p className="font-medium mb-2">{hexagram.name}：</p>
              <p>{hexagram.description}</p>
            </div>

            <div className="mb-4">
              <p className="font-medium mb-2">{hexagram.name}卦：</p>
              <p>{hexagram.interpretation}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="font-medium mb-2">爻辞：</p>
              <div className="space-y-2">
                <div className="mb-2">
                  <span className="font-medium">初爻：</span>
                  同类相亲，志同道合。
                </div>
                <div className="mb-2">
                  <span className="font-medium">二爻：</span>
                  内外和睦，家族兴旺。
                </div>
                <div className="mb-2">
                  <span className="font-medium">三爻：</span>
                  隐伏敌人，谨防背叛。
                </div>
                <div className="mb-2">
                  <span className="font-medium">四爻：</span>
                  外结盟友，共同发展。
                </div>
                <div className="mb-2">
                  <span className="font-medium">五爻：</span>
                  亲近贤德，获得嘉奖。
                </div>
                <div className="mb-2">
                  <span className="font-medium">上爻：</span>
                  远离同伴，孤军奋战。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
