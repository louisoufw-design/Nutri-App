// 試用版的帳號是使用者自己取的名稱，不收集真實信箱。
// Supabase 的登入系統需要信箱格式，所以在背後補上一個不存在的網域。
const ACCOUNT_DOMAIN = 'nutri-app.invalid'

export const ACCOUNT_RULE = '3–20 個字，可用英文、數字、底線'
export const PASSWORD_MIN = 6

export function normalizeAccount(input: string): string {
  return input.trim().toLowerCase()
}

export function accountError(input: string): string | null {
  const name = normalizeAccount(input)
  if (!name) return '請輸入帳號'
  if (!/^[a-z0-9_]{3,20}$/.test(name)) return `帳號格式不符：${ACCOUNT_RULE}`
  return null
}

export function passwordError(input: string): string | null {
  if (!input) return '請輸入密碼'
  if (input.length < PASSWORD_MIN) return `密碼至少要 ${PASSWORD_MIN} 個字`
  return null
}

export function accountToEmail(input: string): string {
  return `${normalizeAccount(input)}@${ACCOUNT_DOMAIN}`
}

export function emailToAccount(email: string | undefined): string {
  return email ? email.split('@')[0] : ''
}

export function authErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('already been registered')) return '這個帳號已經有人使用，請換一個'
  if (m.includes('invalid login credentials')) return '帳號或密碼不對，請再試一次'
  if (m.includes('email not confirmed')) return '這個帳號還沒啟用，請聯絡管理者'
  if (m.includes('rate limit') || m.includes('too many')) return '嘗試太多次了，請稍等一下再試'
  if (m.includes('failed to fetch') || m.includes('network')) return '連不上網路，請檢查連線後再試'
  return `發生問題，請截圖給管理者（${message}）`
}
