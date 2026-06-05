import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity("comments")
@Index("IDX_comments_post_created", ["postId", "createdAt"])
@Index("IDX_comments_parent_created", ["parentId", "createdAt"])
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "post_id", type: "uuid" })
  postId!: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post!: Post;

  @Column({ name: "author_id", type: "uuid" })
  authorId!: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author!: User;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent!: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "like_count", type: "int", default: 0 })
  likeCount!: number;

  @Column({ name: "reply_count", type: "int", default: 0 })
  replyCount!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
