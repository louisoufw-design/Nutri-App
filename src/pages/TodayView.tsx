import { useMemo } from 'react'
import { Lizard } from '../components/Lizard'
import { checkinKey, localDay, weekDays } from '../lib/checkins'
import { slotLabel, type SlotId, type Supplement } from '../lib/supplements'

interface Props {
  account: string
  items: Supplement[]
  done: Set<string> // checkinKey 的集合，涵蓋本週
  onToggle: (supplementId: string, slot: SlotId) => void
  onAdd: () => void
  onRemind: () => void
}

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export function TodayView({ account, items, done, onToggle, onAdd, onRemind }: Props) {
  const today = localDay()
  const rows = useMemo(
    () =>
      items
        .flatMap((item) => item.times.map((t) => ({ item, slot: t.slot, time: t.time })))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [items],
  )
  const total = rows.length
  const doneToday = rows.filter((r) => done.has(checkinKey(r.item.id, r.slot, today))).length
  const left = total - doneToday
  const allDone = total > 0 && left === 0

  const perDay = useMemo(() => {
    const counts = new Map<string, number>()
    const active = new Set(rows.map((r) => `${r.item.id}|${r.slot}`))
    for (const key of done) {
      const [id, slot, day] = key.split('|')
      if (!active.has(`${id}|${slot}`)) continue // 已刪除或已改時段的不算
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }
    return counts
  }, [done, rows])

  const greeting = total === 0 ? '先加入你在吃的保健食品吧' : allDone ? '今天都吃完了，做得好' : `今天還有 ${left} 項`

  return (
    <>
      <header className="top">
        <Lizard size={84} happy={allDone} />
        <div>
          <p className="sub">你好，{account}</p>
          <h1>今日清單</h1>
          <p className={allDone ? 'status good' : 'status'} aria-live="polite">
            {greeting}
          </p>
        </div>
      </header>

      <section className="card week" aria-label="本週紀錄">
        {weekDays().map((day, i) => {
          const count = perDay.get(day) ?? 0
          const state = total > 0 && count >= total ? 'full' : count > 0 ? 'part' : 'none'
          const text = state === 'full' ? '全部吃完' : state === 'part' ? '吃了一部分' : day > today ? '還沒到' : '沒有紀錄'
          return (
            <div key={day} className={day === today ? 'day today' : 'day'}>
              <span className={`dot ${state}`} role="img" aria-label={`週${WEEK_LABELS[i]}：${text}`} />
              <span aria-hidden="true">{WEEK_LABELS[i]}</span>
            </div>
          )
        })}
      </section>

      {total === 0 ? (
        <>
          <section className="card empty">
            <p>清單還是空的</p>
            <p className="hint">加入保健食品後，每天要吃的會出現在這裡。</p>
          </section>
          <button type="button" className="primary" onClick={onAdd}>
            ＋ 新增保健食品
          </button>
        </>
      ) : (
        <ul className="list">
          {rows.map((r) => {
            const isDone = done.has(checkinKey(r.item.id, r.slot, today))
            return (
              <li key={`${r.item.id}|${r.slot}`}>
                <button
                  type="button"
                  className={isDone ? 'card item check done' : 'card item check'}
                  aria-pressed={isDone}
                  onClick={() => onToggle(r.item.id, r.slot)}
                >
                  <span className="item-txt">
                    <span className="item-name">{r.item.name}</span>
                    <span className="item-meta">
                      {slotLabel(r.slot)} {r.time}・{r.item.dose}
                    </span>
                  </span>
                  <span className="tick" aria-hidden="true">
                    ✓
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {total > 0 && <p className="hint center">吃了就點一下打卡，點錯再點一次可以取消。</p>}
      {total > 0 && (
        <button type="button" className="link center-btn" onClick={onRemind}>
          設定手機行事曆提醒
        </button>
      )}
    </>
  )
}
