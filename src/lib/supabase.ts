import { createClient } from '@supabase/supabase-js'

// 這兩個值是「公開」的，本來就會出現在網站程式裡，放在 GitHub 沒有問題。
// 資料安全靠的是資料庫的權限規則（RLS），不是把它們藏起來。
// 絕對不能放進來的是 service role / secret key。
const SUPABASE_URL = 'https://bnprpzxvyagtdhwolocn.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_S0usQ47dlHTL03nlvNPI7Q_ZUSEyifx'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
