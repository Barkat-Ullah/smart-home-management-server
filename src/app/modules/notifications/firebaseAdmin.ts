import admin from 'firebase-admin';

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'mawaddah-match-6e449',
      clientEmail:
        'firebase-adminsdk-fbsvc@mawaddah-match-6e449.iam.gserviceaccount.com',
      privateKey:
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCWoubhwIU36FMv\n8l5zsYPXQrj/YHb8RF6x6Emnahsc2jksXKuSX9Gq3J1FH1vuJdwSCCmvv84IlPu9\ncQdadlXac9THUwt5+O62v5pDiYU8JPL9HSDJ7/d2gduaffEf5+QOW0H2KrKeIx9O\nID0F7rNYTACNg+QP8qXPUlWv5/LLqvhbzVkZlKpTyY8Dt7JFJ5/6EjtOFTsu2J3a\njZ9UfuzmeSdhHRnGTl1B95PzYcNtrL2Js4PP9WPsWLsdFOfT7Jr6r2Amwuxq8T15\nUnttwuVJM8rpIAGEJ+35Lu5ecEwoUWuuPD5/gepHJ58lYynrGpK/RLAScfTY9qh7\n1zzUZHKjAgMBAAECggEAH0l+gu0lvlL21EKW85ivNYqaOhCjJgpdUL5abfdP4lJB\nBcHJsQFN3xsrXywAQBqE9wnS/rnr5URsdRCA4n0pn9HnI+9PtunJSxPIyrZJghB6\nl6/xG4BH+clG/3OhHWtgpsq1jJeZuda5rdRsWEsX3QMMKlh2iglv/vuu6HZYq4xp\nl+pcD8FhG+R+GIeFvE/iXkOvx5D3XpV32ekya5CwQQVUM1vp468WC7dul4OEHa4V\nCnM/AZyt4fa6/kx+VAHPf0ISYSlkkJ0HDs1qEu8eFET/qFTK98pK7bvIDicblMbn\n9mj9IDIT3wGxYtIXl3m8gZ9XJltZYOvGUZzDCp2PAQKBgQDNopPxJtTdSDTNxKVo\n2JTjE1lIZEvr+OPzVuEQmpUxQ1OMwtV7svF21YOpyuy6sswu7DvFuj0wU4DOqM5J\nW/LEmvSQ5aFhkr//hmYwBm5Bx0Rt1NSaokDAUPv6Ju4GCx7NKIdFJxSQomYm3poT\nudCHazKlOsjuY2UCuENWoOu9oQKBgQC7h+Avtp17GSrL/BabgC1bEJXt9lXa14d2\n/roXoFozqyqfCzUWhddWnFhWgXy23BYkrzdR92ievzK0nakn0zl9SMF5W9dV2LBi\nD7nzYXDBO+pTH8vA60hljP2ouh63CHacd2VRCeeEzcz46AIjoPo6W5icOckTxPzc\ngPF4YVlhwwKBgDumlKnYrNj/8ClciOsQIKh6XWTti0SJb36QTjtlzC99K0hi4FDA\nyODC8S2Y6vEBms9lwbUK4GMbZfsM5sJLBPJZTOaXZigKzN1P3GbEBsnYBxahLYcp\n2ASxuVaIYnWoVigHQK4jtwh5w4409pcQSNhvlUJu+giFFrEiSI5hoeDhAoGAf3mE\njkp/UD8yVUj+ASQnMKDcmc56W/FoVx4eV5Mb3cV7inMu2imO0IQklGEe6po+vx8P\n5rrcNhTYHeiSJM0zZhN/2MPyY5uRgocYKvXQlLnqtiiF85S8OLOXdgtWd6rcHc4X\nY/fsldzjeUsUsS1rCyJaYc/x/GtKS4WnHuJlxMsCgYEAsF7AY4CtuPHUVrsEfn6G\n6MqdTxYAEYVkIlIAcU3ZgwCT3KS2a/rgygKEGVjo/ILuAyJY2OGuBWE7pbnemCGP\nFIyzPHAuk5yP17aUBvbH04tBbt8Di5LKCDGWIUjAQQgppOkfJa8Y/hbBSWx7m+uE\nu05Sbt0iIrT+t0RNFNXvmhk=\n-----END PRIVATE KEY-----\n',
    }),
  });

  console.log('Firebase Admin SDK initialized successfully!');
} catch (error: any) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
}

export default admin;
