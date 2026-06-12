import { Helmet } from 'react-helmet-async'

import { KINK_SOCIAL_PUBLIC_LAUNCH_ROBOTS_META, KINK_SOCIAL_ROBOTS_META } from '@c2k/shared'



const publicLaunch = import.meta.env.VITE_PUBLIC_LAUNCH === 'true'



/** Global robots meta — noindex by default; public launch enables indexing on marketing pages. */

export default function AppRobotsMeta() {

  const robots = publicLaunch ? KINK_SOCIAL_PUBLIC_LAUNCH_ROBOTS_META : KINK_SOCIAL_ROBOTS_META

  return (

    <Helmet>

      <meta name="robots" content={robots} />

      <meta name="googlebot" content={robots} />

    </Helmet>

  )

}

