import { useMemo } from 'react'
import { buildIcs, buildReminders, icsUrl, isStandalone } from '../lib/calendar'
import type { Supplement } from '../lib/supplements'

export function ReminderCard({ items }: { items: Supplement[] }) {
  const reminders = useMemo(() => buildReminders(items), [items])
  const href = useMemo(() => (items.length > 0 ? icsUrl(buildIcs(items, window.location.origin)) : ''), [items])
  const standalone = isStandalone()

  return (
    <section className="card remind">
      <h2>提醒</h2>
      {reminders.length === 0 ? (
        <p className="hint">先新增保健食品，就可以把時間加到手機行事曆。</p>
      ) : (
        <>
          <p className="hint">
            每天 {reminders.map((r) => r.time).join('、')} 手機行事曆會提醒你。
          </p>
          {/* 從主畫面開啟時要用新視窗，行事曆才會跳出來 */}
          <a className="primary as-link" href={href} target={standalone ? '_blank' : undefined} rel="noopener">
            加入手機行事曆
          </a>
          <p className="hint">按下後選「加入全部」。之後改了時間或品項，請再按一次。</p>
        </>
      )}

      <details className="howto">
        <summary>怎麼更改或刪除提醒</summary>
        <p className="hint">提醒是存在你手機的行事曆裡，這個網站沒辦法替你刪除，需要到行事曆操作：</p>
        <ol>
          <li>打開手機的「行事曆」，點任何一天裡的「吃保健食品」。</li>
          <li>點最下面的「刪除行程」。</li>
          <li>選「刪除所有未來行程」，這個時間就不會再提醒。只選「僅刪除此行程」的話，只有當天不提醒。</li>
        </ol>
        <p className="hint">改了吃的時間：先照上面刪掉舊時間的提醒，再回來按一次「加入手機行事曆」。時間沒變的提醒不會重複。</p>
      </details>

      {!standalone && (
        <details className="howto">
          <summary>把這個網站加到手機主畫面</summary>
          <ol>
            <li>用 Safari 打開這個網站。</li>
            <li>點畫面下方的「分享」按鈕（方框加向上箭頭）。</li>
            <li>往下滑，點「加入主畫面」，再點「加入」。</li>
          </ol>
          <p className="hint">之後從主畫面的圖示打開，第一次需要重新登入一次。</p>
        </details>
      )}
    </section>
  )
}
