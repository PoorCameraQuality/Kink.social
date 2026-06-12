import { TRUST_PILLS } from '@/components/landing/landing-content'

export default function LandingTrustPillRow() {
  return (
    <div className="trust-row" role="list" aria-label="Community trust signals">
      {TRUST_PILLS.map((pill) => (
        <div key={pill.title} className="trust-pill" role="listitem">
          <span className="trust-icon" aria-hidden>
            {pill.icon}
          </span>
          <div>
            <p className="trust-title">{pill.title}</p>
            <p className="trust-sub">{pill.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
