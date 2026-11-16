import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { emailToAccount } from '../lib/account'
import { dataErrorMessage, listSupplements, slotLabel, type Supplement } from '../lib/supplements'
import { Lizard } from '../components/Lizard'
import { SupplementForm } from './SupplementForm'

type View = { kind: 'list' } | { kind: 'form'; supplement: Supplement | null }

export function HomePage({ session }: { session: Session }) {
  const [view, setView] = useState<View>({ kind: 'list' })
  const [items, setItems] = useState<Supplement[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setItems(await listSupplements())
    } catch (err) {
      setError(dataErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  if (view.kind === 'form') {
    return (
      <SupplementForm
        supplement={view.supplement}
        onCancel={() => setView({ kind: 'list' })}
        onDone={() => {
          setView({ kind: 'list' })
          void load()
        }}
      />
    )
  }

  return (
    <main className="page">
      <header className="top">
        <Lizard size={84} />
        <div>
          <p className="sub">你好，{emailToAccount(session.user.email)}</p>
          <h1>我的保健食品</h1>
        </div>
      </header>

      {error && (
        <div className="card">
          <p className="error" role="alert">
            {error}
          </p>
          <button type="button" className="ghost retry" onClick={() => void load()}>
            再試一次
          </button>
        </div>
      )}

      {!error && items === null && <p className="sub center">載入中…</p>}

      {items !== null && items.length === 0 && (
        <section className="card empty">
          <p>還沒有保健食品</p>
          <p className="hint">按下面的按鈕，把你平常在吃的加進來。</p>
        </section>
      )}

      {items !== null && items.length > 0 && (
        <ul className="list">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" className="card item" onClick={() => setView({ kind: 'form', supplement: item })}>
                <span className="item-txt">
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">
                    每次 {item.dose}・{item.times.map((t) => `${slotLabel(t.slot)} ${t.time}`).join('、')}
                  </span>
                </span>
                <span className="item-edit">編輯</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {items !== null && (
        <button type="button" className="primary" onClick={() => setView({ kind: 'form', supplement: null })}>
          ＋ 新增保健食品
        </button>
      )}

      <button className="link signout" type="button" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? '登出中…' : '登出'}
      </button>
    </main>
  )
}
