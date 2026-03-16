import httpStatus from 'http-status';
import { Prisma, UserRoleEnum } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { articleSelect } from './article.select';
import { buildFilterConditions } from './article.utils';
import { ArticleBlogType, generateArticles } from './prompt';

// ─── Constants ────────────────────────────────────────────────────────────────

const ARTICLES_PER_REQUEST = 1;

const VALID_STAGES = ['Early', 'Emerging', 'Growing'] as const;
const VALID_ACTIVITIES = [
  'Communication',
  'Daily_Routines',
  'Calm_And_Explorer',
  'Move_and_Play',
  'Learning_and_skills',
] as const;
const VALID_BLOG_TYPES: ArticleBlogType[] = [
  'child',
  'cooking',
  'medicine',
  'daily_life',
];

const blogTypeToActivity: Record<Exclude<ArticleBlogType, 'child'>, string> = {
  cooking: 'Cooking',
  medicine: 'Medicine',
  daily_life: 'Daily_Life',
};

// -------------------------------------------------------
// create Article (manual, with file upload)
// -------------------------------------------------------
const createArticle = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const result = await prisma.article.create({
    data: { ...data, ...uploadedFiles, userId },
    select: articleSelect,
  });
  return result;
};

// -------------------------------------------------------
// generate Article from AI
// -------------------------------------------------------
const generateArticleFromAi = async (req: Request) => {
  const {
    blogType,
    frequency = ARTICLES_PER_REQUEST,
    stage,
    activityType,
    topic,
  } = req.body;



  // ── Validate blogType ──────────────────────────────────────────────────────
  if (!blogType || !VALID_BLOG_TYPES.includes(blogType)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Missing or invalid blogType. Must be one of: ${VALID_BLOG_TYPES.join(', ')}`,
    );
  }

  // ── Child-specific validation ──────────────────────────────────────────────
  if (blogType === 'child') {
    if (!stage || !activityType) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'stage and activityType are required for child blog type',
      );
    }
    if (!VALID_STAGES.includes(stage)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}`,
      );
    }

    const activityTypes: string[] = Array.isArray(activityType)
      ? activityType
      : [activityType];

    for (const type of activityTypes) {
      if (!VALID_ACTIVITIES.includes(type as any)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid activityType: ${type}. Must be one of: ${VALID_ACTIVITIES.join(', ')}`,
        );
      }
    }
  }

  // ── Generate & save ────────────────────────────────────────────────────────
  const allSavedArticles: any[] = [];

  if (blogType === 'child') {
    const activityTypes: string[] = Array.isArray(activityType)
      ? activityType
      : [activityType];

    for (const type of activityTypes) {
      const aiArticles = await generateArticles({
        frequency: ARTICLES_PER_REQUEST,
        blogType: 'child',
        stage,
        activityType: type as any,
      });

      for (const art of aiArticles) {
        const saved = await prisma.article.create({
          data: {
            title: art.title,
            description: art.description,
            stage,
            activity: type as any,
            skill: art.skill,
            image: art.image,
            link: art.link || null,
            materials: art.materials,
            howToDoIt: art.howToDoIt,
            whatItHelpsWith: art.whatItHelpsWith,
            parentNote: art.parentNote,
            isKept: false,
          },
          select: articleSelect,
        });
        allSavedArticles.push(saved);
      }
    }
  } else {
    const aiArticles = await generateArticles({
      frequency,
      blogType,
      topic,
    });

    for (const art of aiArticles) {
      const saved = await prisma.article.create({
        data: {
          title: art.title,
          description: art.description,
          stage: 'General',
          activity: blogTypeToActivity[
            blogType as Exclude<ArticleBlogType, 'child'>
          ] as any,
          skill: art.skill,
          image: art.image,
          link: art.link || null,
          materials: art.materials,
          howToDoIt: art.howToDoIt,
          whatItHelpsWith: art.whatItHelpsWith,
          parentNote: art.parentNote,
          isKept: false,
        },
        select: articleSelect,
      });
      allSavedArticles.push(saved);
    }
  }

  return {
    count: allSavedArticles.length,
    articles: allSavedArticles,
  };
};

// -------------------------------------------------------
// keep article (admin manually publishes to feed)
// -------------------------------------------------------
const keepArticle = async (id: string, adminUserId?: string) => {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');
  if (existing.isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Article is deleted');

  const updated = await prisma.article.update({
    where: { id },
    data: { isKept: true },
    select: articleSelect,
  });
  return updated;
};

// -------------------------------------------------------
// save / unsave article (toggle) for a user
// -------------------------------------------------------
const toggleSaveArticle = async (userId: string, articleId: string) => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || article.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');

  const existing = await prisma.userSaveArticle.findFirst({
    where: { userId, articleId },
  });

  if (existing) {
    return prisma.userSaveArticle.update({
      where: { id: existing.id },
      data: { isSave: !existing.isSave },
    });
  }

  return prisma.userSaveArticle.create({
    data: { userId, articleId, isSave: true },
  });
};

// -------------------------------------------------------
// get my saved articles
// -------------------------------------------------------
const getMySavedArticles = async (
  userId: string,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const [result, total] = await Promise.all([
    prisma.userSaveArticle.findMany({
      where: { userId, isSave: true },
      skip,
      take: limit,
      orderBy: { id: 'desc' },
      select: articleSelect,
    }),
    prisma.userSaveArticle.count({ where: { userId, isSave: true } }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get all Articles
// -------------------------------------------------------
type IArticleFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
  activity?: string;
  stage?: string;
  isKept?: string;
};

const articleSearchableFields = ['title', 'description'];

const getArticleList = async (
  options: IPaginationOptions,
  filters: IArticleFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.ArticleWhereInput[] = [{ isDeleted: false }];

  if (searchTerm) {
    andConditions.push({
      OR: articleSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.ArticleWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: articleSelect,
    }),
    prisma.article.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Article by id
// -------------------------------------------------------
const getArticleById = async (id: string) => {
  const result = await prisma.article.findUnique({
    where: { id },
    select: articleSelect,
  });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');
  return result;
};

// -------------------------------------------------------
// get my Articles (current user only)
// -------------------------------------------------------
const getMyArticle = async (
  req: Request,
  options: IPaginationOptions,
  filters: IArticleFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.ArticleWhereInput[] = [{ isDeleted: false }];

  if (searchTerm) {
    andConditions.push({
      OR: articleSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.ArticleWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: articleSelect,
    }),
    prisma.article.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get feed articles (isKept = true)
// -------------------------------------------------------
const getFeedArticles = async (
  options: IPaginationOptions,
  filters: IArticleFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.ArticleWhereInput[] = [
    { isKept: true },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: articleSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.ArticleWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: {
        ...articleSelect,
      },
    }),
    prisma.article.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// update Article
// -------------------------------------------------------
const updateArticle = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);

  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle)
    throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');

  return prisma.article.update({
    where: { id },
    data: {
      title: data.title ?? existingArticle.title,
      description: data.description ?? existingArticle.description,
      stage: data.stage ?? existingArticle.stage,
      activity: data.activity ?? existingArticle.activity,
      skill: data.skill ?? existingArticle.skill,
      image: uploadedFiles?.image ?? data.image ?? existingArticle.image,
      link: data.link ?? existingArticle.link,
      files: uploadedFiles?.files ?? data.files ?? existingArticle.files,
      materials: data.materials ?? existingArticle.materials,
      howToDoIt: data.howToDoIt ?? existingArticle.howToDoIt,
      whatItHelpsWith: data.whatItHelpsWith ?? existingArticle.whatItHelpsWith,
      parentNote: data.parentNote ?? existingArticle.parentNote,
      isKept: data.isKept ?? existingArticle.isKept,
      isAutoPush: data.isAutoPush ?? existingArticle.isAutoPush,
      status: data.status ?? existingArticle.status,
    },
    select: articleSelect,
  });
};

// -------------------------------------------------------
// toggle Article status (Pending ↔ Complete)
// -------------------------------------------------------
const toggleStatusArticle = async (id: string) => {
  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle)
    throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');

  return prisma.article.update({
    where: { id },
    data: {
      status: existingArticle.status === 'Pending' ? 'Complete' : 'Pending',
    },
    select: articleSelect,
  });
};

// -------------------------------------------------------
// soft delete Article
// -------------------------------------------------------
const softDeleteArticle = async (id: string) => {
  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle)
    throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');
  if (existingArticle.isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Article is already deleted');

  return prisma.article.update({
    where: { id },
    data: { isDeleted: true },
    select: articleSelect,
  });
};

// -------------------------------------------------------
// hard delete Article
// -------------------------------------------------------
const deleteArticle = async (id: string) => {
  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle)
    throw new ApiError(httpStatus.NOT_FOUND, 'Article not found');

  await prisma.article.delete({ where: { id } });
  return { message: 'Article permanently deleted' };
};

export const articleService = {
  createArticle,
  generateArticleFromAi,
  keepArticle,
  toggleSaveArticle,
  getMySavedArticles,
  getArticleList,
  getArticleById,
  getMyArticle,
  getFeedArticles,
  updateArticle,
  toggleStatusArticle,
  softDeleteArticle,
  deleteArticle,
};
