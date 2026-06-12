import { z } from 'zod'

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Name required')
  .max(40, 'Max 40 characters')

export const usernameSchema = z
  .string()
  .trim()
  .min(2, 'Username required')
  .max(32, 'Max 32 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, underscore, hyphen only')

export const passwordSchema = z.string().min(8, 'At least 8 characters').max(128)

export const registerBodySchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  /** Required when the event has `registration_access_code` set. */
  registrationAccessCode: z.string().min(1).max(200).optional(),
})

export const loginBodySchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  registrationAccessCode: z.string().min(1).max(200).optional(),
})

const isoLike = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid ISO datetime')

export const selectionInputSchema = z.object({
  kind: z.enum(['program', 'manual']),
  slotId: z.string().uuid().optional(),
  startsAt: isoLike,
  endsAt: isoLike,
  note: z.string().max(1000).optional(),
})

export const dancecardPutSchema = z.object({
  bufferMinutes: z.number().int().min(0).max(120),
  selections: z.array(selectionInputSchema),
})

export const reserveBodySchema = z.object({
  shareToken: z.string().min(4),
  startsAt: isoLike,
  endsAt: isoLike,
  note: z.string().max(500).optional(),
})

export const previewBodySchema = reserveBodySchema
