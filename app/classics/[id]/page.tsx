"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

const classicBooks = {
  yizhuan: {
    title: "易传",
    chapters: [
      { id: "xici-shang", title: "系辞上传" },
      { id: "xici-xia", title: "系辞下传" },
      { id: "qian-wen", title: "乾文言" },
      { id: "kun-wen", title: "坤文言" },
      { id: "shuogua", title: "说卦传" },
      { id: "xugua", title: "序卦传" },
      { id: "zagua", title: "杂卦传" },
    ],
  },
  zhouyi: {
    title: "周易古占法",
    chapters: [
      { id: "basic", title: "基础占法" },
      { id: "advanced", title: "进阶占法" },
      { id: "special", title: "特殊占法" },
    ],
  },
  "zhouyi-zhangju": {
    title: "周易章句外编",
    chapters: [
      { id: "part1", title: "第一部分" },
      { id: "part2", title: "第二部分" },
      { id: "part3", title: "第三部分" },
    ],
  },
  yixiang: {
    title: "易象意言",
    chapters: [
      { id: "part1", title: "第一部分" },
      { id: "part2", title: "第二部分" },
    ],
  },
  yilue: {
    title: "周易略例",
    chapters: [
      { id: "part1", title: "第一部分" },
      { id: "part2", title: "第二部分" },
    ],
  },
  yixiaozhu: {
    title: "易小帖",
    chapters: [
      { id: "part1", title: "第一部分" },
      { id: "part2", title: "第二部分" },
    ],
  },
}

export default function ClassicBookPage({ params }: { params: { id: string } }) {
  const bookId = params.id
  const book = classicBooks[bookId as keyof typeof classicBooks]

  if (!book) {
    return <div className="container py-8">书籍不存在</div>
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
        <h1 className="text-2xl font-bold">{book.title}</h1>
      </div>

      <div className="space-y-4">
        {book.chapters.map((chapter) => (
          <Link
            href={`/classics/${bookId}/${chapter.id}`}
            key={chapter.id}
            className="block bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{chapter.title}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
