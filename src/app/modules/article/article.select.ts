import { Prisma } from '@prisma/client';

/**
 * ✏️  MANUALLY EDITABLE SELECT
 *
 * • Scalar fields  → set to `true` (included) or `false` / remove line (excluded)
 * • Relation fields → uncomment and customize the nested select as needed
 *
 * This file is generated ONCE. The generator will never overwrite it.
 */
export const articleSelect = {
  id: true,
  title: true,
  description: true,
  stage: true,
  activity: true,
  skill: true,
  image: true,
  link: true,
  files: true,
  materials: true,
  howToDoIt: true,
  whatItHelpsWith: true,
  parentNote: true,
  isKept: true,
  isAutoPush: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;