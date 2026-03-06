/**
 * Integration Test Suite
 * Tests for end-to-end workflows across multiple components
 */

import { mockDb, utils, userService, authService } from './mocks';

describe('Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 1: Full user creation flow
  test('should complete full user creation workflow', async () => {
    const userData = {
      name: 'Integration User',
      email: 'integration@example.com',
      password: 'password123'
    };
    
    // Validate email
    expect(utils.validateEmail(userData.email)).toBe(true);
    
    // Hash password
    const hashedPassword = utils.hashPassword(userData.password);
    expect(hashedPassword).toContain('hashed_');
    
    // Create user in database
    const createdUser = { id: 10, ...userData, password: hashedPassword };
    mockDb.findUserByEmail.mockResolvedValue(null);
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const user = await userService.createUser(userData);
    
    expect(user).toBeDefined();
    expect(user.id).toBe(10);
  });
  
  // Test 2: Full authentication flow
  test('should complete full authentication workflow', async () => {
    const email = 'test@example.com';
    const password = 'testPassword123';
    const hashedPassword = utils.hashPassword(password);
    
    const mockUser = {
      id: 5,
      name: 'Test User',
      email: email,
      password: hashedPassword
    };
    
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    const loginResult = await authService.login(email, password);
    
    expect(loginResult).toHaveProperty('user');
    expect(loginResult).toHaveProperty('token');
    expect(loginResult.user.email).toBe(email);
    
    // Verify token
    const tokenVerification = authService.verifyToken(loginResult.token);
    expect(tokenVerification.valid).toBe(true);
  });
  
  // Test 3: Complete CRUD operation flow
  test('should handle complete CRUD operations', async () => {
    // CREATE
    const newUser = {
      name: 'CRUD User',
      email: 'crud@example.com',
      password: 'password123'
    };
    const createdUser = { id: 20, ...newUser, password: 'hashed_password123' };
    mockDb.createUser.mockResolvedValue(createdUser);
    mockDb.findUserByEmail.mockResolvedValue(null);
    
    const created = await userService.createUser(newUser);
    expect(created.id).toBe(20);
    
    // READ
    mockDb.getUserById.mockResolvedValue(createdUser);
    const retrieved = await userService.getUserById(20);
    expect(retrieved).toEqual(createdUser);
    
    // UPDATE
    const updateData = { name: 'CRUD User Updated' };
    const updatedUser = { ...createdUser, ...updateData };
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    const updated = await userService.updateUser(20, updateData);
    expect(updated.name).toBe('CRUD User Updated');
    
    // DELETE
    mockDb.deleteUser.mockResolvedValue(true);
    const deleted = await userService.deleteUser(20);
    expect(deleted).toHaveProperty('message');
  });
  
  // Test 4: Error handling across layers
  test('should properly handle errors across all layers', async () => {
    // Service layer error
    mockDb.getUserById.mockResolvedValue(null);
    await expect(userService.getUserById(999))
      .rejects.toThrow('User not found');
    
    // Validation error
    await expect(userService.createUser({ email: 'invalid', password: 'pass' }))
      .rejects.toThrow('Invalid email');
    
    // Auth error
    mockDb.findUserByEmail.mockResolvedValue(null);
    await expect(authService.login('test@example.com', 'wrong'))
      .rejects.toThrow('Invalid credentials');
  });
  
  // Test 5: User registration and immediate login
  test('should register user and login immediately', async () => {
    const userData = {
      name: 'Complete Flow User',
      email: 'complete@example.com',
      password: 'password123'
    };
    
    // Register
    const hashedPassword = utils.hashPassword(userData.password);
    const createdUser = { id: 30, ...userData, password: hashedPassword };
    mockDb.findUserByEmail.mockResolvedValueOnce(null); // For registration check
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const registeredUser = await authService.register(userData);
    expect(registeredUser).toBeDefined();
    
    // Login
    mockDb.findUserByEmail.mockResolvedValueOnce(createdUser); // For login
    const loginResult = await authService.login(userData.email, userData.password);
    
    expect(loginResult.user.id).toBe(30);
    expect(loginResult.token).toBeTruthy();
  });
});
