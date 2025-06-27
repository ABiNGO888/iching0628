import Link from "next/link"

const classicBooks = [
  { id: "yizhuan", title: "易传", color: "bg-[#6b2b25]" },
  { id: "zhouyi", title: "周易古占法", color: "bg-[#1a2c38]" },
  { id: "zhouyi-zhangju", title: "周易章句外编", color: "bg-[#1a2c38]" },
  { id: "yixiang", title: "易象意言", color: "bg-[#1a2c38]" },
  { id: "yilue", title: "周易略例", color: "bg-[#1a2c38]" },
  { id: "yixiaozhu", title: "易小帖", color: "bg-[#1a2c38]" },
]

export default function ClassicsPage() {
  return (
    <div className="container py-8 pb-20">
      <div className="grid grid-cols-2 gap-6">
        {classicBooks.map((book) => (
          <Link href={`/classics/${book.id}`} key={book.id}>
            <div className={`${book.color} p-6 rounded-lg aspect-[4/5] flex items-center justify-center`}>
              <div className="bg-white py-10 px-4 flex items-center justify-center">
                <div className="writing-vertical text-2xl font-bold">{book.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Add this CSS to your globals.css
// .writing-vertical {
//   writing-mode: vertical-rl;
//   text-orientation: upright;
// }
