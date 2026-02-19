export function getStars(score, total = 10) {
  if (score >= total) return 3
  if (score >= Math.ceil(total * 0.8)) return 2
  if (score >= Math.ceil(total * 0.5)) return 1
  return 0
}

export default function Stars({ count, size = 'text-lg' }) {
  return (
    <span className={`${size} inline-flex gap-0.5`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= count ? 'opacity-100' : 'opacity-20'}>
          {'\u2B50'}
        </span>
      ))}
    </span>
  )
}
