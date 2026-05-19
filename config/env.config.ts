import * as dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
  credentials: {
    standardUser: {
      username: process.env.STANDARD_USER || 'standard_user',
      password: process.env.PASSWORD || 'secret_sauce',
    },
    lockedOutUser: {
      username: process.env.LOCKED_OUT_USER || 'locked_out_user',
      password: process.env.PASSWORD || 'secret_sauce',
    },
    problemUser: {
      username: process.env.PROBLEM_USER || 'problem_user',
      password: process.env.PASSWORD || 'secret_sauce',
    },
    performanceGlitchUser: {
      username: process.env.PERFORMANCE_GLITCH_USER || 'performance_glitch_user',
      password: process.env.PASSWORD || 'secret_sauce',
    },
  },
};
