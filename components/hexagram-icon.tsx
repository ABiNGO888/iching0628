import type { LightbulbIcon as LucideProps } from "lucide-react"

export function HexagramIcon(props: LucideProps) {
  return (
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
      {...props}
    >
      <path d="M2 4h20M2 8h20M2 12h20M2 16h20M2 20h20" />
    </svg>
  )
}
