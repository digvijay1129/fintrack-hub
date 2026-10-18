import { z } from "zod";
export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().default("")
}).strict();
export const updateTeamSchema = createTeamSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one team field to update.");
export const teamQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  membership: z.enum(["owned", "joined"]).optional()
}).strict();
export const inviteSchema = z.object({ email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()) }).strict();
export const acceptInvitationSchema = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/i) }).strict();
