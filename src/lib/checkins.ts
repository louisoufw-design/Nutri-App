import { supabase } from './supabase'
import type { SlotId } from './supplements'

export interface Checkin {
  supplement_id: string
  slot: SlotId
  day: string // "2026-11-17"，使用者手機上的當地日期
}

export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 本週一到週日的日期
export function weekDays(today: Date = new Date()): string[] {
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return localDay(d)
  })
}

export function checkinKey(supplementId: string, slot: SlotId, day: string): string {
  return `${supplementId}|${slot}|${day}`
}

export async function listCheckins(from: string, to: string): Promise<Checkin[]> {
  const { data, error } = await supabase.from('checkins').select('supplement_id, slot, day').gte('day', from).lte('day', to)
  if (error) throw new Error(error.message)
  return (data ?? []) as Checkin[]
}

export async function addCheckin(c: Checkin): Promise<void> {
  const { error } = await supabase.from('checkins').insert(c)
  // 23505 代表這一筆已經打過卡（例如連點兩下），當作成功
  if (error && error.code !== '23505') throw new Error(error.message)
}

export async function removeCheckin(c: Checkin): Promise<void> {
  const { error } = await supabase
    .from('checkins')
    .delete()
    .eq('supplement_id', c.supplement_id)
    .eq('slot', c.slot)
    .eq('day', c.day)
  if (error) throw new Error(error.message)
}
