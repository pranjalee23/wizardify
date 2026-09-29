import type { HouseId } from '@/lib/houses'
import s from './Crest.module.css'

const src: Record<HouseId, string> = {
  emberwyn: '/images/house-emberwyn.jpg',
  tidesong: '/images/house-tidesong.jpg',
  nightbloom: '/images/house-nightbloom.jpg',
  stonecrest: '/images/house-stonecrest.jpg',
}

const shield = 'M10 10 H150 V100 C150 150 112 174 80 186 C48 174 10 150 10 100 Z'

export default function Crest({ house, scale = 1 }: { house: HouseId; scale?: number }) {
  return (
    <div className={s.clip} style={{ width: 160 * scale, height: 190 * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <div className={s.crest}>
          <svg viewBox="0 0 160 190" width="160" height="190" aria-hidden="true" className={s.svg}>
            <defs>
              <clipPath id="wzShield">
                <path d={shield} />
              </clipPath>
            </defs>
            <image href={src[house]} x="0" y="0" width="160" height="190" preserveAspectRatio="xMidYMid slice" clipPath="url(#wzShield)" />
            <path d={shield} fill="none" stroke="#D9B26A" strokeWidth="5" />
            <path d="M17 17 H143 V100 C143 145 108 166 80 177 C52 166 17 145 17 100 Z" fill="none" stroke="#F2DDB0" strokeWidth="1" opacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
