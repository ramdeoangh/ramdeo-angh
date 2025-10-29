import { z } from 'zod';

// Shared enums
export const UserRole = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRole>;

export const PostStatus = z.enum(['draft', 'published', 'scheduled']);
export type PostStatus = z.infer<typeof PostStatus>;

// User
export const UserDTO = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  role: UserRole,
  createdAt: z.string(),
  updatedAt: z.string()
});
export type UserDTO = z.infer<typeof UserDTO>;

// Auth
export const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export type LoginInput = z.infer<typeof LoginInput>;

export const AuthResponse = z.object({ user: UserDTO });
export type AuthResponse = z.infer<typeof AuthResponse>;

// Category / Tag
export const CategoryDTO = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1)
});
export type CategoryDTO = z.infer<typeof CategoryDTO>;

export const TagDTO = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1)
});
export type TagDTO = z.infer<typeof TagDTO>;

// Post
export const PostDTO = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().optional(),
  contentMarkdown: z.string(),
  coverUrl: z.string().url().nullable().optional(),
  status: PostStatus,
  publishedAt: z.string().nullable(),
  authorId: z.number().int().positive(),
  category: CategoryDTO.nullable().optional(),
  tags: z.array(TagDTO),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type PostDTO = z.infer<typeof PostDTO>;

export const PostListQuery = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1)
});
export type PostListQuery = z.infer<typeof PostListQuery>;

export const CreatePostInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  contentMarkdown: z.string(),
  coverUrl: z.string().url().optional().nullable(),
  status: PostStatus.default('draft'),
  publishedAt: z.string().optional().nullable(),
  categoryId: z.number().int().optional(),
  tagIds: z.array(z.number().int()).default([])
});
export type CreatePostInput = z.infer<typeof CreatePostInput>;

export const UpdatePostInput = CreatePostInput.partial();
export type UpdatePostInput = z.infer<typeof UpdatePostInput>;

// CV Upload
export const CVUploadDTO = z.object({
  id: z.number().int().positive(),
  fileName: z.string(),
  filePath: z.string(),
  mimeType: z.string(),
  size: z.number().int(),
  extractedText: z.string().nullable(),
  uploadedAt: z.string()
});
export type CVUploadDTO = z.infer<typeof CVUploadDTO>;

// Error shape
export const ApiError = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    issues: z.array(z.any()).optional()
  })
});
export type ApiError = z.infer<typeof ApiError>;


