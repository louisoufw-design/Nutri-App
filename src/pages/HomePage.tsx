import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { emailToAccount } from '../lib/account'
import { Lizard } from '../components/Lizard'

export function HomePage({ session }: { session: Session }) {
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    await supabase.auth.signOut()
    setBusy(false)
  }

  return (
    <main className="page">
      <header className="top">
        <Lizard size={84} />
        <div>
          <p className="sub">你好，{emailToAccount(session.user.email)}</p>
          <h1>今日清單</h1>
        </div>
      </header>

      <section className="card empty">
        <p>登入成功。</p>
        <p className="hint">下一步會在這裡加上「新增保健食品」和每天的清單。</p>
      </section>

      <button className="ghost" type="button" onClick={handleSignOut} disabled={busy}>
        {busy ? '登出中…' : '登出'}
      </button>
    </main>
  )
}
