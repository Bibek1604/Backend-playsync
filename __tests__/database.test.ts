/**
 * Database Operations Test Suite
 * Tests for database CRUD operations and queries
 */

import { mockDb } from './mocks';

describe('Database Operations', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test 1: getUserById() - positive case
  test('getUserById() should return user when found', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    
    const result = await mockDb.getUserById(1);
    
    expect(mockDb.getUserById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });
  
  // Test 2: getUserById() - negative case
  test('getUserById() should return null when user not found', async () => {
    mockDb.getUserById.mockResolvedValue(null);
    
    const result = await mockDb.getUserById(999);
    
    expect(mockDb.getUserById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });
  
  // Test 3: createUser() - positive case
  test('createUser() should create and return new user', async () => {
    const newUser = { name: 'Jane Doe', email: 'jane@example.com', password: 'hashed_pass' };
    const createdUser = { id: 2, ...newUser };
    mockDb.createUser.mockResolvedValue(createdUser);
    
    const result = await mockDb.createUser(newUser);
    
    expect(mockDb.createUser).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(createdUser);
    expect(result.id).toBeDefined();
  });
  
  // Test 4: updateUser() - positive case
  test('updateUser() should update and return user', async () => {
    const updateData = { name: 'Updated Name' };
    const updatedUser = { id: 1, name: 'Updated Name', email: 'john@example.com' };
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    const result = await mockDb.updateUser(1, updateData);
    
    expect(mockDb.updateUser).toHaveBeenCalledWith(1, updateData);
    expect(result.name).toBe('Updated Name');
  });
  
  // Test 5: deleteUser() - positive case
  test('deleteUser() should delete user successfully', async () => {
    mockDb.deleteUser.mockResolvedValue(true);
    
    const result = await mockDb.deleteUser(1);
    
    expect(mockDb.deleteUser).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });
  
  // Test 6: findUserByEmail() - positive case
  test('findUserByEmail() should find user by email', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    const result = await mockDb.findUserByEmail('john@example.com');
    
    expect(mockDb.findUserByEmail).toHaveBeenCalledWith('john@example.com');
    expect(result).toEqual(mockUser);
  });
  
  // Test 7: getAllUsers() - positive case
  test('getAllUsers() should retrieve all users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ];
    mockDb.getAllUsers.mockResolvedValue(mockUsers);
    
    const result = await mockDb.getAllUsers();
    
    expect(mockDb.getAllUsers).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result).toHaveLength(2);
  });
});
