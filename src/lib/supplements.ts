import { supabase } from './supabase'

export type SlotId = 'before_breakfast' | 'after_breakfast' | 'after_lunch' | 'after_dinner' | 'bedtime'

export interface SlotTime {
  slot: SlotId
  time: string // "08:30"
}

export interface Supplement {
  id: string
  name: string
  dose: string
  times: SlotTime[]
}

export interface SupplementInput {
  name: string
  dose: string
  times: SlotTime[]
}

// 固定時段與預設時間。使用者可以自己改時間。
export const SLOTS: { id: SlotId; label: string; defaultTime: string }[] = [
  { id: 'before_breakfast', label: '早餐前', defaultTime: '07:30' },
  { id: 'after_breakfast', label: '早餐後', defaultTime: '08:30' },
  { id: 'after_lunch', label: '午餐後', defaultTime: '12:30' },
  { id: 'after_dinner', label: '晚餐後', defaultTime: '19:00' },
  { id: 'bedtime', label: '睡前', defaultTime: '22:00' },
]

export const NAME_MAX = 40
export const DOSE_MAX = 30

export function slotLabel(id: SlotId): string {
  return SLOTS.find((s) => s.id === id)?.label ?? id
}

export function sortTimes(times: SlotTime[]): SlotTime[] {
  const order = SLOTS.map((s) => s.id)
  return [...times].sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot))
}

export function inputError(input: SupplementInput): string | null {
  if (!input.name.trim()) return '請填寫名稱'
  if (!input.dose.trim()) return '請填寫每次份量'
  if (input.times.length === 0) return '請至少選一個吃的時間'
  if (input.times.some((t) => !/^\d{2}:\d{2}$/.test(t.time))) return '請確認每個時段都有設定時間'
  return null
}

function clean(input: SupplementInput): SupplementInput {
  return { name: input.name.trim(), dose: input.dose.trim(), times: sortTimes(input.times) }
}

const COLUMNS = 'id, name, dose, times'

export async function listSupplements(): Promise<Supplement[]> {
  const { data, error } = await supabase
    .from('supplements')
    .select(COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Supplement[]
}

export async function createSupplement(input: SupplementInput): Promise<void> {
  const { error } = await supabase.from('supplements').insert(clean(input))
  if (error) throw new Error(error.message)
}

export async function updateSupplement(id: string, input: SupplementInput): Promise<void> {
  const { error } = await supabase
    .from('supplements')
    .update({ ...clean(input), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// 刪除只是標記，不會真的移除，這樣試用統計不會少資料。
export async function deleteSupplement(id: string): Promise<void> {
  const { error } = await supabase
    .from('supplements')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export function dataErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  const m = message.toLowerCase()
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('load failed')) return '連不上網路，請檢查連線後再試'
  return `發生問題，請截圖給管理者（${message}）`
}
