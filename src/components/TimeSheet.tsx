import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HOURS, MINUTES, splitTime } from '../lib/dose'

const ITEM_HEIGHT = 44

// 上下滾動選擇的滾輪，停下來時最中間那一格就是選到的值
function Wheel({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = Math.max(0, options.indexOf(value)) * ITEM_HEIGHT
    // 只在一開始對齊一次，之後由使用者滾動決定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function handleScroll() {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const index = Math.min(options.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)))
      if (options[index] !== value) onChange(options[index])
    }, 90)
  }

  return (
    <div className="wheel" ref={ref} onScroll={handleScroll} role="listbox" aria-label={label} tabIndex={0}>
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          role="option"
          aria-selected={o === value}
          className={o === value ? 'wheel-item on' : 'wheel-item'}
          onClick={() => ref.current?.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' })}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

interface Props {
  title: string
  value: string // "08:30"
  onDone: (value: string) => void
  onCancel: () => void
}

export function TimeSheet({ title, value, onDone, onCancel }: Props) {
  const initial = splitTime(value)
  const [hour, setHour] = useState(initial.hour)
  const [minute, setMinute] = useState(initial.minute)

  return (
    <div className="sheet-back" onClick={onCancel}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <p className="sheet-title">{title}</p>
        <div className="wheels">
          <div className="wheel-band" aria-hidden="true" />
          <Wheel label="小時" options={HOURS} value={hour} onChange={setHour} />
          <span className="wheel-colon" aria-hidden="true">
            :
          </span>
          <Wheel label="分鐘" options={MINUTES} value={minute} onChange={setMinute} />
        </div>
        <p className="hint center">上下滑動選擇，分鐘以 5 分鐘為單位</p>
        <div className="row">
          <button type="button" className="ghost" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="primary sheet-ok" onClick={() => onDone(`${hour}:${minute}`)}>
            完成（{hour}:{minute}）
          </button>
        </div>
      </div>
    </div>
  )
}
