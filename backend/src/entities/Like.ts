import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { LikeTargetType } from "./enums";
import { User } from "./User";

@Entity("likes")
@Unique("UQ_likes_user_target", ["userId", "targetId", "targetType"])
@Index("IDX_likes_target", ["targetId", "targetType"])
@Index("IDX_likes_user", ["userId"])
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "target_id", type: "uuid" })
  targetId!: string;

  @Column({
    name: "target_type",
    type: "enum",
    enum: LikeTargetType,
    enumName: "likes_target_type_enum",
  })
  targetType!: LikeTargetType;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
