import Groq from 'groq-sdk';
import { StageEnum, ActivitiesEnum } from '@prisma/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleBlogType = 'child' | 'cooking' | 'medicine' | 'daily_life';

export interface AIArticle {
  title: string;
  description: string;
  skill: string[];
  materials: string;
  howToDoIt: string;
  whatItHelpsWith: string;
  image: string;
  parentNote: string;
  link: string;
}

export interface GenerateArticleParams {
  frequency: number;
  blogType: ArticleBlogType;
  stage?: StageEnum;
  activityType?: ActivitiesEnum;
  topic?: string;
}

// ─── Child-only enum subsets (excludes COOKING / MEDICINE / DAILY_LIFE / General) ──

type ChildStage = 'Early' | 'Emerging' | 'Growing';
type ChildActivity =
  | 'Communication'
  | 'Daily_Routines'
  | 'Calm_And_Explorer'
  | 'Move_and_Play'
  | 'Learning_and_skills';

// ─── Config ───────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DEFAULT_IMAGES: Record<ArticleBlogType, string> = {
  child:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
  cooking:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/cooking_default.jpg',
  medicine:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/medicine_default.jpg',
  daily_life:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/daily_life_default.jpg',
};

const stageInfo: Record<ChildStage, string> = {
  Early: '0-2 years old (baby/toddler)',
  Emerging: '3-5 years old (preschool)',
  Growing: '6+ years old (school age)',
};

const activityTypeNames: Record<ChildActivity, string> = {
  Communication: 'Communication & Language',
  Daily_Routines: 'Daily Routines',
  Calm_And_Explorer: 'Calm & Explore Activities',
  Move_and_Play: 'Move and Play',
  Learning_and_skills: 'Learning Skills',
};

const childActivityGuidelines: Record<ChildActivity, string> = {
  Communication:
    'Focus on language development, vocabulary building, conversation skills, storytelling, and expressing emotions.',
  Daily_Routines:
    'Focus on establishing healthy habits like bedtime routines, mealtime practices, hygiene routines, and daily schedules.',
  Calm_And_Explorer:
    'Focus on sensory exploration, mindfulness, quiet activities, nature discovery, and calming techniques.',
  Move_and_Play:
    'Focus on physical development, gross motor skills, active games, coordination, and outdoor play.',
  Learning_and_skills:
    'Focus on cognitive development, problem-solving, early literacy/numeracy, critical thinking, and creativity.',
};

const childCategoryImages: Record<ChildActivity, string> = {
  Communication:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
  Calm_And_Explorer:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547780207_7818e2fa-1746-4213-86b5-232d1e915566_calm_and_explore_category.jpg',
  Daily_Routines:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547833474_d6de0d19-ed2b-482c-8980-9ec4da51676f_daily_routine_category.jpg',
  Move_and_Play:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547912605_653e6095-59db-438d-bb3c-5eb50e1ad471_move_and_play_category.jpg',
  Learning_and_skills:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770548151430_cc936063-8d13-4bf7-9877-85f35300309f_learning.jpg',
};

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildChildPrompt(
  frequency: number,
  stage: ChildStage,
  activityType: ChildActivity,
): string {
  return `You are a child development expert creating engaging activities for parents and children.

Create exactly ${frequency} unique child development activities:

**Target Audience:**
- Learning Stage: ${stage} (${stageInfo[stage]})
- Activity Category: ${activityTypeNames[activityType]}

**Guidelines:**
${childActivityGuidelines[activityType]}

**Requirements:**
- Each activity MUST be distinctly different from others
- Age-appropriate for ${stage} stage children
- Simple, clear instructions that parents can easily follow
- Require minimal setup and common household materials
- Safe and developmentally appropriate

Return ONLY a valid JSON array (no markdown, no backticks):
[
  {
    "title": "Activity name (max 40 characters)",
    "description": "What the child will do and why it's fun (2-3 sentences)",
    "skill": ["primary skill", "secondary skill", "additional skill"],
    "materials": "Comma-separated list of materials",
    "howToDoIt": "Step-by-step instructions as a single paragraph (3-5 sentences)",
    "whatItHelpsWith": "Specific developmental benefits (2-3 sentences)",
    "parentNote": "Tips, safety reminders, or encouragement (1-2 sentences)",
    "link": "A YouTube search URL for a related tutorial. Format: https://www.youtube.com/results?search_query=relevant+search+terms (use + between words, relevant to the activity and age group)"
  }
]

Generate ${frequency} completely different activities now:`;
}

function buildCookingPrompt(frequency: number, topic?: string): string {
  const focus = topic
    ? `Focus area: ${topic}`
    : 'Mix of different cuisines and meal types';
  return `You are a professional chef and food blogger creating practical, delicious recipes and cooking guides.

Create exactly ${frequency} unique cooking articles/recipes:

**Focus:** ${focus}

**Requirements:**
- Practical recipes anyone can follow at home
- Include nutritional benefits where relevant
- Variety of meal types (breakfast, lunch, dinner, snacks, desserts)
- Use commonly available ingredients
- Clear, beginner-friendly instructions

Return ONLY a valid JSON array (no markdown, no backticks):
[
  {
    "title": "Recipe or article title (max 50 characters)",
    "description": "What this recipe is about and why it's great (2-3 sentences)",
    "skill": ["cooking technique 1", "cooking technique 2"],
    "materials": "Ingredients list with quantities, comma-separated",
    "howToDoIt": "Step-by-step cooking instructions as a single paragraph (4-6 sentences)",
    "whatItHelpsWith": "Nutritional benefits, health value, or why this meal is beneficial (2-3 sentences)",
    "parentNote": "Pro tips, substitutions, storage advice, or serving suggestions (1-2 sentences)",
    "link": "A YouTube search URL for a related cooking tutorial. Format: https://www.youtube.com/results?search_query=relevant+recipe+tutorial (use + between words, relevant to the recipe)"
  }
]

Generate ${frequency} completely different cooking articles now:`;
}

function buildMedicinePrompt(frequency: number, topic?: string): string {
  const focus = topic
    ? `Focus area: ${topic}`
    : 'General health, wellness, and preventive care';
  return `You are a certified health educator creating informative, evidence-based health and medicine articles.

Create exactly ${frequency} unique health/medicine educational articles:

**Focus:** ${focus}

**Requirements:**
- Educational, informative content (NOT medical advice, always recommend consulting a doctor)
- Cover topics like: common ailments, medication management, healthy habits, preventive care, mental health
- Include when to seek professional medical help
- Easy to understand for general public
- Always emphasize consulting healthcare professionals

Return ONLY a valid JSON array (no markdown, no backticks):
[
  {
    "title": "Health article title (max 50 characters)",
    "description": "What this article covers and why it matters (2-3 sentences)",
    "skill": ["health concept 1", "wellness tip 2"],
    "materials": "Any tools, supplements, or resources mentioned (comma-separated, or 'None required')",
    "howToDoIt": "Key information, steps, or guidance as a paragraph (4-6 sentences). Always note to consult a doctor.",
    "whatItHelpsWith": "Health benefits, symptoms addressed, or wellness improvements (2-3 sentences)",
    "parentNote": "Important disclaimer, when to seek emergency care, or additional resources (1-2 sentences)",
    "link": "A YouTube search URL for a related health tutorial. Format: https://www.youtube.com/results?search_query=relevant+health+topic (use + between words, relevant to the health topic)"
  }
]

Generate ${frequency} completely different health articles now:`;
}

function buildDailyLifePrompt(frequency: number, topic?: string): string {
  const focus = topic
    ? `Focus area: ${topic}`
    : 'Productivity, home management, lifestyle, and self-improvement';
  return `You are a lifestyle expert creating practical, actionable guides for everyday living.

Create exactly ${frequency} unique daily life improvement articles:

**Focus:** ${focus}

**Requirements:**
- Practical, actionable tips anyone can implement
- Cover topics like: home organization, productivity, time management, budgeting, relationships, self-care
- Simple, step-by-step guidance
- Realistic and achievable for busy people
- Positive, motivating tone

Return ONLY a valid JSON array (no markdown, no backticks):
[
  {
    "title": "Article title (max 50 characters)",
    "description": "What this guide covers and the benefit (2-3 sentences)",
    "skill": ["life skill 1", "habit 2", "technique 3"],
    "materials": "Any tools, apps, or supplies needed (comma-separated, or 'No special materials needed')",
    "howToDoIt": "Step-by-step guide as a single paragraph (4-6 sentences)",
    "whatItHelpsWith": "How this improves daily life, saves time, reduces stress, etc. (2-3 sentences)",
    "parentNote": "Extra tips, common mistakes to avoid, or encouragement (1-2 sentences)",
    "link": "A YouTube search URL for a related lifestyle tutorial. Format: https://www.youtube.com/results?search_query=relevant+lifestyle+topic (use + between words, relevant to the topic)"
  }
]

Generate ${frequency} completely different daily life articles now:`;
}

// ─── Core Generator ───────────────────────────────────────────────────────────

export async function generateArticles(
  params: GenerateArticleParams,
): Promise<AIArticle[]> {
  const { frequency, blogType, stage, activityType, topic } = params;

  let prompt: string;
  let categoryImage: string;

  switch (blogType) {
    case 'child': {
      if (!stage || !activityType) {
        throw new Error(
          'stage and activityType are required for child blog type',
        );
      }
      const childStage = stage as ChildStage;
      const childActivity = activityType as ChildActivity;
      prompt = buildChildPrompt(frequency, childStage, childActivity);
      categoryImage =
        childCategoryImages[childActivity] ?? DEFAULT_IMAGES.child;
      break;
    }
    case 'cooking':
      prompt = buildCookingPrompt(frequency, topic);
      categoryImage = DEFAULT_IMAGES.cooking;
      break;
    case 'medicine':
      prompt = buildMedicinePrompt(frequency, topic);
      categoryImage = DEFAULT_IMAGES.medicine;
      break;
    case 'daily_life':
      prompt = buildDailyLifePrompt(frequency, topic);
      categoryImage = DEFAULT_IMAGES.daily_life;
      break;
    default:
      throw new Error(`Unknown blog type: ${blogType}`);
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 4000,
  });

  const rawText = completion.choices[0]?.message?.content ?? '';

  // Clean response — strip markdown fences if model adds them
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  cleaned = cleaned.replace(/^`+|`+$/g, '');

  const startIndex = cleaned.indexOf('[');
  const endIndex = cleaned.lastIndexOf(']');
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `No JSON array found in Groq response. Raw: ${rawText.slice(0, 300)}`,
    );
  }
  cleaned = cleaned.substring(startIndex, endIndex + 1);

  let articles: Omit<AIArticle, 'image'>[];
  try {
    articles = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse Groq JSON: ${err instanceof Error ? err.message : err}`,
    );
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error('Groq returned an empty or invalid articles array');
  }

  if (articles.length !== frequency) {
    console.warn(`Expected ${frequency} articles, got ${articles.length}`);
  }

  return articles.map(art => ({
    title: art.title || 'Untitled',
    description: art.description || '',
    skill: Array.isArray(art.skill) ? art.skill : [],
    materials: art.materials || '',
    howToDoIt: Array.isArray(art.howToDoIt)
      ? (art.howToDoIt as unknown as string[]).join('\n')
      : art.howToDoIt || '',
    whatItHelpsWith: art.whatItHelpsWith || '',
    parentNote: art.parentNote || '',
    link: art.link || '',
    image: categoryImage,
  }));
}
