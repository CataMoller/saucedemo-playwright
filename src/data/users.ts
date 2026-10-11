const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: {
    username: process.env.SAUCE_STANDARD_USER ?? 'standard_user',
    password,
  },
  performanceGlitch: {
    username: process.env.SAUCE_PERFORMANCE_USER ?? 'performance_glitch_user',
    password,
  },
} as const;
