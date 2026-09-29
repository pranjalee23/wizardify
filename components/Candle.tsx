import s from './Candle.module.css'

type Props = { delay?: number; scale?: number; className?: string }

export default function Candle({ delay = 0, scale = 1, className }: Props) {
  const d = `-${delay}s`
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
              <linearGradient id="wzcWax" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#A8946E" />
                <stop offset=".3" stopColor="#F3E7CC" />
                <stop offset=".55" stopColor="#FBF4E4" />
                <stop offset=".8" stopColor="#DCCBA8" />
                <stop offset="1" stopColor="#8E7C5C" />
              </linearGradient>
              <linearGradient id="wzcLit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFB45A" stopOpacity=".55" />
                <stop offset="1" stopColor="#FFB45A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle className={s.glow} cx="40" cy="44" r="46" fill="url(#wzcHalo)" style={{ animationDelay: d }} />
            <rect x="21" y="70" width="38" height="190" fill="url(#wzcWax)" />
            <path d="M21 74 C 21 90 17 100 18 118 C 19 126 24 126 24 116 L 24 74 Z" fill="url(#wzcWax)" />
            <path d="M56 74 C 56 86 60 94 59 106 C 58 112 54 112 54 104 L 54 74 Z" fill="url(#wzcWax)" />
            <rect x="21" y="70" width="38" height="70" fill="url(#wzcLit)" />
            <ellipse cx="40" cy="71" rx="19" ry="5" fill="#FFF1D2" />
            <ellipse cx="40" cy="71" rx="12" ry="3" fill="#FFD28A" opacity=".7" />
            <path d="M40 64 Q 41 68 40 72" stroke="#2A1A0E" strokeWidth="2" fill="none" strokeLinecap="round" />
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
