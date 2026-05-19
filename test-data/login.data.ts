import { ENV } from '../config/env.config';

export const VALID_CREDENTIALS = {
  username: ENV.credentials.standardUser.username,
  password: ENV.credentials.standardUser.password,
};

export const INVALID_CREDENTIALS_CASES = [
  {
    description: 'wrong username, correct password',
    username: 'invalid_user',
    password: ENV.credentials.standardUser.password,
    expectedError: 'Username and password do not match any user in this service',
  },
  {
    description: 'correct username, wrong password',
    username: ENV.credentials.standardUser.username,
    password: 'wrong_password',
    expectedError: 'Username and password do not match any user in this service',
  },
  {
    description: 'both wrong',
    username: 'bad_user',
    password: 'bad_pass',
    expectedError: 'Username and password do not match any user in this service',
  },
];

export const EMPTY_FIELD_CASES = [
  {
    description: 'empty username',
    username: '',
    password: ENV.credentials.standardUser.password,
    expectedError: 'Username is required',
  },
  {
    description: 'empty password',
    username: ENV.credentials.standardUser.username,
    password: '',
    expectedError: 'Password is required',
  },
  {
    description: 'both fields empty',
    username: '',
    password: '',
    expectedError: 'Username is required',
  },
];

export const LOCKED_USER = {
  username: ENV.credentials.lockedOutUser.username,
  password: ENV.credentials.lockedOutUser.password,
  expectedError: 'Sorry, this user has been locked out',
};
