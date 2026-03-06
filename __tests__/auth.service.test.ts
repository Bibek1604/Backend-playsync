/**
 * Auth Service Test Suite
 * Tests for authentication and authorization logic
 */

import { mockDb, authService } from './mocks';

describe('Auth Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 1: login() - positive case
  test('should login user with valid credentials', async () => {
    const mockUser = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      password: 'hashed_password123'
    };
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    const result = await authService.login('john@example.com', 'password123');
    
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result.user).toEqual(mockUser);
  });
  
  // Test 2: login() - negative case (invalid credentials)
  test('should throw error for invalid credentials', async () => {
    mockDb.findUserByEmail.mockResolvedValue(null);
    
    await expect(authService.login('wrong@example.com', 'password'))
      .rejects.toThrow('Invalid credentials');
  });
  
  // Test 3: login() - negative case (missing fields)
  test('should throw error when email or password is missing', async () => {
    await expect(authService.login('', 'password'))
      .rejects.toThrow('Email and password are required');
  });
  
  // Test 4: register() - positive case
  test('should register new user successfully', async () => {
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    };
    const createdUser = { id: 3, ...userData, password: 'hashed_password123' };
    
    mockDb.findUserByEmail.mockResolvedValue(null);
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const result = await authService.register(userData);
    
    expect(result).toBeDefined();
    expect(mockDb.findUserByEmail).toHaveBeenCalledWith(userData.email);
  });
  
  // Test 5: register() - negative case (user exists)
  test('should throw error when user already exists', async () => {
    const userData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123'
    };
    const existingUser = { id: 1, ...userData };
    
    mockDb.findUserByEmail.mockResolvedValue(existingUser);
    
    await expect(authService.register(userData))
      .rejects.toThrow('User already exists');
  });
  
  // Test 6: verifyToken() - positive case
  test('should verify valid token', () => {
    const token = 'validtoken1234567890';
    
    const result = authService.verifyToken(token);
    
    expect(result).toHaveProperty('valid', true);
    expect(result).toHaveProperty('userId');
  });
  
  // Test 7: verifyToken() - negative case
  test('should throw error for invalid token', () => {
    const invalidToken = 'short';
    
    expect(() => authService.verifyToken(invalidToken))
      .toThrow('Invalid token');
  });
});
