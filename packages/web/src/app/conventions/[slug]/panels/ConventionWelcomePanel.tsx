import ConventionWelcomeTab from '@/components/conventions/ConventionWelcomeTab'
import type { PublicAttendeeGuide } from '@/lib/dancecard/attendeeGuideJson'

type Props = {
  guide: PublicAttendeeGuide
  conventionName: string
  conventionDescription: string | null
}

export default function ConventionWelcomePanel({ guide, conventionName, conventionDescription }: Props) {
  return (
    <ConventionWelcomeTab
      guide={guide}
      convention={{ name: conventionName, description: conventionDescription }}
    />
  )
}
