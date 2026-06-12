import EducationLearningPaths from '@/components/education/EducationLearningPaths'
import EducationSectionHeader from '@/components/education/EducationSectionHeader'
import { MOCK_LEARNING_PATHS } from '@/lib/education-discover-data'
import { EDUCATION_VIEW_META } from '@/lib/education-section-mode'

export default function EducationPathsPage() {
  const meta = EDUCATION_VIEW_META.paths

  return (
    <div>
      <EducationSectionHeader title={meta.title} subtitle={meta.subtitle} />
      <p className="mb-6 rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
        Paths below use demo progress for now. Account-backed progress and certificates are planned. Modules still link
        to real articles where available.
      </p>
      <EducationLearningPaths paths={MOCK_LEARNING_PATHS} showTitle={false} />
    </div>
  )
}
