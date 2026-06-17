import { Link } from 'react-router-dom'
import {
  LANDING_BASIC_SLOGAN,
  LANDING_BASIC_TRUST,
  LANDING_SIDE_HERO_FEATURES,
} from '@/components/landing/landing-content'

export default function LandingSideHero() {
  return (
    <div className="landing-side-hero">
      <div className="landing-side-hero__backdrop" aria-hidden />

      <div className="landing-side-hero__inner pub-animate">
        <p className="landing-side-hero__eyebrow">Community platform</p>
        <h2 className="landing-side-hero__headline">{LANDING_BASIC_SLOGAN}</h2>
        <p className="landing-side-hero__lede">
          Events, groups, education, vendors, and the people who make it happen — built for
          consent-first adults.
        </p>

        <nav className="landing-side-hero__nav" aria-label="Explore the platform">
          <ul className="landing-side-hero__links">
            {LANDING_SIDE_HERO_FEATURES.map((item) => (
              <li key={item.label}>
                <Link to={item.href} className="landing-side-hero__link">
                  <span className="landing-side-hero__link-icon" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="landing-side-hero__trust" aria-label="Community values">
          {LANDING_BASIC_TRUST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
