import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ACCOUNT_RULE, PASSWORD_MIN, accountError, accountToEmail, authErrorMessage, passwordError } from '../lib/account'
import { Lizard } from '../components/Lizard'

type Mode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = accountError(account) ?? passwordError(password)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    const credentials = { email: accountToEmail(account), password }
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp(credentials)
        if (error) setError(authErrorMessage(error.message))
        else if (!data.session) setError('註冊功能還沒開放完成，請聯絡管理者')
      } else {
        const { error } = await supabase.auth.signInWithPassword(credentials)
        if (error) setError(authErrorMessage(error.message))
      }
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(false)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <main className="page auth">
      <header className="auth-head">
        <Lizard size={120} />
        <h1>保健食品提醒</h1>
        <p className="sub">每天打開看一下，今天該吃的就不會忘。</p>
      </header>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'tab on' : 'tab'} onClick={() => switchMode('login')}>
          登入
        </button>
        <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'tab on' : 'tab'} onClick={() => switchMode('signup')}>
          註冊
        </button>
      </div>

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="account">帳號</label>
        <input
          id="account"
          name="account"
          type="text"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="username"
          placeholder={isSignup ? '自己取一個，例如 louis01' : '你的帳號'}
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        {isSignup && <p className="hint">{ACCOUNT_RULE}。不需要填信箱。</p>}

        <label htmlFor="password">密碼</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? `至少 ${PASSWORD_MIN} 個字` : '你的密碼'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? '處理中…' : isSignup ? '建立帳號' : '登入'}
        </button>

        {isSignup ? (
          <p className="hint">
            我們只保存你的帳號、密碼（加密保存）和你之後填寫的保健食品與打卡紀錄，用來顯示你的清單和統計試用情況，不會提供給其他人。
          </p>
        ) : (
          <p className="hint">忘記密碼請直接聯絡邀請你試用的人，由他幫你重設。</p>
        )}
      </form>

      <p className="fine">本工具只提供提醒，不提供醫療或用量建議。</p>
    </main>
  )
}
