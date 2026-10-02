import Link from 'next/link'
import { CURRENT_DROP } from '@/lib/drops'
import { houses } from '@/lib/houses'
import { filterQuery, preferenceFilters, type Filters } from '@/lib/server/members'
import s from '@/app/admin/admin.module.css'

type Props = { action: string; f: Filters; cities: string[] }

type Option = string | [value: string, label: string]

// The filters on the dashboard and the drop alerts page. They're sent in the page's address, so a
// filtered view can be bookmarked or shared, and downloads use the same filters.
export default function FilterForm({ action, f, cities }: Props) {
  const filtered = filterQuery(f) !== ''
  const select = (name: string, label: string, options: readonly Option[], value?: string) => (
    <label className={s.field}>
      {label}
      <select name={name} defaultValue={value ?? ''} className={s.select}>
        <option value="">Any</option>
        {options.map((o) => {
          const [v, text] = Array.isArray(o) ? o : [o, o]
          return (
            <option key={v} value={v}>
              {text}
            </option>
          )
        })}
      </select>
    </label>
  )
  const moreOpen = Boolean(f.email || f.whatsapp || f.alert || f.from || f.to || preferenceFilters.some((p) => f[p.key]))

  return (
    <form className={s.card} action={action}>
      <h2 className={s.subtitle}>Filter reservations</h2>
      <div className={s.filters}>
        <label className={s.field}>
          Reservation number
          <span className={s.prefixed}>
            <span className={s.prefix}>WZ-</span>
            <input
              name="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0001"
              defaultValue={f.number ? String(f.number).padStart(4, '0') : ''}
              className={s.input}
            />
          </span>
        </label>
        <label className={s.field}>
          Name, email, WhatsApp or IP
          <input name="q" defaultValue={f.q ?? ''} className={s.input} />
        </label>
        {select('city', 'City', [...new Set(cities)], f.city)}
        {select('house', 'House', houses.map((h): Option => [h.id, h.name]), f.house)}
        {select('first', 'First in line', [['yes', 'Yes'], ['no', 'No']], f.first)}
        {select('photos', 'Photos', [['yes', 'Added'], ['no', 'None yet']], f.photos)}
      </div>
      <details className={s.more} open={moreOpen}>
        <summary>More filters</summary>
        <div className={s.filters}>
          {select('email', 'Email alerts', [['on', 'On'], ['off', 'Off']], f.email)}
          {select('whatsapp', 'WhatsApp alerts', [['on', 'On'], ['off', 'Off']], f.whatsapp)}
          {select('alert', `Drop alert (${CURRENT_DROP.label})`, [['sent', 'Sent'], ['not-sent', 'Not sent yet']], f.alert)}
          <label className={s.field}>
            Reserved from
            <input type="date" name="from" defaultValue={f.from ?? ''} className={s.input} />
          </label>
          <label className={s.field}>
            Reserved to
            <input type="date" name="to" defaultValue={f.to ?? ''} className={s.input} />
          </label>
          {preferenceFilters.map((p) => (
            <span key={p.key}>{select(p.key, p.label, p.options, f[p.key])}</span>
          ))}
        </div>
      </details>
      <div className={s.row}>
        <button className={s.btnGold}>Apply filters</button>
        {filtered && (
          <Link href={action} className={s.btn}>
            Clear
          </Link>
        )}
      </div>
    </form>
  )
}
