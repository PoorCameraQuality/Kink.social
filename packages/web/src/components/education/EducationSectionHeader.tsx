import { Link } from 'react-router-dom'

type Props = {
  title: string
  subtitle: string
  backHref?: string
  backLabel?: string
}

export default function EducationSectionHeader({
  title,
  subtitle,
  backHref = '/education',
  backLabel = 'Education overview',
}: Props) {
  return (
    <header className="mb-6">
      <Link to={backHref} className="text-sm font-medium text-dc-accent hover:underline">
        ← {backLabel}
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dc-text-muted">{subtitle}</p>
    </header>
  )
}
