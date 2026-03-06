/**
 * Auth Controller Test Suite
 * Tests for authentication HTTP endpoints
 */

import { Request, Response } from 'express';
import { mockDb } from './mocks';
import { authController } from './controllers/auth.controller.mock';

describe('Auth Controller', () => {
  
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
  
  // Test 1: POST login - positive case
  test('POST /auth/login should login user successfully', async () => {
    const mockUser = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      password: 'hashed_password123'
    };
    mockRequest.body = { email: 'john@example.com', password: 'password123' };
    mockDb.findUserByEmail.mockResolvedValue(mockUser);
    
    await authController.login(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.any(Object),
        token: expect.any(String)
      })
    );
  });
  
  // Test 2: POST login - negative case (invalid credentials)
  test('POST /auth/login should return 401 for invalid credentials', async () => {
    mockRequest.body = { email: 'wrong@example.com', password: 'wrongpass' };
    mockDb.findUserByEmail.mockResolvedValue(null);
    
    await authController.login(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  
  // Test 3: POST register - positive case
  test('POST /auth/register should register new user successfully', async () => {
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    };
    const createdUser = { id: 3, ...userData, password: 'hashed_password123' };
    
    mockRequest.body = userData;
    mockDb.findUserByEmail.mockResolvedValue(null);
    mockDb.createUser.mockResolvedValue(createdUser);
    
    await authController.register(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
  });
  
  // Test 4: POST register - negative case (user exists)
  test('POST /auth/register should return 400 when user exists', async () => {
    const userData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123'
    };
    const existingUser = { id: 1, ...userData };
    
    mockRequest.body = userData;
    mockDb.findUserByEmail.mockResolvedValue(existingUser);
    
    await authController.register(
      mockRequest as Request,
      mockResponse as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
