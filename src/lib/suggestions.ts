// 新增保健食品時的名稱建議。只是幫忙打字，不代表推薦，使用者也可以自己輸入清單以外的名稱。
// 每一項：[顯示名稱, 其他常見打法]
const ITEMS: [string, string[]][] = [
  ['綜合維生素', ['綜合維他命', '多種維生素', 'multi']],
  ['維生素 A', ['維他命a']],
  ['維生素 B 群', ['b群', '維他命b', 'b complex']],
  ['維生素 B12', ['維他命b12']],
  ['維生素 C', ['維他命c']],
  ['維生素 D', ['維他命d', 'd3']],
  ['維生素 E', ['維他命e']],
  ['維生素 K', ['維他命k', 'k2']],
  ['葉酸', ['folic']],
  ['鈣', ['鈣片', '檸檬酸鈣', '碳酸鈣', 'calcium']],
  ['鎂', ['magnesium']],
  ['鐵', ['鐵劑', 'iron']],
  ['鋅', ['zinc']],
  ['魚油', ['omega', 'dha', 'epa']],
  ['藻油', ['dha', '海藻油']],
  ['亞麻仁油', ['亞麻籽油']],
  ['月見草油', []],
  ['益生菌', ['乳酸菌', 'probiotic']],
  ['膳食纖維', ['纖維']],
  ['酵素', []],
  ['葉黃素', ['lutein']],
  ['膠原蛋白', ['collagen']],
  ['玻尿酸', []],
  ['葡萄糖胺', ['維骨力', 'glucosamine']],
  ['輔酶 Q10', ['q10', 'coq10']],
  ['卵磷脂', []],
  ['薑黃', ['薑黃素']],
  ['紅麴', []],
  ['納豆', ['納豆激酶']],
  ['蔓越莓', []],
  ['乳清蛋白', ['高蛋白', 'protein']],
  ['芝麻素', []],
  ['啤酒酵母', []],
  ['蜂膠', []],
  ['靈芝', []],
  ['人蔘', ['人參']],
  ['瑪卡', ['maca']],
  ['大豆異黃酮', []],
  ['滴雞精', ['雞精']],
  ['GABA', ['胺基丁酸']],
  ['茶胺酸', []],
  ['牛磺酸', []],
  ['穀胱甘肽', []],
  ['鋸棕櫚', []],
  ['南瓜籽', []],
  ['奶薊', ['水飛薊']],
]

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '').replace(/維他命/g, '維生素')
}

const INDEX = ITEMS.map(([name, aliases]) => ({ name, keys: [name, ...aliases].map(norm) }))

export function suggestNames(typed: string, limit = 6): string[] {
  const q = norm(typed)
  if (!q) return []
  const starts: string[] = []
  const contains: string[] = []
  for (const item of INDEX) {
    if (norm(item.name) === q) continue // 已經完全一樣就不用再建議
    if (item.keys.some((k) => k.startsWith(q))) starts.push(item.name)
    else if (item.keys.some((k) => k.includes(q))) contains.push(item.name)
  }
  return [...starts, ...contains].slice(0, limit)
}
