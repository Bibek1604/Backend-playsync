/**
 * User Controller Test Suite
 * Tests for user HTTP endpoints and request/response handling
 */

import { Request, Response } from 'express';
import { mockDb } from './mocks';
import { userController } from './controllers/user.controller.mock';

describe('User Controller', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });
  
  // Test 1: GET user by ID - positive case
  test('GET /users/:id should return user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockRequest.params = { id: '1' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    
    await userController.getUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
  });
  
  // Test 2: GET user by ID - negative case (not found)
  test('GET /users/:id should return 404 when user not found', async () => {
    mockRequest.params = { id: '999' };
    mockDb.getUserById.mockResolvedValue(null);
    
    await userController.getUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  
  // Test 3: POST create user - positive case
  test('POST /users should create user successfully', async () => {
    const userData = { 
      name: 'Jane Doe', 
      email: 'jane@example.com', 
      password: 'password123' 
    };
    const createdUser = { id: 2, ...userData, password: 'hashed_password123' };
    
    mockRequest.body = userData;
    mockDb.createUser.mockResolvedValue(createdUser);
    
    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
  });
  
  // Test 4: POST create user - negative case (invalid email)
  test('POST /users should return 400 for invalid email', async () => {
    mockRequest.body = { 
      name: 'Jane Doe', 
      email: 'invalid-email', 
      password: 'password123' 
    };
    
    await userController.createUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  
  // Test 5: PUT update user - positive case
  test('PUT /users/:id should update user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    const updateData = { name: 'John Updated' };
    const updatedUser = { ...mockUser, ...updateData };
    
    mockRequest.params = { id: '1' };
    mockRequest.body = updateData;
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.updateUser.mockResolvedValue(updatedUser);
    
    await userController.updateUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
  });
  
  // Test 6: PUT update user - negative case
  test('PUT /users/:id should return 404 when user not found', async () => {
    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'Updated Name' };
    mockDb.getUserById.mockResolvedValue(null);
    
    await userController.updateUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
  
  // Test 7: DELETE user - positive case
  test('DELETE /users/:id should delete user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockRequest.params = { id: '1' };
    mockDb.getUserById.mockResolvedValue(mockUser);
    mockDb.deleteUser.mockResolvedValue(true);
    
    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
  
  // Test 8: DELETE user - negative case
  test('DELETE /users/:id should return 404 when user not found', async () => {
    mockRequest.params = { id: '999' };
    mockDb.getUserById.mockResolvedValue(null);
    
    await userController.deleteUser(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
  
  // Test 9: GET all users - positive case
  test('GET /users should return all users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ];
    mockDb.getAllUsers.mockResolvedValue(mockUsers);
    
    await userController.getAllUsers(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
  });
});
