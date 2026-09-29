import s from './Candle.module.css'

type Variant = 'a' | 'b' | 'c'
type Props = { delay?: number; scale?: number; variant?: Variant; className?: string }

// The wax is a rendered image (scripts/candle) in three drip patterns; the flame is drawn and animated here.
export default function Candle({ delay = 0, scale = 1, variant, className }: Props) {
  const d = `-${delay}s`
  const wax = variant ?? (['a', 'b', 'c'] as const)[Math.round(delay * 10) % 3]
  return (
    <div className={className} style={{ width: 80 * scale, height: 260 * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <div className={s.hover} style={{ animationDelay: `-${delay * 1.7}s` }}>
          <svg width="80" height="260" viewBox="0 0 80 260" aria-hidden="true" className={s.svg}>
            <defs>
              <radialGradient id="wzcHalo" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#FFC46B" stopOpacity=".55" />
                <stop offset=".5" stopColor="#FF9A3C" stopOpacity=".16" />
                <stop offset="1" stopColor="#FF9A3C" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="wzcFl" cx=".5" cy=".72" r=".6">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset=".3" stopColor="#FFF3C0" />
                <stop offset=".6" stopColor="#FFC24A" />
                <stop offset=".9" stopColor="#FF7A1A" stopOpacity=".85" />
                <stop offset="1" stopColor="#FF5A10" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle className={s.glow} cx="40" cy="44" r="46" fill="url(#wzcHalo)" style={{ animationDelay: d }} />
            {/* The image runs 12 units below the box, for the curve of the base and any hanging drips. */}
            <image href={`/images/candle-${wax}.webp`} x="0" y="0" width="80" height="272" />
            <path d="M40 64 Q 41 68.5 40 73" stroke="#2A1A0E" strokeWidth="2" fill="none" strokeLinecap="round" />
            <g className={s.flame} style={{ animationDelay: d }}>
              <path d="M40 16 C 51 34 52 52 40 64 C 28 52 29 34 40 16 Z" fill="url(#wzcFl)" />
              <ellipse cx="40" cy="54" rx="4.5" ry="9" fill="#FFFFFF" opacity=".9" />
              <ellipse cx="40" cy="62" rx="4" ry="2.6" fill="#7FA8FF" opacity=".55" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
