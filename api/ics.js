// 把網頁產生的行事曆內容原樣送回，並標示成行事曆檔。
// iPhone 要從真正的網址拿到檔案才會跳出「加入行事曆」。這裡不存任何資料，也不連資料庫。
export default function handler(req, res) {
  const encoded = typeof req.query.c === 'string' ? req.query.c : ''
  if (!encoded || encoded.length > 12000 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
    res.status(400).send('Bad request')
    return
  }
  const ics = Buffer.from(encoded, 'base64url').toString('utf8')
  if (!ics.startsWith('BEGIN:VCALENDAR') || !ics.trimEnd().endsWith('END:VCALENDAR')) {
    res.status(400).send('Bad request')
    return
  }
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="supplements.ics"')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.status(200).send(ics)
}
