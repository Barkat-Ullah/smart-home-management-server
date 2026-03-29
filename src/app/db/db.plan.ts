import { DurationType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FREE_FEATURES = [
  // Family
  'Family member profiles (up to 2)',
  'Child profiles & health info (1 child)',
  // Smart Home
  'House rooms (6 default rooms)',
  'Smart devices (up to 5)',
  // Planning
  'Events & reminders',
  'Basic meal plan',
  // Communication
  'In-app notifications',
  'Support feed access',
];

const MONTHLY_FEATURES = [
  // Family
  'Unlimited family member profiles',
  'Unlimited child profiles with health info',
  'Caregiver management & assignment',
  'Shared memories & photo albums',
  // Smart Home
  'Up to 8 rooms (6 default + 2 custom)',
  'Unlimited smart devices with power tracking',
  'CCTV live stream (HLS/RTSP)',
  'AC smart control (Tuya, SwitchBot, Home Assistant)',
  // Planning
  'Events, reminders & recurrence scheduling',
  'Full weekly meal plan with caregiver assignment',
  'Medicine schedule & dose tracking',
  'Refill alerts & missed dose logs',
  'Finance management, budgets & goals',
  'Household inventory tracking',
  // Communication
//   'FCM push notifications',
  'Real-time 1-to-1 chat with file sharing',
  'Admin broadcast reminders',
];

const PLANS = [
  {
    title: 'Free Plan',
    description: 'Core smart home features to get you started at no cost.',
    amount: 0,
    duration: DurationType.Freely,
    features: FREE_FEATURES,
  },
  {
    title: 'Monthly Plan',
    description:
      'Full access to all smart home management features on a monthly basis.',
    amount: 9.99,
    duration: DurationType.Monthly,
    features: MONTHLY_FEATURES,
  },
];

async function seedSubscriptions() {
  console.log('🌱 Starting subscription seeding...');

  for (const plan of PLANS) {
    const existing = await prisma.subscription.findFirst({
      where: {
        duration: plan.duration,
        isDeleted: false,
      },
    });

    if (existing) {
      console.log(`⚠️  Already exists: ${plan.title}`);
      continue;
    }

    await prisma.subscription.create({ data: plan });
    console.log(`✅ Seeded: ${plan.title}`);
  }

  console.log('🎉 Subscription seeding complete!');
}

export default seedSubscriptions;
