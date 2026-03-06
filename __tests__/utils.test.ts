/**
 * Utility Functions Test Suite
 * Tests for helper utilities: capitalize, validateEmail, sanitizeInput, etc.
 */

import { utils } from './mocks';

describe('Utility Functions', () => {
  
  // Test 1: capitalize() - positive case
  test('capitalize() should capitalize first letter of string', () => {
    expect(utils.capitalize('hello')).toBe('Hello');
    expect(utils.capitalize('WORLD')).toBe('World');
  });
  
  // Test 2: capitalize() - negative case
  test('capitalize() should handle empty string', () => {
    expect(utils.capitalize('')).toBe('');
  });
  
  // Test 3: validateEmail() - positive case
  test('validateEmail() should return true for valid email', () => {
    expect(utils.validateEmail('test@example.com')).toBe(true);
    expect(utils.validateEmail('user.name@domain.co.uk')).toBe(true);
  });
  
  // Test 4: validateEmail() - negative case
  test('validateEmail() should return false for invalid email', () => {
    expect(utils.validateEmail('invalid')).toBe(false);
    expect(utils.validateEmail('test@')).toBe(false);
    expect(utils.validateEmail('@example.com')).toBe(false);
  });
  
  // Test 5: sanitizeInput() - positive case
  test('sanitizeInput() should remove dangerous characters', () => {
    expect(utils.sanitizeInput('<script>alert()</script>')).toBe('scriptalert()/script');
    expect(utils.sanitizeInput('  hello world  ')).toBe('hello world');
  });
  
  // Test 6: generateToken() - positive case
  test('generateToken() should generate a random token', () => {
    const token1 = utils.generateToken();
    const token2 = utils.generateToken();
    
    expect(token1).toBeTruthy();
    expect(token1.length).toBeGreaterThan(0);
    expect(token1).not.toBe(token2); // Should be different
  });
  
  // Test 7: hashPassword() - positive case
  test('hashPassword() should hash password', () => {
    const password = 'mySecurePassword123';
    const hashed = utils.hashPassword(password);
    
    expect(hashed).toBeTruthy();
    expect(hashed).not.toBe(password);
    expect(hashed).toContain('hashed_');
  });
  
  // Test 8: comparePasswords() - positive case
  test('comparePasswords() should return true for matching passwords', () => {
    const password = 'testPassword';
    const hashed = utils.hashPassword(password);
    
    expect(utils.comparePasswords(password, hashed)).toBe(true);
  });
  
  // Test 9: comparePasswords() - negative case
  test('comparePasswords() should return false for non-matching passwords', () => {
    const password = 'testPassword';
    const wrongPassword = 'wrongPassword';
    const hashed = utils.hashPassword(password);
    
    expect(utils.comparePasswords(wrongPassword, hashed)).toBe(false);
  });
});
