/**
 * User Service Test Suite
 * Tests for user business logic and service layer operations
 */

import { mockDb, userService } from './mocks';

describe('User Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 1: getUserById() - positive case
  test('should retrieve user by ID successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    
    const result = await userService.getUserById(1);
    
    expect(result).toEqual(mockUser);
    expect(mockDb.getUserById).toHaveBeenCalledWith(1);
  });
  
  // Test 2: getUserById() - negative case
  test('should throw error when user not found', async () => {
    mockDb.getUserById.mockResolvedValue(null);
    
    await expect(userService.getUserById(999)).rejects.toThrow('User not found');
  });
  
  // Test 3: createUser() - positive case
  test('should create user with valid data', async () => {
    const userData = { 
      name: 'Jane Doe', 
      email: 'jane@example.com', 
      password: 'password123' 
    };
    const createdUser = { id: 2, ...userData, password: 'hashed_password123' };
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const result = await userService.createUser(userData);
    
    expect(result).toBeDefined();
    expect(mockDb.createUser).toHaveBeenCalled();
  });
  
  // Test 4: createUser() - negative case
  test('should throw error for invalid email', async () => {
    const userData = { 
      name: 'Jane Doe', 
      email: 'invalid-email', 
      password: 'password123' 
    };
    
    await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');
  });
  
  // Test 5: updateUser() - positive case
  test('should update user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    const updateData = { name: 'John Updated' };
    const updatedUser = { ...mockUser, ...updateData };
    
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    const result = await userService.updateUser(1, updateData);
    
    expect(result.name).toBe('John Updated');
    expect(mockDb.updateUser).toHaveBeenCalledWith(1, updateData);
  });
  
  // Test 6: deleteUser() - positive case
  test('should delete user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.deleteUser.mockResolvedValue(true);
    
    const result = await userService.deleteUser(1);
    
    expect(result).toEqual({ message: 'User deleted successfully' });
    expect(mockDb.deleteUser).toHaveBeenCalledWith(1);
  });
  
  // Test 7: getAllUsers() - positive case
  test('should retrieve all users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ];
    mockDb.getAllUsers.mockResolvedValue(mockUsers);
    
    const result = await userService.getAllUsers();
    
    expect(result).toEqual(mockUsers);
    expect(result).toHaveLength(2);
  });
});
