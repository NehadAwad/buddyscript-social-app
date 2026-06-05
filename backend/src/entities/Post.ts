import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Comment } from "./Comment";
import { PostVisibility } from "./enums";
import { User } from "./User";

@Entity("posts")
@Index("IDX_posts_feed", ["createdAt", "visibility"])
@Index("IDX_posts_author_created", ["authorId", "createdAt"])
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "author_id", type: "uuid" })
  authorId!: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author!: User;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ name: "image_url", type: "varchar", length: 512, nullable: true })
  imageUrl!: string | null;

  @Column({
    type: "enum",
    enum: PostVisibility,
    enumName: "posts_visibility_enum",
    default: PostVisibility.PUBLIC,
  })
  visibility!: PostVisibility;

  @Column({ name: "like_count", type: "int", default: 0 })
  likeCount!: number;

  @Column({ name: "comment_count", type: "int", default: 0 })
  commentCount!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];
}
