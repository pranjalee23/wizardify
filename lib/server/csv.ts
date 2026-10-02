import 'server-only'

type Cell = string | number | boolean | null | undefined

// A CSV file that opens cleanly in Excel: a byte-order mark so names in any script come through,
// quotes where needed, and cells that look like formulas (=, +, -, @) made into plain text, so a
// member's name can never run as a formula on someone's computer.
export function toCsv(header: string[], rows: Cell[][]) {
  const cell = (v: Cell) => {
    let s = v === null || v === undefined ? '' : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}

export function csvResponse(name: string, csv: string) {
  const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="wizardify-${name}-${day}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
