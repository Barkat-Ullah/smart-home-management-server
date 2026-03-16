import { Prisma } from '@prisma/client';
import {
  toUTCEndOfDay,
  toUTCEndOfMonth,
  toUTCStartOfDay,
  toUTCStartOfMonth,
} from '../event/event.utils';
import { ArticleBlogType } from './prompt';

export const buildFilterConditions = (
  filterData: Record<string, any>,
): Prisma.ArticleWhereInput[] => {
  const conditions: Prisma.ArticleWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    if (key === 'createdAt') {
      const parts = (value as string).split('-');

      if (parts.length === 2) {
        // Format: "YYYY-MM" →
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        conditions.push({
          createdAt: {
            gte: toUTCStartOfMonth(year, month),
            lte: toUTCEndOfMonth(year, month),
          },
        });
      } else if (parts.length === 3) {
        // Format: "YYYY-MM-DD" →
        conditions.push({
          createdAt: {
            gte: toUTCStartOfDay(value),
            lte: toUTCEndOfDay(value),
          },
        });
      }
      return;
    }

    if (['status'].includes(key)) {
      conditions.push({
        [key]: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    if (['isDeleted','isKept'].includes(key)) {
      conditions.push({ [key]: value === 'true' });
      return;
    }

    if (key.includes('.')) {
      const [relation, field] = key.split('.');
      conditions.push({ [relation]: { some: { [field]: value } } });
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};

// ─── Constants ────────────────────────────────────────────────────────────────
export const ARTICLES_PER_REQUEST = 2;

export const VALID_STAGES = ['Early', 'Emerging', 'Growing'] as const;
export const VALID_ACTIVITIES = [
  'Communication',
  'Daily_Routines',
  'Calm_And_Explorer',
  'Move_and_Play',
  'Learning_and_skills',
] as const;
export const VALID_BLOG_TYPES: ArticleBlogType[] = [
  'child',
  'cooking',
  'medicine',
  'daily_life',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map blogType → ActivitiesEnum value stored in DB */
export const blogTypeToActivity: Record<Exclude<ArticleBlogType, 'child'>, string> = {
  cooking: 'Cooking',
  medicine: 'Medicine',
  daily_life: 'Daily_Life',
};
