import { and, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'

type OrgRow = typeof schema.organizations.$inferSelect

async function getMembership(organizationId: string, userId: string): Promise<{ role: string } | null> {
  const [row] = await db
    .select({ role: schema.organizationMembers.role })
    .from(schema.organizationMembers)
    .where(
      and(
        eq(schema.organizationMembers.organizationId, organizationId),
        eq(schema.organizationMembers.userId, userId),
      ),
    )
    .limit(1)
  return row ?? null
}

/** PUBLIC and MEMBERS orgs are visible to outsiders (join shell); PRIVATE requires membership. */
export async function canViewOrg(org: OrgRow, viewerUserId: string | null): Promise<boolean> {
  if (org.visibility === 'PUBLIC' || org.visibility === 'MEMBERS') return true
  if (!viewerUserId) return false
  const m = await getMembership(org.id, viewerUserId)
  return Boolean(m)
}

/** Member-only org surfaces (forums, chat, members list, private calendar details). */
export function memberContentAllowedForOrgVisibility(visibility: string, isMember: boolean): boolean {
  if (visibility === 'PUBLIC') return true
  return isMember
}

export async function canViewOrgMemberContent(org: OrgRow, viewerUserId: string | null): Promise<boolean> {
  return memberContentAllowedForOrgVisibility(org.visibility, await isOrgMember(org, viewerUserId))
}

export async function isOrgMember(org: OrgRow, viewerUserId: string | null): Promise<boolean> {
  if (!viewerUserId) return false
  if (org.ownerId === viewerUserId) return true
  const m = await getMembership(org.id, viewerUserId)
  return Boolean(m)
}
