// 份量選單：數量加單位。只是方便填寫，數字請使用者依產品標示自己選。
export const DOSE_AMOUNTS = ['半', '1', '2', '3', '4', '5', '6']
export const DOSE_UNITS = ['顆', '錠', '粒', '包', '匙', '滴', '毫升']
export const CUSTOM_UNIT = '自己填'

export interface DoseParts {
  amount: string
  unit: string // DOSE_UNITS 之一，或 CUSTOM_UNIT
  custom: string
}

export function parseDose(dose: string | undefined): DoseParts {
  if (!dose) return { amount: '1', unit: '顆', custom: '' }
  const m = dose.trim().match(/^(\S+)\s*(\S+)$/)
  if (m && DOSE_AMOUNTS.includes(m[1]) && DOSE_UNITS.includes(m[2])) return { amount: m[1], unit: m[2], custom: '' }
  return { amount: '1', unit: CUSTOM_UNIT, custom: dose }
}

export function formatDose(parts: DoseParts): string {
  return parts.unit === CUSTOM_UNIT ? parts.custom.trim() : `${parts.amount} ${parts.unit}`
}

// 時間選單：小時 00–23，分鐘以 5 分鐘為單位
export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
export const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

export function splitTime(time: string): { hour: string; minute: string } {
  const [h = '08', m = '00'] = time.split(':')
  const rounded = Math.min(55, Math.round(Number(m) / 5) * 5)
  return { hour: HOURS.includes(h) ? h : '08', minute: String(rounded).padStart(2, '0') }
}
