const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

type ActivityCategory =
  | 'Communication'
  | 'Calm_And_Explorer'
  | 'Daily_Routines'
  | 'Move_and_Play'
  | 'Learning_and_skills';

const categoryImages: Record<ActivityCategory, string> = {
  Communication:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
  Calm_And_Explorer:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547780207_7818e2fa-1746-4213-86b5-232d1e915566_calm_and_explore_category.jpg',
  Daily_Routines:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1771741536241_cc752cb9-7f1e-4d05-9e88-0033435cdf80_photo_2026-02-22_12-22-31.jpg',
  Move_and_Play:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547912605_653e6095-59db-438d-bb3c-5eb50e1ad471_move_and_play_category.jpg',
  Learning_and_skills:
    'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547833474_d6de0d19-ed2b-482c-8980-9ec4da51676f_daily_routine_category.jpg',
};

const activities = [
  // ========== STAGE 1: EARLY LEARNER ==========
  {
    title: 'Sound Safari Adventures',
    description:
      "Embark on a jungle adventure right at home by making animal sounds! Encourage your little one to imitate your roars, oinks, and moos. It's a fun way to explore different voices and learn animal names!",
    stage: 'Early',
    activity: 'Communication',
    skill: ['Vocalization', 'Auditory discrimination', 'Vocabulary building'],
    image:
      'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Sound%20Safari%20Adventu',
    status: 'Pending',
    materials: 'None (optional: animal picture books)',
    howToDoIt:
      "Start by making a clear, exaggerated animal sound yourself, like a lion's 'ROAR!' Then, pause and encourage your baby to make a sound in response. Gently guide their mouth or make the sound together if they are hesitant. Introduce new animals and their sounds, pointing to pictures in books if you have them.",
    whatItHelpsWith:
      'This activity boosts vocalization and encourages babbling by providing engaging sound prompts. It helps develop auditory discrimination as babies learn to distinguish between different sounds. It also introduces new vocabulary and associate sounds with specific animals.',
    parentNote:
      'Use expressive tones and gestures to make it extra engaging. Celebrate every sound your child makes, no matter how small!',
    files:
      'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
    isAutoPush: true,
  },
  {
    title: 'Parkway Crawl & Roll',
    description:
      'Transform your living room into a fun, padded obstacle course for your little mover! Watch them explore tunnels, ramps, and soft landings as they build confidence and new skills.',
    stage: 'Early',
    activity: 'Move_and_Play',
    skill: ['gross motor skills', 'coordination', 'balance'],
    image:
      'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Parkway%20Crawl%20%26%20Roll',
    status: 'Pending',
    materials:
      'Blankets, pillows, couch cushions, sturdy cardboard box, laundry basket',
    howToDoIt:
      'Arrange blankets and pillows to create soft, low ramps and tunnels. Place a sturdy cardboard box or laundry basket on its side for a crawling cave. Encourage your child to crawl, climb over, and through the obstacles, offering gentle support and praise. Make it a game by crawling alongside them!',
    whatItHelpsWith:
      'This activity significantly boosts gross motor skills, encouraging crawling, climbing, and balance. It enhances spatial awareness as they navigate through different spaces. The physical challenge builds confidence and a sense of accomplishment.',
    parentNote:
      "Ensure all materials are stable and soft to prevent tumbles. This is a great indoor alternative for days when outdoor play isn't possible.",
    files:
      'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547912605_653e6095-59db-438d-bb3c-5eb50e1ad471_move_and_play_category.jpg',
    isAutoPush: true,
  },
  {
    title: 'ime with Pictures',
    description: "Look at pictures in a book and talk about what's happening",
    stage: 'Early',
    activity: 'Communication',
    skill: ['Language Development', 'Social Interaction'],
    link: 'https://picsum.photos/seed/StoryTime/400/300',
    files:
      'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
    status: 'Pending',
    materials: 'Picture book',
    howToDoIt:
      'Choose a simple book, Sit together,Point and name things, Ask what happens next',
    whatItHelpsWith: 'Builds vocabulary and bonding through shared attention',
    parentNote:
      'Use a board book with thick pages. Let your child turn the pages themselves. Keep sessions short (5-10 mins) if they lose interest quickly.',
    isAutoPush: true,
  },
  {
    title: 'Story Time with Pictures',
    description: "Look at pictures in a book and talk about what's happening",
    stage: 'Early',
    activity: 'Communication',
    skill: ['Language Development', 'Social Interaction'],
    link: 'https://picsum.photos/seed/StoryTime/400/300',
    files:
      'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
    status: 'Pending',
    materials: 'Picture book',
    howToDoIt:
      'Choose a simple book, Sit together,Point and name things, Ask what happens next',
    whatItHelpsWith: 'Builds vocabulary and bonding through shared attention',
    parentNote:
      'Use a board book with thick pages. Let your child turn the pages themselves. Keep sessions short (5-10 mins) if they lose interest quickly.',
    isAutoPush: true,
  },
  {
    title: 'Name & Point Game',
    description:
      "Sit with your child and point to things nearby — body parts, toys, or household items. Say each name clearly and slowly. Let your child touch or point too, even if they don't repeat the word.",
    stage: 'Early',
    activity: 'Communication',
    skill: [
      'Language Development',
      'Cognitive Skills',
      'Attention',
      'Memory',
      'Focus',
    ],
    materials: 'Mirror, stuffed toys, common objects around the home.',
    howToDoIt:
      "Sit with your child and point to things nearby — body parts, toys, or household items. Say each name clearly and slowly. Let your child touch or point too, even if they don't repeat the word.",
    whatItHelpsWith:
      'Language Development – helps your child connect words to real things they see and touch. Cognitive Skills – builds memory and understanding. Brain Area: Strengthens the parts that support attention, memory, and focus.',
    parentNote:
      "Even if your child doesn't speak, they are listening, noticing, and learning every time you talk to them.",
    status: 'Pending',
    files:
      'http://vault.zenexcloud.com:9000/emdadullah/child-documents/images/1770547633489_90ad8176-879d-4c58-be2b-ffe61a16bcbb_communication_and_connection_category.jpg',
    isAutoPush: true,
  },
  {
    title: 'Beach in a Bowl',
    description:
      'Fill a small container with sand, water, or rice. Add natural items like shells, stones, or leaves. Let your child explore by scooping, pouring, and touching.',
    stage: 'Early',
    activity: 'Calm_And_Explorer',
    skill: [
      'Sensory Regulation',
      'Fine Motor Skills',
      'Calm Center',
      'Relaxation',
    ],
    materials: 'Basin, sand or rice, small cups or spoons, shells or stones.',
    howToDoIt:
      'Fill a small container with sand, water, or rice. Add natural items like shells, stones, or leaves. Let your child explore by scooping, pouring, and touching.',
    whatItHelpsWith:
      "Sensory Regulation – helps your child calm their body through touch and texture. Fine Motor Skills – small hand and finger movements that build strength for later writing or feeding. Brain Area: Helps the brain's 'calm center' relax and focus through play.",
    parentNote:
      "You don't need fancy toys — nature provides everything your child needs to learn through play.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Helping Hands',
    description:
      'Ask your child to help sweep, dust, or water plants. Give them simple, child-safe tasks and praise their effort.',
    stage: 'Early',
    activity: 'Daily_Routines',
    skill: ['Motor Coordination', 'Independence', 'Planning', 'Attention'],
    materials:
      'Small towel, spray bottle, child-sized broom, cup of water for watering.',
    howToDoIt:
      'Ask your child to help sweep, dust, or water plants. Give them simple, child-safe tasks and praise their effort.',
    whatItHelpsWith:
      'Motor Coordination – how hands and body work together. Independence – helps your child feel proud and capable. Brain Area: Builds planning and attention through real-life participation.',
    parentNote:
      "Let them help, even if it's messy. Every act of helping builds confidence and belonging.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Match & Sort',
    description:
      'Use small items like bottle caps, buttons, or fruits. Ask your child to group them by color, size, or shape.',
    stage: 'Early',
    activity: 'Learning_and_skills',
    skill: [
      'Cognitive Skills',
      'Visual Perception',
      'Focus',
      'Attention',
      'Problem-Solving',
    ],
    materials: 'Household items like caps, beans, fruit, stones, small bowls.',
    howToDoIt:
      'Use small items like bottle caps, buttons, or fruits. Ask your child to group them by color, size, or shape.',
    whatItHelpsWith:
      'Cognitive Skills – thinking, comparing, and organizing. Visual Perception – how the eyes and brain notice patterns and differences. Brain Area: Strengthens focus, attention, and problem-solving.',
    parentNote:
      "If your child doesn't sort the way you expect, that's okay. They're learning by exploring.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Coconut Roll',
    description:
      'Sit across from your child and roll a coconut or ball back and forth. Count each roll or make fun sounds as it moves.',
    stage: 'Early',
    activity: 'Move_and_Play',
    skill: [
      'Gross Motor Skills',
      'Social Turn-Taking',
      'Balance',
      'Control',
      'Coordination',
    ],
    materials: 'Coconut, ball, or round fruit like an orange.',
    howToDoIt:
      'Sit across from your child and roll a coconut or ball back and forth. Count each roll or make fun sounds as it moves.',
    whatItHelpsWith:
      'Gross Motor Skills – big body movements that build balance and control. Social Turn-Taking – learning to wait and take turns. Brain Area: Builds timing, focus, and coordination.',
    parentNote:
      "Even if your child doesn't roll back yet, keep going. Every roll teaches connection and patience.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Leaf Sorting',
    description:
      'Go outside with your child and collect leaves. Sort them by size, shape, or color.',
    stage: 'Early',
    activity: 'Calm_And_Explorer',
    skill: [
      'Visual Thinking',
      'Language Development',
      'Attention',
      'Observation',
    ],
    materials: 'Leaves, basket, or tray.',
    howToDoIt:
      'Go outside with your child and collect leaves. Sort them by size, shape, or color.',
    whatItHelpsWith:
      "Visual Thinking – helps your child notice differences and details. Language Development – builds new describing words ('big leaf,' 'green leaf'). Brain Area: Supports attention and observation skills.",
    parentNote:
      'Talk about what you see and feel. Your child learns through your words and your joy.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Sing & Move',
    description:
      'Sing or play local songs. Clap, dance, or stomp along together.',
    stage: 'Early',
    activity: 'Communication',
    skill: [
      'Language Development',
      'Auditory Processing',
      'Rhythm',
      'Memory',
      'Social Engagement',
    ],
    materials: 'Music, pots or spoons to tap, hands for clapping.',
    howToDoIt:
      'Sing or play local songs. Clap, dance, or stomp along together.',
    whatItHelpsWith:
      'Language Development – builds rhythm, words, and listening. Auditory Processing – how the brain understands what it hears. Brain Area: Strengthens memory, rhythm, and social engagement.',
    parentNote:
      'Your voice matters more than perfect singing. Every song builds connection.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Mealtime Helper',
    description:
      "Let your child help wash fruit, pour water, or stir food. Talk about what they're doing.",
    stage: 'Early',
    activity: 'Daily_Routines',
    skill: ['Independence', 'Fine Motor Skills', 'Focus', 'Planning'],
    materials: 'Bowl, spoon, fruit, small pitcher, or cup.',
    howToDoIt:
      "Let your child help wash fruit, pour water, or stir food. Talk about what they're doing: 'You're washing the mango,' 'You're stirring the pot.'",
    whatItHelpsWith:
      'Independence – builds pride and focus through helping. Fine Motor Skills – small hand and wrist movements. Brain Area: Encourages focus and planning during real-life tasks.',
    parentNote:
      'Even one small job teaches your child patience and confidence.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Towel Tunnel',
    description:
      'Drape a towel or sheet over chairs to create a tunnel. Let your child crawl through, peek out, or hide inside.',
    stage: 'Early',
    activity: 'Calm_And_Explorer',
    skill: [
      'Body Awareness',
      'Motor Planning',
      'Coordination',
      'Problem-Solving',
    ],
    materials: 'Towel, bedsheet, chairs.',
    howToDoIt:
      'Drape a towel or sheet over chairs to create a tunnel. Let your child crawl through, peek out, or hide inside.',
    whatItHelpsWith:
      'Body Awareness – understanding where their body is in space. Motor Planning – figuring out how to move from one spot to another. Brain Area: Builds coordination and problem-solving through movement.',
    parentNote:
      'Playful movement helps your child feel calm, brave, and capable.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Animal Sounds',
    description:
      'Make animal sounds and guess which animal it is. Encourage your child to copy the sound or movement.',
    stage: 'Early',
    activity: 'Learning_and_skills',
    skill: [
      'Speech Practice',
      'Listening Skills',
      'Sound Recognition',
      'Attention',
    ],
    materials: 'None needed — just imagination!',
    howToDoIt:
      'Make animal sounds and guess which animal it is. Encourage your child to copy the sound or movement.',
    whatItHelpsWith:
      'Speech Practice – builds sound imitation and expression. Listening Skills – teaches focus and memory. Brain Area: Strengthens sound recognition and attention.',
    parentNote:
      "Even if your child doesn't make the sound, keep modeling. They're taking it all in.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Follow My Face',
    description:
      'Sit face-to-face with your child. Make funny faces or expressions and encourage them to copy.',
    stage: 'Early',
    activity: 'Communication',
    skill: ['Emotional Awareness', 'Social Connection', 'Facial Recognition'],
    materials: 'Mirror (optional).',
    howToDoIt:
      'Sit face-to-face with your child. Make funny faces or expressions — happy, surprised, sleepy — and encourage them to copy.',
    whatItHelpsWith:
      'Emotional Awareness – recognizing and copying feelings. Social Connection – builds shared attention and bonding. Brain Area: Strengthens facial recognition and social understanding.',
    parentNote:
      "Even if they don't copy right away, they're learning what feelings look and feel like.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Dress-Up Together',
    description:
      'Let your child dress dolls or themselves with easy clothes — hats, scarves, shoes.',
    stage: 'Early',
    activity: 'Daily_Routines',
    skill: [
      'Fine Motor Skills',
      'Self-Help Skills',
      'Independence',
      'Sequencing',
    ],
    materials: 'Old clothes, hats, scarves, shoes, or dolls.',
    howToDoIt:
      'Let your child dress dolls or themselves with easy clothes — hats, scarves, shoes.',
    whatItHelpsWith:
      'Fine Motor Skills – buttoning, zipping, and grasping. Self-Help Skills – builds independence in dressing. Brain Area: Strengthens focus and sequencing (remembering steps).',
    parentNote:
      'Let them practice, even if clothes are backward — effort matters more than perfection.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Bubble Chase',
    description:
      'Blow bubbles and let your child chase or pop them. Count or describe what happens.',
    stage: 'Early',
    activity: 'Calm_And_Explorer',
    skill: ['Visual Tracking', 'Gross Motor Skills', 'Focus', 'Coordination'],
    materials: 'Bubble mixture or soap and water, small wand or straw.',
    howToDoIt:
      'Blow bubbles and let your child chase or pop them. Count or describe what happens.',
    whatItHelpsWith:
      'Visual Tracking – following moving objects with their eyes. Gross Motor Skills – running, jumping, and reaching. Brain Area: Strengthens focus and coordination.',
    parentNote:
      'Simple joy builds big skills. Every laugh and chase teaches focus and movement.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Color Hop',
    description:
      'Lay colored papers or fabrics on the floor. Call out a color and have your child hop onto it.',
    stage: 'Early',
    activity: 'Move_and_Play',
    skill: ['Gross Motor Skills', 'Listening', 'Following Directions', 'Focus'],
    materials: 'Colored paper, cloth, or chalk marks on the ground.',
    howToDoIt:
      'Lay colored papers or fabrics on the floor. Call out a color and have your child hop onto it.',
    whatItHelpsWith:
      'Gross Motor Skills – big body coordination. Listening & Following Directions – strengthens focus. Brain Area: Connects hearing, thinking, and movement.',
    parentNote:
      "Don't rush them. Each jump builds focus, balance, and confidence.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Shape Hunt',
    description:
      'Walk around the house or yard finding shapes — round plates, square tiles, triangle signs.',
    stage: 'Early',
    activity: 'Learning_and_skills',
    skill: [
      'Cognitive Skills',
      'Visual Awareness',
      'Pattern Recognition',
      'Early Math',
    ],
    materials: 'Household items, paper to draw shapes.',
    howToDoIt:
      'Walk around the house or yard finding shapes — round plates, square tiles, triangle signs.',
    whatItHelpsWith:
      'Cognitive Skills – recognizing and matching shapes. Visual Awareness – noticing patterns in daily life. Brain Area: Supports attention and early math understanding.',
    parentNote:
      "Every time your child finds a shape, they're learning about the world around them.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Nature Sounds Walk',
    description:
      'Go for a short walk and listen quietly. Point out sounds — birds, cars, waves, or wind.',
    stage: 'Early',
    activity: 'Calm_And_Explorer',
    skill: ['Auditory Attention', 'Mindfulness', 'Listening', 'Calmness'],
    materials: 'None needed.',
    howToDoIt:
      'Go for a short walk and listen quietly. Point out sounds — birds, cars, waves, or wind.',
    whatItHelpsWith:
      "Auditory Attention – builds focus through listening. Mindfulness – helps your child slow down and feel calm. Brain Area: Strengthens the brain's 'listening center.'",
    parentNote:
      'Quiet moments together teach peace, focus, and connection with nature.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Yes/No Choices',
    description:
      "Offer your child two options — 'Do you want water or juice?' Use pictures or real items if needed.",
    stage: 'Early',
    activity: 'Communication',
    skill: [
      'Choice-Making',
      'Language Understanding',
      'Decision-Making',
      'Comprehension',
    ],
    materials: 'Objects, pictures, or snacks.',
    howToDoIt:
      "Offer your child two options — 'Do you want water or juice?' Use pictures or real items if needed.",
    whatItHelpsWith:
      "Choice-Making – builds confidence and communication. Language Understanding – learning 'yes' and 'no.' Brain Area: Strengthens decision-making and comprehension.",
    parentNote:
      "Even if your child doesn't answer with words, watch their eyes and body — that is communication.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Bedtime Song Routine',
    description:
      'Create a short, calm song to sing during bedtime steps — brushing teeth, story, lights off.',
    stage: 'Early',
    activity: 'Daily_Routines',
    skill: ['Routine', 'Sequencing', 'Emotional Regulation', 'Memory'],
    materials: 'Favorite stuffed animal, blanket, quiet space.',
    howToDoIt:
      'Create a short, calm song to sing during bedtime steps — brushing teeth, story, lights off.',
    whatItHelpsWith:
      'Routine & Sequencing – learning daily order. Emotional Regulation – helps your child wind down. Brain Area: Builds memory through repetition.',
    parentNote:
      'Consistency brings comfort. Over time, your child will begin to relax as soon as they hear the song.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Sorting Fruit by Color',
    description:
      'Use fruits you have — mango, banana, apple. Sort by color or size.',
    stage: 'Early',
    activity: 'Learning_and_skills',
    skill: ['Visual Learning', 'Cognitive Skills', 'Organizing', 'Comparing'],
    materials: 'Real fruit, small bowls or baskets.',
    howToDoIt:
      'Use fruits you have — mango, banana, apple. Sort by color or size.',
    whatItHelpsWith:
      'Visual Learning – recognizing differences. Cognitive Skills – organizing and comparing. Brain Area: Encourages focus and decision-making.',
    parentNote: 'Learning can happen anywhere — even while preparing snacks.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Balance Walk',
    description:
      'Draw a line with chalk or lay a rope on the ground. Have your child walk across it, arms out for balance.',
    stage: 'Early',
    activity: 'Move_and_Play',
    skill: ['Gross Motor Skills', 'Body Awareness', 'Balance', 'Focus'],
    materials: 'Chalk, rope, or tape.',
    howToDoIt:
      'Draw a line with chalk or lay a rope on the ground. Have your child walk across it, arms out for balance.',
    whatItHelpsWith:
      'Gross Motor Skills – big muscle control and balance. Body Awareness – helps them feel where their body is. Brain Area: Strengthens movement and focus centers.',
    parentNote:
      "Cheer for every small step. You're helping your child trust their body and ability.",
    status: 'Pending',
    isAutoPush: true,
  },

  // ========== STAGE 2: EMERGING EXPLORER ==========
  {
    title: 'Emotion Match Game',
    description:
      'Draw or print pictures showing feelings like happy, calm, tired, or frustrated. Ask your child to point to or touch the one that matches how they feel or what they see.',
    stage: 'Emerging',
    activity: 'Communication',
    skill: [
      'Emotional Awareness',
      'Expression Recognition',
      'Understanding Feelings',
    ],
    materials: 'Paper, crayons, mirror (optional).',
    howToDoIt:
      'Draw or print pictures showing feelings like happy, calm, tired, or frustrated. Ask your child to point to or touch the one that matches how they feel or what they see. If your child cannot verbally communicate: Have them point to, look at, or hold up the image that matches their feeling.',
    whatItHelpsWith:
      'Emotional awareness, recognizing expressions, and understanding feelings.',
    parentNote:
      'Your child might not use words, but every glance, gesture, or choice is communication.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Laundry Race',
    description:
      'Play upbeat music and sort laundry by color or by person. You can race to finish before the song ends.',
    stage: 'Emerging',
    activity: 'Daily_Routines',
    skill: ['Color Recognition', 'Attention', 'Teamwork', 'Independence'],
    materials: 'Clothes, laundry basket, music.',
    howToDoIt:
      'Play upbeat music and sort laundry by color or by person. You can race to finish before the song ends.',
    whatItHelpsWith:
      'Color recognition, attention, teamwork, and independence.',
    parentNote:
      'Let your child pick the next item or color. Simple choices build decision-making and confidence.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Cushion Balance Path',
    description:
      'Lay pillows on the floor like stepping stones. Have your child walk, hop, or crawl across without stepping off.',
    stage: 'Emerging',
    activity: 'Move_and_Play',
    skill: ['Balance', 'Body Awareness', 'Coordination'],
    materials: 'Cushions, blankets, open floor space.',
    howToDoIt:
      'Lay pillows on the floor like stepping stones. Have your child walk, hop, or crawl across without stepping off.',
    whatItHelpsWith: 'Balance, body awareness, and coordination.',
    parentNote:
      'If your child moves differently, let them adapt the path their way. Movement at any level is growth.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Mystery Bag Guess',
    description:
      'Place a few items in a bag. Let your child feel each one and try to identify it through touch.',
    stage: 'Emerging',
    activity: 'Learning_and_skills',
    skill: ['Sensory Discrimination', 'Problem-Solving', 'Attention'],
    materials: 'Bag, household objects, matching cards or items.',
    howToDoIt:
      'Place a few items in a bag. Let your child feel each one and try to identify it through touch. If your child cannot verbally communicate: Have them point to a matching picture or show you the real object once they find it.',
    whatItHelpsWith: 'Sensory discrimination, problem-solving, and attention.',
    parentNote:
      'Describe what you feel together — this builds shared curiosity and connection.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Show & Share Basket',
    description:
      'Let your child gather favorite items in a small basket. Take turns exploring each item together.',
    stage: 'Emerging',
    activity: 'Communication',
    skill: ['Joint Attention', 'Connection', 'Expression'],
    materials: 'Basket or box, toys or small household items.',
    howToDoIt:
      'Let your child gather favorite items in a small basket. Take turns exploring each item together. Ask your child to show or point to what they like best. If your child cannot verbally communicate: Watch what they focus on — their eyes and gestures tell you what they love.',
    whatItHelpsWith: 'Joint attention, connection, and expression.',
    parentNote:
      'Follow their lead. Every item they choose tells part of their story.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Snack Helper',
    description:
      'Invite your child to help prepare snacks — washing fruit, pouring water, or setting the table.',
    stage: 'Emerging',
    activity: 'Daily_Routines',
    skill: ['Fine Motor Coordination', 'Sequencing', 'Independence'],
    materials: 'Bowls, spoons, safe snacks.',
    howToDoIt:
      'Invite your child to help prepare snacks — washing fruit, pouring water, or setting the table.',
    whatItHelpsWith: 'Fine motor coordination, sequencing, and independence.',
    parentNote:
      'Even one small task builds confidence. Praise participation, not perfection.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Sand Stories',
    description:
      "Draw shapes or trails in sand or flour with your fingers or sticks. Use small toys to 'walk' along the paths.",
    stage: 'Emerging',
    activity: 'Calm_And_Explorer',
    skill: ['Sensory Exploration', 'Focus', 'Imagination'],
    materials: 'Sand, tray, sticks, small toys.',
    howToDoIt:
      "Draw shapes or trails in sand or flour with your fingers or sticks. Use small toys to 'walk' along the paths.",
    whatItHelpsWith: 'Sensory exploration, focus, and imagination.',
    parentNote:
      'Simple, repetitive play helps children feel calm and in control.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Dance Freeze',
    description:
      'Play music and dance or move together. When the music stops, freeze like a statue.',
    stage: 'Emerging',
    activity: 'Move_and_Play',
    skill: ['Listening', 'Self-Regulation', 'Rhythm', 'Body Control'],
    materials: 'Music player or drum.',
    howToDoIt:
      'Play music and dance or move together. When the music stops, freeze like a statue.',
    whatItHelpsWith: 'Listening, self-regulation, rhythm, and body control.',
    parentNote:
      "If your child doesn't freeze, that's okay — joy and connection are the real goals.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Match the Shadow',
    description:
      'Use light from a window or flashlight to create shadows of objects. Have your child match each item to its shadow.',
    stage: 'Emerging',
    activity: 'Learning_and_skills',
    skill: ['Visual Focus', 'Shape Recognition', 'Attention'],
    materials: 'Flashlight or sunlight, objects, paper.',
    howToDoIt:
      'Use light from a window or flashlight to create shadows of objects. Have your child match each item to its shadow.',
    whatItHelpsWith: 'Visual focus, shape recognition, and attention.',
    parentNote:
      "If your child enjoys just watching the light move, that's still learning about patterns and contrast.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Find the Sound',
    description:
      'Make a sound (tap a spoon, jingle keys, shake rice in a bottle) and hide the object. Let your child find the source of the sound.',
    stage: 'Emerging',
    activity: 'Communication',
    skill: ['Auditory Awareness', 'Focus', 'Spatial Understanding'],
    materials: 'Common sound items.',
    howToDoIt:
      'Make a sound (tap a spoon, jingle keys, shake rice in a bottle) and hide the object. Let your child find the source of the sound.',
    whatItHelpsWith: 'Auditory awareness, focus, and spatial understanding.',
    parentNote:
      "If your child follows the sound with their eyes or turns toward it, celebrate — that's connection.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Water Washing Play',
    description:
      'Fill a basin with water and bubbles. Let your child wash toy cups or dishes.',
    stage: 'Emerging',
    activity: 'Daily_Routines',
    skill: ['Sensory Calm', 'Responsibility', 'Fine Motor Skills'],
    materials: 'Basin, soap, towel, plastic items.',
    howToDoIt:
      'Fill a basin with water and bubbles. Let your child wash toy cups or dishes.',
    whatItHelpsWith: 'Sensory calm, responsibility, and fine motor skills.',
    parentNote:
      'Repetitive actions help regulate emotions and teach sequencing naturally.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Shell Sorting',
    description:
      'Collect shells, rocks, or buttons. Sort by size, color, or texture.',
    stage: 'Emerging',
    activity: 'Calm_And_Explorer',
    skill: ['Categorization', 'Attention to Detail', 'Tactile Learning'],
    materials: 'Shells, stones, small containers.',
    howToDoIt:
      'Collect shells, rocks, or buttons. Sort by size, color, or texture. If your child cannot verbally communicate: Let them group by pointing or placing similar objects together.',
    whatItHelpsWith:
      'Categorization, attention to detail, and tactile learning.',
    parentNote:
      'Sorting brings comfort — order helps the brain feel calm and focused.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Animal Walks',
    description:
      'Pretend to move like different animals — crawl like a turtle, hop like a frog, or sway like an elephant.',
    stage: 'Emerging',
    activity: 'Move_and_Play',
    skill: ['Coordination', 'Balance', 'Imagination'],
    materials: 'Open floor space.',
    howToDoIt:
      'Pretend to move like different animals — crawl like a turtle, hop like a frog, or sway like an elephant.',
    whatItHelpsWith: 'Coordination, balance, and imagination.',
    parentNote:
      "Movement-based imitation builds both focus and joy — it's play and learning.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Simple Patterns',
    description:
      'Line up items like bottle caps or fruits in a pattern. Invite your child to continue or make their own pattern.',
    stage: 'Emerging',
    activity: 'Learning_and_skills',
    skill: ['Early Math Reasoning', 'Visual Attention', 'Memory'],
    materials: 'Colored objects, small bowls.',
    howToDoIt:
      'Line up items like bottle caps or fruits in a pattern — red-yellow-red-yellow. Invite your child to continue or make their own pattern. If your child cannot verbally communicate: Let them point to or move the next item in the sequence.',
    whatItHelpsWith: 'Early math reasoning, visual attention, and memory.',
    parentNote:
      "Follow your child's version of the pattern — creativity is part of learning.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Mirror Movements',
    description:
      "Sit face to face and copy each other's movements — lift hands, tilt head, clap softly.",
    stage: 'Emerging',
    activity: 'Communication',
    skill: ['Nonverbal Communication', 'Imitation', 'Social Attention'],
    materials: 'None.',
    howToDoIt:
      "Sit face to face and copy each other's movements — lift hands, tilt head, clap softly.",
    whatItHelpsWith:
      'Nonverbal communication, imitation, and social attention.',
    parentNote:
      "Eye contact isn't required — connection happens through rhythm, movement, and presence.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Bedtime Stretch Routine',
    description:
      'Before bed, do gentle stretches together — reach up, bend down, or sway side to side.',
    stage: 'Emerging',
    activity: 'Daily_Routines',
    skill: ['Relaxation', 'Sensory Awareness', 'Self-Regulation'],
    materials: 'Calm space, soft lighting.',
    howToDoIt:
      'Before bed, do gentle stretches together — reach up, bend down, or sway side to side.',
    whatItHelpsWith: 'Relaxation, sensory awareness, and self-regulation.',
    parentNote:
      'A calm body helps the brain rest. Predictable routines signal safety and comfort.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Rain Rhythms',
    description:
      'Tap fingers or objects to make rain sounds — light taps for drizzle, heavy for thunder.',
    stage: 'Emerging',
    activity: 'Calm_And_Explorer',
    skill: ['Auditory Processing', 'Focus', 'Rhythm'],
    materials: 'Table, spoons, or small containers.',
    howToDoIt:
      'Tap fingers or objects to make rain sounds — light taps for drizzle, heavy for thunder.',
    whatItHelpsWith: 'Auditory processing, focus, and rhythm.',
    parentNote:
      'Your child may listen, copy, or simply feel the vibration — all forms of participation matter.',
    status: 'Pending',
    isAutoPush: true,
  },

  // ========== STAGE 3: GROWING THINKER ==========
  {
    title: 'Kitchen Helper',
    description:
      'Invite your child to help prepare a meal. Let them rinse vegetables, stir, or pass you items.',
    stage: 'Growing',
    activity: 'Daily_Routines',
    skill: ['Sequencing', 'Independence', 'Real-World Learning'],
    materials: 'Bowl, spoon, safe ingredients, towel.',
    howToDoIt:
      'Invite your child to help prepare a meal. Let them rinse vegetables, stir, or pass you items. If your child cannot verbally communicate: Ask them to point to ingredients or match them to a picture card.',
    whatItHelpsWith: 'Sequencing, independence, and real-world learning.',
    parentNote:
      'Cooking builds confidence — your child is learning by watching, feeling, and doing.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Photo Conversations',
    description:
      'Look through family photos together. Pause and notice each one — point, smile, or show interest.',
    stage: 'Growing',
    activity: 'Communication',
    skill: ['Memory', 'Recognition', 'Emotional Connection'],
    materials: 'Printed photos or phone gallery.',
    howToDoIt:
      'Look through family photos together. Pause and notice each one — point, smile, or show interest. If your child cannot verbally communicate: Encourage them to point to familiar faces or objects in the pictures.',
    whatItHelpsWith: 'Memory, recognition, and emotional connection.',
    parentNote:
      "Every glance or touch toward a photo is communication — it says, 'I remember. I care.'",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Calm Jar',
    description:
      'Fill a clear bottle with water, glitter, and a drop of soap. Shake it together and watch the glitter settle slowly.',
    stage: 'Growing',
    activity: 'Calm_And_Explorer',
    skill: ['Emotional Regulation', 'Focus', 'Patience'],
    materials: 'Plastic bottle, glitter, water, soap.',
    howToDoIt:
      'Fill a clear bottle with water, glitter, and a drop of soap. Shake it together and watch the glitter settle slowly.',
    whatItHelpsWith: 'Emotional regulation, focus, and patience.',
    parentNote:
      'The settling glitter mirrors calm — it teaches your child what slowing down feels like.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Daily Choices Board',
    description:
      'Create a simple board with picture options (snack choices, activities, or clothes). Let your child point to what they want each morning.',
    stage: 'Growing',
    activity: 'Learning_and_skills',
    skill: ['Decision-Making', 'Autonomy', 'Communication'],
    materials: 'Paper, printed images, tape.',
    howToDoIt:
      'Create a simple board with picture options (snack choices, activities, or clothes). Let your child point to what they want each morning.',
    whatItHelpsWith: 'Decision-making, autonomy, and communication.',
    parentNote:
      "Choice builds confidence — every 'I choose this' moment helps your child feel capable.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Nature Helper',
    description:
      'Go outdoors and invite your child to help pick up leaves, water plants, or sweep the yard.',
    stage: 'Growing',
    activity: 'Move_and_Play',
    skill: ['Gross Motor Coordination', 'Focus', 'Responsibility'],
    materials: 'Small broom, watering can, gloves.',
    howToDoIt:
      'Go outdoors and invite your child to help pick up leaves, water plants, or sweep the yard. If your child cannot verbally communicate: Model the actions and let them follow your movements.',
    whatItHelpsWith: 'Gross motor coordination, focus, and responsibility.',
    parentNote:
      'Nature offers freedom and structure at once — both are healing for the developing brain.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Feelings Thermometer',
    description:
      'Draw a thermometer with faces or colors to represent calm, okay, and upset. Ask your child to point to how they feel.',
    stage: 'Growing',
    activity: 'Communication',
    skill: ['Emotional Identification', 'Self-Awareness'],
    materials: 'Paper, markers, emotion cards (optional).',
    howToDoIt:
      'Draw a thermometer with faces or colors to represent calm, okay, and upset. Ask your child to point to how they feel. If your child cannot verbally communicate: Let them point, tap, or show the emotion card instead.',
    whatItHelpsWith: 'Emotional identification and self-awareness.',
    parentNote:
      "You're helping your child find language for feelings — even if it's through pictures or touch.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Sensory Sorting Tray',
    description:
      'Fill small bowls with different natural textures — sand, rice, shells, stones. Invite your child to explore and sort by texture or shape.',
    stage: 'Growing',
    activity: 'Calm_And_Explorer',
    skill: ['Sensory Integration', 'Organization', 'Concentration'],
    materials: 'Bowls, natural items.',
    howToDoIt:
      'Fill small bowls with different natural textures — sand, rice, shells, stones. Invite your child to explore and sort by texture or shape.',
    whatItHelpsWith: 'Sensory integration, organization, and concentration.',
    parentNote:
      "If your child prefers one texture, that's okay — repetition means they feel safe and regulated.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'My Morning Routine',
    description:
      "Use pictures to show your child's morning steps — wake up, brush teeth, get dressed, eat breakfast. Let them move a marker or card after each step.",
    stage: 'Growing',
    activity: 'Daily_Routines',
    skill: ['Sequencing', 'Responsibility', 'Time Awareness'],
    materials: 'Routine chart, printed images, Velcro or magnets.',
    howToDoIt:
      "Use pictures to show your child's morning steps — wake up, brush teeth, get dressed, eat breakfast. Let them move a marker or card after each step.",
    whatItHelpsWith: 'Sequencing, responsibility, and time awareness.',
    parentNote:
      "Visual routines reduce stress — they help your child understand what's next without needing words.",
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Match & Measure',
    description:
      'Gather different containers and let your child pour water or sand to see which holds more or less.',
    stage: 'Growing',
    activity: 'Learning_and_skills',
    skill: ['Measurement', 'Focus', 'Early Logic Skills'],
    materials: 'Cups, bowls, water, sand.',
    howToDoIt:
      "Gather different containers and let your child pour water or sand to see which holds more or less. If your child cannot verbally communicate: Ask them to point to 'bigger' or 'smaller' using visual cards or gestures.",
    whatItHelpsWith: 'Measurement, focus, and early logic skills.',
    parentNote:
      'These small experiments teach science and patience through real-life fun.',
    status: 'Pending',
    isAutoPush: true,
  },
  {
    title: 'Carry & Sort',
    description:
      'Set up small tasks like carrying folded towels to a basket, or moving toys from one side of the room to another.',
    stage: 'Growing',
    activity: 'Move_and_Play',
    skill: ['Strength', 'Coordination', 'Independence'],
    materials: 'Towels, toys, laundry basket.',
    howToDoIt:
      'Set up small tasks like carrying folded towels to a basket, or moving toys from one side of the room to another.',
    whatItHelpsWith: 'Strength, coordination, and independence.',
    parentNote:
      "Every task completed builds your child's sense of capability and contribution.",
    status: 'Pending',
    isAutoPush: true,
  },
];

// Automatically assign category images if missing
activities.forEach(act => {
  if (act.activity && !act.files) {
    const url = categoryImages[act.activity as ActivityCategory];
    if (url) {
      act.files = url;
    } else {
      console.warn(
        `⚠️ No image found for category "${act.activity}" → ${act.title}`,
      );
    }
  }
});

export async function seedActivities() {
  try {
    // console.log('🌱 Starting to seed activities...');
    const existingActivityCount = await prisma.article.count();
    if (existingActivityCount > 0) {
      console.log('Activities already exist → skipping seed');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const activity of activities) {
      try {
        await prisma.article.create({
          data: { ...activity, isKept: true },
        });
        successCount++;
        console.log(
          `✅ Created: ${activity.title} (${activity.stage} - ${activity.activity})`,
        );
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Failed to create: ${activity.title}`, error.message);
      }
    }

    console.log(
      `\nSeed finished: ${successCount} created  |  ${errorCount} failed`,
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}
