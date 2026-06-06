import { z } from "zod";
import { PostVisibility } from "../entities/enums";

export const createPostSchema = z
  .object({
    content: z
      .string()
      .trim()
      .max(5000, "Content is too long")
      .optional(),
    visibility: z
      .nativeEnum(PostVisibility)
      .default(PostVisibility.PUBLIC),
  })
  .refine(
    (data) => Boolean(data.content && data.content.length > 0),
    "Post must include text or an image"
  );

export const createPostMultipartSchema = z.object({
  content: z
    .string()
    .trim()
    .max(5000, "Content is too long")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  visibility: z
    .nativeEnum(PostVisibility)
    .default(PostVisibility.PUBLIC),
});

export const listPostsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
  cursor: z.string().trim().optional(),
});

export const postIdParamSchema = z.object({
  id: z.string().uuid("Invalid post id"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreatePostMultipartInput = z.infer<typeof createPostMultipartSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
