import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { dataErrorMessage } from '../lib/supplements'

const COMMENT_MAX = 500
const SCORES = [1, 2, 3, 4, 5]

export function FeedbackCard() {
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (score === null) {
      setError('請先點一個分數')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase.from('feedback').insert({ score, comment: comment.trim() })
      if (error) throw new Error(error.message)
      setSent(true)
      setScore(null)
      setComment('')
    } catch (err) {
      setError(dataErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <section className="card remind">
        <h2>謝謝你的回饋</h2>
        <p className="hint">已經收到了。之後有新的想法，隨時可以再告訴我們。</p>
        <button type="button" className="ghost" onClick={() => setSent(false)}>
          再寫一則
        </button>
      </section>
    )
  }

  return (
    <section className="card remind">
      <h2>給個回饋</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <fieldset className="scores">
          <legend>這個工具好用嗎？</legend>
          <div className="score-row">
            {SCORES.map((n) => (
              <button
                key={n}
                type="button"
                className={score === n ? 'score on' : 'score'}
                aria-pressed={score === n}
                aria-label={`${n} 分`}
                onClick={() => {
                  setScore(n)
                  setError(null)
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="score-ends">
            <span>很不好用</span>
            <span>很好用</span>
          </div>
        </fieldset>

        <label htmlFor="fb-comment">想說的話（可以不填）</label>
        <textarea
          id="fb-comment"
          rows={3}
          maxLength={COMMENT_MAX}
          placeholder="哪裡好用、哪裡卡住、希望多什麼功能"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="hint">請不要填寫姓名、病歷等個人資料。</p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? '送出中…' : '送出回饋'}
        </button>
      </form>
    </section>
  )
}
