import { z } from "zod";
import { LikeTargetType } from "../entities/enums";

export const likeBodySchema = z.object({
  targetId: z.string().uuid("Invalid target id"),
  targetType: z.nativeEnum(LikeTargetType),
});

export const unlikeQuerySchema = z.object({
  targetId: z.string().uuid("Invalid target id"),
  targetType: z.nativeEnum(LikeTargetType),
});

export const likersQuerySchema = z.object({
  type: z.nativeEnum(LikeTargetType),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().optional(),
});

export const likeTargetIdParamSchema = z.object({
  targetId: z.string().uuid("Invalid target id"),
});

export type LikeBodyInput = z.infer<typeof likeBodySchema>;
export type UnlikeQueryInput = z.infer<typeof unlikeQuerySchema>;
export type LikersQuery = z.infer<typeof likersQuerySchema>;
