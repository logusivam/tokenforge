export function formatExpiry(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return 'Expired'
  const m = Math.floor(secondsRemaining / 60)
  const s = Math.floor(secondsRemaining % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const ms = now.getTime() - past.getTime()
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  return `${days}d ago`
}
