interface SourceBadgeProps {
  name: string
}

export function SourceBadge({ name }: SourceBadgeProps) {
  return (
    <span className="inline-block bg-black text-white text-xs font-bold uppercase px-2 py-1">
      {name}
    </span>
  )
}