"use client"

import { Button } from "@/components/ui/button"

// Sample content for Xi Ci Shang Zhuan
const chapterContent = {
  "xici-shang": {
    title: "系辞上传",
    author: "孔子",
    content: `
      第一章
      
      天尊地卑，乾坤定矣。卑高以陈，贵贱位矣。动静有常，刚柔断矣。方以类聚，物以群分，吉凶生矣。在天成象，在地成形，变化见矣。是故刚柔相摩，八卦相荡，鼎之以雷霆，润之以风雨。日月运行，一寒一暑。乾道成男，坤道成女。乾知大始，坤作成物。乾以易知，坤以简能。易则易知，简则易从。易知则有亲，易从则有功。有亲则可久，有功则可大。可久则贤人之德，可大则贤人之业。易简，而天下之理得，而成位乎其中矣。
      
      天尊贵而地卑下，乾与坤的关系就这样定下了。卑下与尊贵排列出来，确定了卦交中位置的贵贱。事物的运动与静止都有规律，于是刚健与柔顺就区分开了。万物的不同种类，分群与类聚集在一起，它们之间的利害关系就产生了。在天上就是天象中的日月星辰，在地上就是万物的化育成形，他们的变化就这样显现出来了。所以刚交与柔交来往环转，八卦相互推荡运动，用雷霆来震动，用风雨来滋润。日月运行，一冷一热。乾道成就男性，坤道成就女性。乾知道万物的开始，坤使万物成形。乾以容易知晓，坤以简单能成。容易就容易知晓，简单就容易遵从。容易知晓就有亲近，容易遵从就有功效。有亲近就可以长久，有功效就可以广大。可以长久就是贤人的德行，可以广大就是贤人的事业。易经简单，而天下的道理得以明了，而成就平其中的位置。
    `,
  },
  // Add more chapters as needed
}

export default function ChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  const { id, chapterId } = params

  // In a real app, you would fetch this content from a database or API
  const content = chapterContent[chapterId as keyof typeof chapterContent]

  if (!content) {
    return (
      <div className="container py-8 pb-20">
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
        </div>
        <div className="text-center py-12">
          <p>内容不存在或正在编辑中</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 pb-20">
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
        <h1 className="text-2xl font-bold">{content.title}</h1>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">{content.title}</h2>
          <p className="text-gray-500">{content.author}</p>
        </div>

        <div className="prose max-w-none">
          {content.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
