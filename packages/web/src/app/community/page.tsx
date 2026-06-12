import ComingSoonLayout from '@/components/ui/ComingSoonLayout'

export default function CommunityPage() {
  return (
    <ComingSoonLayout
      heading="Community"
      body="Forums, groups, and discussions live here over time. Groups and the local feed are ready to explore."
      primaryCta={{ label: 'Groups', href: '/groups' }}
      secondaryCta={{ label: 'Home feed', href: '/home' }}
    />
  )
}
