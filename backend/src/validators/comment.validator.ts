import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
  parentId: z.string().uuid("Invalid parent comment id").optional(),
});

export const listCommentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(20),
  cursor: z.string().trim().optional(),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid("Invalid comment id"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
