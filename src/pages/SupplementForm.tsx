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
import { suggestNames } from '../lib/suggestions'
import { CUSTOM_UNIT, DOSE_AMOUNTS, DOSE_UNITS, HOURS, MINUTES, formatDose, parseDose, splitTime } from '../lib/dose'

interface Props {
  supplement: Supplement | null // null 代表新增
  onDone: () => void
  onCancel: () => void
}

export function SupplementForm({ supplement, onDone, onCancel }: Props) {
  const [name, setName] = useState(supplement?.name ?? '')
  const [dose, setDose] = useState(() => parseDose(supplement?.dose))
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
      dose: formatDose(dose),
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
  const suggestions = suggestNames(name)

  function setTimePart(id: SlotId, part: 'hour' | 'minute', value: string) {
    setTimes((prev) => {
      const current = splitTime(prev[id] ?? '')
      const next = { ...current, [part]: value }
      return { ...prev, [id]: `${next.hour}:${next.minute}` }
    })
  }

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
        <input
          id="sup-name"
          type="text"
          maxLength={NAME_MAX}
          autoComplete="off"
          placeholder="打幾個字找找看，例如 維生素"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="suggest" role="listbox" aria-label="名稱建議">
            {suggestions.map((s) => (
              <button key={s} type="button" role="option" aria-selected={false} className="chip" onClick={() => setName(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <p className="hint">點選建議，或直接輸入你自己的名稱。</p>

        <label htmlFor="sup-unit">每次份量</label>
        <div className="pair">
          {dose.unit !== CUSTOM_UNIT && (
            <select id="sup-dose" aria-label="數量" value={dose.amount} onChange={(e) => setDose({ ...dose, amount: e.target.value })}>
              {DOSE_AMOUNTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
          <select id="sup-unit" aria-label="單位" value={dose.unit} onChange={(e) => setDose({ ...dose, unit: e.target.value })}>
            {[...DOSE_UNITS, CUSTOM_UNIT].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        {dose.unit === CUSTOM_UNIT && (
          <input
            id="sup-dose-custom"
            type="text"
            aria-label="自己填份量"
            maxLength={DOSE_MAX}
            placeholder="例如 10 毫升"
            value={dose.custom}
            onChange={(e) => setDose({ ...dose, custom: e.target.value })}
          />
        )}
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
                  <span className="time-pick">
                    <select aria-label={`${s.label}的小時`} value={splitTime(times[s.id] ?? '').hour} onChange={(e) => setTimePart(s.id, 'hour', e.target.value)}>
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span aria-hidden="true">:</span>
                    <select aria-label={`${s.label}的分鐘`} value={splitTime(times[s.id] ?? '').minute} onChange={(e) => setTimePart(s.id, 'minute', e.target.value)}>
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </span>
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
