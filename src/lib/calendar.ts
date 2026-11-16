import type { Supplement } from './supplements'

// 把保健食品的時間做成手機行事曆看得懂的檔案（.ics）。
// 同一個時間要吃的會合成一個每天重複的提醒，時間到手機會響。

interface Reminder {
  time: string // "08:30"
  items: { name: string; dose: string }[]
}

export function buildReminders(supplements: Supplement[]): Reminder[] {
  const byTime = new Map<string, Reminder>()
  for (const s of supplements) {
    for (const t of s.times) {
      const r = byTime.get(t.time) ?? { time: t.time, items: [] }
      r.items.push({ name: s.name, dose: s.dose })
      byTime.set(t.time, r)
    }
  }
  return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time))
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

// 行事曆格式規定每行不能超過 75 個位元組，太長要折行
function fold(line: string): string {
  const encoder = new TextEncoder()
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const size = encoder.encode(ch).length
    if (bytes + size > 73) {
      out.push(current)
      current = ' '
      bytes = 1
    }
    current += ch
    bytes += size
  }
  out.push(current)
  return out.join('\r\n')
}

const pad = (n: number) => String(n).padStart(2, '0')

export function buildIcs(supplements: Supplement[], appUrl: string, now: Date = new Date()): string {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nutri-App//Supplement Reminder//ZH', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const r of buildReminders(supplements)) {
    const hhmm = r.time.replace(':', '')
    const names = r.items.map((i) => i.name).join('、')
    const detail = r.items.map((i) => `${i.name}：${i.dose}`).join('\n')
    lines.push(
      'BEGIN:VEVENT',
      // 同一個時間固定同一個編號，重複加入時手機會更新而不是多一筆
      `UID:nutri-app-${hhmm}@nutri-app`,
      `DTSTAMP:${stamp}`,
      // 沒有寫時區，代表「手機當地時間」
      `DTSTART:${date}T${hhmm}00`,
      'DURATION:PT5M',
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escapeText(`吃保健食品：${names}`)}`,
      `DESCRIPTION:${escapeText(`${detail}\n\n吃完記得打卡：${appUrl}`)}`,
      `URL:${appUrl}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(`吃保健食品：${names}`)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

function toBase64Url(text: string): string {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// iPhone 要從真正的網址拿到行事曆檔才會跳出「加入行事曆」，所以交給 /api/ics 原樣送回。
export function icsUrl(ics: string): string {
  return `/api/ics?c=${toBase64Url(ics)}`
}

export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches
}
