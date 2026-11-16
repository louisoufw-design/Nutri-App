import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { emailToAccount } from '../lib/account'
import { dataErrorMessage, listSupplements, slotLabel, type SlotId, type Supplement } from '../lib/supplements'
import { addCheckin, checkinKey, listCheckins, localDay, removeCheckin, weekDays } from '../lib/checkins'
import { Lizard } from '../components/Lizard'
import { SupplementForm } from './SupplementForm'
import { TodayView } from './TodayView'
import { ReminderCard } from '../components/ReminderCard'
import { FeedbackCard } from '../components/FeedbackCard'

type Tab = 'today' | 'mine'
type View = { kind: 'tabs' } | { kind: 'form'; supplement: Supplement | null }

export function HomePage({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>('today')
  const [view, setView] = useState<View>({ kind: 'tabs' })
  const [items, setItems] = useState<Supplement[] | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const account = emailToAccount(session.user.email)

  const load = useCallback(async () => {
    try {
      const week = weekDays()
      const [supplements, checkins] = await Promise.all([listSupplements(), listCheckins(week[0], week[6])])
      setItems(supplements)
      setDone(new Set(checkins.map((c) => checkinKey(c.supplement_id, c.slot, c.day))))
      setError(null)
    } catch (err) {
      setError(dataErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    void load()
    // 手機從背景回到畫面時重新整理，隔天打開才會是新的一天
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  async function toggleCheckin(supplementId: string, slot: SlotId) {
    const day = localDay()
    const key = checkinKey(supplementId, slot, day)
    const wasDone = done.has(key)
    const apply = (on: boolean) =>
      setDone((prev) => {
        const next = new Set(prev)
        if (on) next.add(key)
        else next.delete(key)
        return next
      })
    apply(!wasDone) // 先讓畫面馬上反應，失敗再改回來
    try {
      const checkin = { supplement_id: supplementId, slot, day }
      await (wasDone ? removeCheckin(checkin) : addCheckin(checkin))
      setError(null)
    } catch (err) {
      apply(wasDone)
      setError(dataErrorMessage(err))
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  if (view.kind === 'form') {
    return (
      <SupplementForm
        supplement={view.supplement}
        onCancel={() => setView({ kind: 'tabs' })}
        onDone={() => {
          setView({ kind: 'tabs' })
          void load()
        }}
      />
    )
  }

  const openNew = () => setView({ kind: 'form', supplement: null })

  return (
    <main className="page with-nav">
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

      {items === null && !error && <p className="sub center">載入中…</p>}

      {items !== null && tab === 'today' && (
        <TodayView account={account} items={items} done={done} onToggle={(id, slot) => void toggleCheckin(id, slot)} onAdd={openNew} onRemind={() => setTab('mine')} />
      )}

      {items !== null && tab === 'mine' && (
        <>
          <header className="top">
            <Lizard size={84} />
            <div>
              <p className="sub">你好，{account}</p>
              <h1>我的保健食品</h1>
            </div>
          </header>

          {items.length === 0 ? (
            <section className="card empty">
              <p>還沒有保健食品</p>
              <p className="hint">按下面的按鈕，把你平常在吃的加進來。</p>
            </section>
          ) : (
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

          <button type="button" className="primary" onClick={openNew}>
            ＋ 新增保健食品
          </button>

          <ReminderCard items={items} />

          <FeedbackCard />

          <button className="link signout" type="button" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? '登出中…' : '登出'}
          </button>
        </>
      )}

      <nav className="nav" aria-label="主選單">
        <button type="button" className={tab === 'today' ? 'nav-btn on' : 'nav-btn'} aria-current={tab === 'today' ? 'page' : undefined} onClick={() => setTab('today')}>
          今日清單
        </button>
        <button type="button" className={tab === 'mine' ? 'nav-btn on' : 'nav-btn'} aria-current={tab === 'mine' ? 'page' : undefined} onClick={() => setTab('mine')}>
          我的保健食品
        </button>
      </nav>
    </main>
  )
}
