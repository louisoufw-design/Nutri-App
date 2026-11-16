import { useState, type FormEvent } from 'react'
import {
  DOSE_MAX,
  NAME_MAX,
  SLOTS,
  createSupplement,
  dataErrorMessage,
  deleteSupplement,
  inputError,
  updateSupplement,
  type SlotId,
  type Supplement,
} from '../lib/supplements'

interface Props {
  supplement: Supplement | null // null 代表新增
  onDone: () => void
  onCancel: () => void
}

export function SupplementForm({ supplement, onDone, onCancel }: Props) {
  const [name, setName] = useState(supplement?.name ?? '')
  const [dose, setDose] = useState(supplement?.dose ?? '')
  const [times, setTimes] = useState<Partial<Record<SlotId, string>>>(() =>
    Object.fromEntries((supplement?.times ?? []).map((t) => [t.slot, t.time])),
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function toggleSlot(id: SlotId, defaultTime: string) {
    setError(null)
    setTimes((prev) => {
      const next = { ...prev }
      if (id in next) delete next[id]
      else next[id] = defaultTime
      return next
    })
  }

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      onDone()
    } catch (err) {
      setError(dataErrorMessage(err))
      setBusy(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const input = {
      name,
      dose,
      times: SLOTS.filter((s) => s.id in times).map((s) => ({ slot: s.id, time: times[s.id] ?? '' })),
    }
    const problem = inputError(input)
    if (problem) {
      setError(problem)
      return
    }
    void run(() => (supplement ? updateSupplement(supplement.id, input) : createSupplement(input)))
  }

  const count = Object.keys(times).length

  return (
    <main className="page">
      <header className="bar">
        <button type="button" className="link" onClick={onCancel} disabled={busy}>
          ← 返回
        </button>
        <h1>{supplement ? '編輯保健食品' : '新增保健食品'}</h1>
      </header>

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="sup-name">名稱</label>
        <input id="sup-name" type="text" maxLength={NAME_MAX} placeholder="例如 維生素 C" value={name} onChange={(e) => setName(e.target.value)} />

        <label htmlFor="sup-dose">每次份量</label>
        <input id="sup-dose" type="text" maxLength={DOSE_MAX} placeholder="例如 1 顆" value={dose} onChange={(e) => setDose(e.target.value)} />
        <p className="hint">請依照產品包裝上的標示填寫。</p>

        <fieldset className="slots">
          <legend>
            吃的時間 <span className="hint">{count > 0 ? `一天 ${count} 次` : '可以選多個'}</span>
          </legend>
          {SLOTS.map((s) => {
            const on = s.id in times
            return (
              <div key={s.id} className={on ? 'slot on' : 'slot'}>
                <label className="slot-check">
                  <input type="checkbox" checked={on} onChange={() => toggleSlot(s.id, s.defaultTime)} />
                  <span>{s.label}</span>
                </label>
                {on && (
                  <input
                    className="slot-time"
                    type="time"
                    aria-label={`${s.label}的提醒時間`}
                    value={times[s.id] ?? ''}
                    onChange={(e) => setTimes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  />
                )}
              </div>
            )
          })}
          <p className="hint">時間是之後加入行事曆提醒用的，可以改成你自己的作息。</p>
        </fieldset>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? '儲存中…' : '儲存'}
        </button>
      </form>

      {supplement &&
        (confirmingDelete ? (
          <div className="card confirm">
            <p>確定要刪除「{supplement.name}」嗎？</p>
            <div className="row">
              <button type="button" className="ghost" onClick={() => setConfirmingDelete(false)} disabled={busy}>
                先不要
              </button>
              <button type="button" className="danger" onClick={() => void run(() => deleteSupplement(supplement.id))} disabled={busy}>
                確定刪除
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="link danger-text" onClick={() => setConfirmingDelete(true)} disabled={busy}>
            刪除這個保健食品
          </button>
        ))}
    </main>
  )
}
