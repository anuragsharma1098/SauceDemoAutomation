import { ENV } from '../config/env.config';

/**
 * Login test data for SauceDemo authentication scenarios.
 *
 * This file centralizes reusable login inputs and expected error messages
 * for positive, negative, and edge-case login tests.
 */

/** Valid credentials for the standard user account. */
export const VALID_CREDENTIALS = {
  username: ENV.credentials.standardUser.username,
  password: ENV.credentials.standardUser.password,
};

/**
 * Invalid credential combinations and the expected login error message.
 *
 * Tests can iterate this array to validate application behavior when the
 * username or password is incorrect.
 */
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

/**
 * Empty-field login cases.
 *
 * These cases verify required-field validation and ensure the correct error
 * message is displayed when username and/or password fields are blank.
 */
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

/**
 * Locked-out user credentials and expected error.
 *
 * This case covers the locked user scenario where the account is disabled by
 * the application and the login attempt should be rejected.
 */
export const LOCKED_USER = {
  username: ENV.credentials.lockedOutUser.username,
  password: ENV.credentials.lockedOutUser.password,
  expectedError: 'Sorry, this user has been locked out',
};
