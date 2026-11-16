// 吉祥物蜥蜴（A 晨光版草圖）
export function Lizard({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 130 108" width={size} height={(size * 108) / 130} role="img" aria-label="蜥蜴吉祥物">
      <path d="M78 88 q34 8 34 -16 q0 -16 -14 -12" fill="none" stroke="#7ccf6b" strokeWidth="11" strokeLinecap="round" />
      <ellipse cx="42" cy="98" rx="11" ry="6" fill="#7ccf6b" />
      <ellipse cx="88" cy="98" rx="11" ry="6" fill="#7ccf6b" />
      <ellipse cx="65" cy="80" rx="26" ry="22" fill="#7ccf6b" />
      <ellipse cx="65" cy="84" rx="15" ry="14" fill="#e9f7b8" />
      <ellipse cx="65" cy="42" rx="38" ry="28" fill="#7ccf6b" />
      <circle cx="36" cy="50" r="3" fill="#4fae4a" />
      <circle cx="94" cy="50" r="3" fill="#4fae4a" />
      <circle cx="65" cy="20" r="2.5" fill="#4fae4a" />
      <circle cx="48" cy="34" r="12" fill="#fff" />
      <circle cx="82" cy="34" r="12" fill="#fff" />
      <circle cx="50" cy="36" r="5.5" fill="#1d2a26" />
      <circle cx="80" cy="36" r="5.5" fill="#1d2a26" />
      <circle cx="52" cy="34" r="1.8" fill="#fff" />
      <circle cx="82" cy="34" r="1.8" fill="#fff" />
      <path d="M54 54 q11 9 22 0" fill="none" stroke="#1d2a26" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
