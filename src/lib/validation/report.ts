import { z } from "zod";

export const reportSchema = z.object({
  targetType: z.enum(["profile", "service", "message"]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(5, "Merci de préciser le motif.").max(1000),
});
