/** Granular Event Systems command-bridge permission domains. */
export type CommandPermissionDomain = 'registration' | 'staff_ops' | 'scheduler'

export type ConventionCommandPermissions = {
  registration: boolean
  staffOps: boolean
  scheduler: boolean
  /** Org OWNER or ADMIN - implicit full access. */
  isFullAdmin: boolean
  /** Can grant/revoke convention command team members. */
  canManageTeam: boolean
}

export type CommandRequirement =
  | 'any'
  | 'admin'
  | CommandPermissionDomain
  | CommandPermissionDomain[]

export function emptyCommandPermissions(): ConventionCommandPermissions {
  return {
    registration: false,
    staffOps: false,
    scheduler: false,
    isFullAdmin: false,
    canManageTeam: false,
  }
}

export function fullCommandPermissions(): ConventionCommandPermissions {
  return {
    registration: true,
    staffOps: true,
    scheduler: true,
    isFullAdmin: true,
    canManageTeam: true,
  }
}

export function hasAnyCommandPermission(p: ConventionCommandPermissions): boolean {
  return p.isFullAdmin || p.registration || p.staffOps || p.scheduler
}

export function commandPermissionIncludes(
  requirement: CommandRequirement,
  permissions: ConventionCommandPermissions,
): boolean {
  if (permissions.isFullAdmin) return true
  if (requirement === 'any') return hasAnyCommandPermission(permissions)
  if (requirement === 'admin') return permissions.isFullAdmin
  const reqs = Array.isArray(requirement) ? requirement : [requirement]
  return reqs.some((r) => {
    if (r === 'registration') return permissions.registration
    if (r === 'staff_ops') return permissions.staffOps
    if (r === 'scheduler') return permissions.scheduler
    return false
  })
}
