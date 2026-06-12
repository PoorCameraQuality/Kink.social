import { z } from 'zod'

const isoLike = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid ISO datetime')

export const organizerPatchEventSchema = z.object({
  productTitle: z.string().min(1).max(200).optional(),
  eventTitle: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(500).nullable().optional(),
  timezone: z.string().min(1).max(80).optional(),
  windowStartsAt: isoLike.optional(),
  windowEndsAt: isoLike.optional(),
  sharedByLabel: z.string().min(1).max(120).optional(),
  sharedByDetail: z.string().max(500).nullable().optional(),
  logoUrl: z.union([z.string().max(2000), z.literal('')]).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  staffAccessCode: z.string().max(200).nullable().optional(),
  registrationAccessCode: z.string().max(200).nullable().optional(),
})

export const organizerProgramSlotCreateSchema = z.object({
  startsAt: isoLike,
  endsAt: isoLike,
  title: z.string().min(1).max(500),
  track: z.string().max(200).nullable().optional(),
  room: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})

export const organizerProgramSlotPatchSchema = z.object({
  startsAt: isoLike.optional(),
  endsAt: isoLike.optional(),
  title: z.string().min(1).max(500).optional(),
  track: z.string().max(200).nullable().optional(),
  room: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})

export const organizerStaffShiftCreateSchema = z.object({
  personName: z.string().min(1).max(200),
  role: z.string().min(1).max(120),
  startsAt: isoLike,
  endsAt: isoLike,
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})

export const organizerStaffShiftPatchSchema = z.object({
  personName: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(120).optional(),
  startsAt: isoLike.optional(),
  endsAt: isoLike.optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})
