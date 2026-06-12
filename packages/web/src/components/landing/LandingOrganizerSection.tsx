import { Link } from 'react-router-dom'

import LandingDanceCardMock from '@/components/landing/LandingDanceCardMock'

import { ORGANIZER_FEATURES } from '@/components/landing/landing-content'

import { ORGANIZER_PRODUCT_FULL_NAME } from '@c2k/shared'



export default function LandingOrganizerSection() {

  return (

    <section className="py-12 lg:py-16" aria-labelledby="landing-organizer-heading">

      <div className="public-container">

        <div className="organizer-panel pub-animate">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--pub-gold-bright)]">

              For organizers

            </p>

            <h2 id="landing-organizer-heading" className="mt-2 text-2xl font-bold text-[var(--pub-text)] lg:text-3xl">

              {ORGANIZER_PRODUCT_FULL_NAME}

            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--pub-text-muted)] lg:text-base">

              Powerful event tools for organizers, educators, venues, and conventions. Rosters, check-in, program

              grids, and community growth without scattered spreadsheets.

            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">

              {ORGANIZER_FEATURES.map((item) => (

                <li key={item} className="flex items-center gap-2 text-sm text-[var(--pub-text-muted)]">

                  <span className="text-[var(--pub-gold-bright)]" aria-hidden>

                    ✓

                  </span>

                  {item}

                </li>

              ))}

            </ul>

            <Link to="/organizer" className="pub-primary-cta mt-8 inline-flex">

              Explore Dance Card

            </Link>



            <div className="mt-6 hidden gap-4 sm:flex md:hidden">

              {['Check-ins', 'Rosters', 'Schedules'].map((label) => (

                <div

                  key={label}

                  className="flex-1 rounded-xl border border-[var(--pub-border)] bg-white/[0.03] px-3 py-2 text-center text-xs font-semibold text-[var(--pub-text-muted)]"

                >

                  {label}

                </div>

              ))}

            </div>

          </div>



          <LandingDanceCardMock />

        </div>

      </div>

    </section>

  )

}

