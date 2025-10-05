/**
 * Test Generator for Evaia Implementation Command
 * 
 * Generates test files and test cases for features.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TestGenerator {
  constructor() {
    this.generatedFiles = [];
  }

  /**
   * Generate unit tests
   * @param {Object} context - Implementation context
   */
  async generateUnitTests(context) {
    try {
      console.log(chalk.blue('🧪 Generating unit tests...'));

      const { feature } = context;
      const featureName = feature.name;
      const className = this.toPascalCase(featureName);

      // Generate unit tests for different components
      await this.generateServiceUnitTests(context);
      await this.generateControllerUnitTests(context);
      await this.generateUtilityUnitTests(context);

      console.log(chalk.green(`✅ Generated unit tests for ${featureName}`));

    } catch (error) {
      console.error(chalk.red(`❌ Error generating unit tests: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate integration tests
   * @param {Object} context - Implementation context
   */
  async generateIntegrationTests(context) {
    try {
      console.log(chalk.blue('🧪 Generating integration tests...'));

      const { feature } = context;
      const featureName = feature.name;

      // Generate API integration tests
      await this.generateAPIIntegrationTests(context);
      
      // Generate database integration tests
      await this.generateDatabaseIntegrationTests(context);

      console.log(chalk.green(`✅ Generated integration tests for ${featureName}`));

    } catch (error) {
      console.error(chalk.red(`❌ Error generating integration tests: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate E2E tests
   * @param {Object} context - Implementation context
   */
  async generateE2ETests(context) {
    try {
      console.log(chalk.blue('🧪 Generating E2E tests...'));

      const { feature } = context;
      const featureName = feature.name;

      // Generate E2E test file
      const e2eTestPath = path.join(process.cwd(), 'src', 'test', 'e2e', `${featureName.toLowerCase()}.e2e.test.ts`);
      const e2eTestContent = this.generateE2ETestContent(feature);

      await this.writeFile(e2eTestPath, e2eTestContent);
      this.generatedFiles.push(e2eTestPath);

      console.log(chalk.green(`✅ Generated E2E tests: ${e2eTestPath}`));

    } catch (error) {
      console.error(chalk.red(`❌ Error generating E2E tests: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate service unit tests
   * @param {Object} context - Implementation context
   */
  async generateServiceUnitTests(context) {
    const { feature } = context;
    const featureName = feature.name;
    const className = this.toPascalCase(featureName);

    // Generate service unit test
    const serviceTestPath = path.join(process.cwd(), 'backend', 'src', 'test', 'services', `${featureName.toLowerCase()}.test.ts`);
    const serviceTestContent = this.generateServiceUnitTestContent(feature, className);

    await this.writeFile(serviceTestPath, serviceTestContent);
    this.generatedFiles.push(serviceTestPath);
  }

  /**
   * Generate controller unit tests
   * @param {Object} context - Implementation context
   */
  async generateControllerUnitTests(context) {
    const { feature } = context;
    const featureName = feature.name;
    const className = this.toPascalCase(featureName);

    // Generate controller unit test
    const controllerTestPath = path.join(process.cwd(), 'backend', 'src', 'test', 'controllers', `${featureName.toLowerCase()}.test.ts`);
    const controllerTestContent = this.generateControllerUnitTestContent(feature, className);

    await this.writeFile(controllerTestPath, controllerTestContent);
    this.generatedFiles.push(controllerTestPath);
  }

  /**
   * Generate utility unit tests
   * @param {Object} context - Implementation context
   */
  async generateUtilityUnitTests(context) {
    const { feature } = context;
    const featureName = feature.name;
    const className = this.toPascalCase(featureName);

    // Generate utility unit test
    const utilityTestPath = path.join(process.cwd(), 'src', 'test', 'utils', `${featureName.toLowerCase()}.test.ts`);
    const utilityTestContent = this.generateUtilityUnitTestContent(feature, className);

    await this.writeFile(utilityTestPath, utilityTestContent);
    this.generatedFiles.push(utilityTestPath);
  }

  /**
   * Generate API integration tests
   * @param {Object} context - Implementation context
   */
  async generateAPIIntegrationTests(context) {
    const { feature } = context;
    const featureName = feature.name;

    // Generate API integration test
    const apiTestPath = path.join(process.cwd(), 'backend', 'src', 'test', 'integration', `${featureName.toLowerCase()}-api.test.ts`);
    const apiTestContent = this.generateAPIIntegrationTestContent(feature);

    await this.writeFile(apiTestPath, apiTestContent);
    this.generatedFiles.push(apiTestPath);
  }

  /**
   * Generate database integration tests
   * @param {Object} context - Implementation context
   */
  async generateDatabaseIntegrationTests(context) {
    const { feature } = context;
    const featureName = feature.name;

    // Generate database integration test
    const dbTestPath = path.join(process.cwd(), 'backend', 'src', 'test', 'integration', `${featureName.toLowerCase()}-database.test.ts`);
    const dbTestContent = this.generateDatabaseIntegrationTestContent(feature);

    await this.writeFile(dbTestPath, dbTestContent);
    this.generatedFiles.push(dbTestPath);
  }

  /**
   * Generate service unit test content
   * @param {Object} feature - Feature specification
   * @param {string} className - Class name
   * @returns {string} Test content
   */
  generateServiceUnitTestContent(feature, className) {
    const featureName = feature.name;
    const kebabName = this.toKebabCase(featureName);

    return `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ${className}Service from '../../services/${featureName.toLowerCase()}.js';

describe('${className}Service', () => {
  let ${featureName.toLowerCase()}Service: ${className}Service;

  beforeEach(() => {
    ${featureName.toLowerCase()}Service = new ${className}Service();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('get${className}', () => {
    it('should return an array of ${featureName} data', async () => {
      const result = await ${featureName.toLowerCase()}Service.get${className}();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Mock error scenario
      vi.spyOn(${featureName.toLowerCase()}Service, 'get${className}').mockRejectedValue(new Error('Database error'));
      
      await expect(${featureName.toLowerCase()}Service.get${className}()).rejects.toThrow('Database error');
    });
  });

  describe('create${className}', () => {
    it('should create a new ${featureName} with valid data', async () => {
      const mockData = {
        name: 'Test ${featureName}',
        description: 'Test description'
      };

      const result = await ${featureName.toLowerCase()}Service.create${className}(mockData);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(mockData.name);
      expect(result.description).toBe(mockData.description);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        description: 'Test description'
      };

      await expect(${featureName.toLowerCase()}Service.create${className}(invalidData)).rejects.toThrow();
    });
  });

  describe('update${className}', () => {
    it('should update existing ${featureName}', async () => {
      const id = 'test-id';
      const updateData = {
        name: 'Updated ${featureName}',
        description: 'Updated description'
      };

      const result = await ${featureName.toLowerCase()}Service.update${className}(id, updateData);
      
      expect(result).toHaveProperty('id', id);
      expect(result.name).toBe(updateData.name);
    });

    it('should return null for non-existent ${featureName}', async () => {
      const id = 'non-existent-id';
      const updateData = { name: 'Updated ${featureName}' };

      const result = await ${featureName.toLowerCase()}Service.update${className}(id, updateData);
      
      expect(result).toBeNull();
    });
  });

  describe('delete${className}', () => {
    it('should delete existing ${featureName}', async () => {
      const id = 'test-id';
      
      const result = await ${featureName.toLowerCase()}Service.delete${className}(id);
      
      expect(result).toBe(true);
    });

    it('should return false for non-existent ${featureName}', async () => {
      const id = 'non-existent-id';
      
      const result = await ${featureName.toLowerCase()}Service.delete${className}(id);
      
      expect(result).toBe(false);
    });
  });
});
`;
  }

  /**
   * Generate controller unit test content
   * @param {Object} feature - Feature specification
   * @param {string} className - Class name
   * @returns {string} Test content
   */
  generateControllerUnitTestContent(feature, className) {
    const featureName = feature.name;
    const kebabName = this.toKebabCase(featureName);

    return `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ${className}Controller from '../../controllers/${featureName.toLowerCase()}.js';
import ${className}Service from '../../services/${featureName.toLowerCase()}.js';

// Mock the service
vi.mock('../../services/${featureName.toLowerCase()}.js');

describe('${className}Controller', () => {
  let ${featureName.toLowerCase()}Controller: ${className}Controller;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: vi.MockedFunction<any>;

  beforeEach(() => {
    ${featureName.toLowerCase()}Controller = new ${className}Controller();
    
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
    
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('get${className}', () => {
    it('should return ${featureName} data with 200 status', async () => {
      const mockData = [{ id: '1', name: 'Test ${featureName}' }];
      vi.spyOn(${className}Service.prototype, 'get${className}').mockResolvedValue(mockData);

      await ${featureName.toLowerCase()}Controller.get${className}(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle service errors with 500 status', async () => {
      const error = new Error('Service error');
      vi.spyOn(${className}Service.prototype, 'get${className}').mockRejectedValue(error);

      await ${featureName.toLowerCase()}Controller.get${className}(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Service error' });
    });
  });

  describe('create${className}', () => {
    it('should create ${featureName} with valid data', async () => {
      const mockData = { name: 'Test ${featureName}', description: 'Test description' };
      const createdData = { id: '1', ...mockData };
      
      mockRequest.body = mockData;
      vi.spyOn(${className}Service.prototype, 'create${className}').mockResolvedValue(createdData);

      await ${featureName.toLowerCase()}Controller.create${className}(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(createdData);
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = { name: '', description: 'Test description' };
      mockRequest.body = invalidData;

      // Mock validation to return error
      vi.doMock('../../validation/${featureName.toLowerCase()}.js', () => ({
        validate${className}: () => ({ isValid: false, errors: [{ field: 'name', message: 'Name is required' }] })
      }));

      await ${featureName.toLowerCase()}Controller.create${className}(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [{ field: 'name', message: 'Name is required' }]
      });
    });
  });

  describe('update${className}', () => {
    it('should update ${featureName} with valid data', async () => {
      const id = 'test-id';
      const updateData = { name: 'Updated ${featureName}' };
      const updatedData = { id, ...updateData };
      
      mockRequest.params = { id };
      mockRequest.body = updateData;
      vi.spyOn(${className}Service.prototype, 'update${className}').mockResolvedValue(updatedData);

      await ${featureName.toLowerCase()}Controller.update${className}(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedData);
    });
  });

  describe('delete${className}', () => {
    it('should delete ${featureName} with 204 status', async () => {
      const id = 'test-id';
      mockRequest.params = { id };
      vi.spyOn(${className}Service.prototype, 'delete${className}').mockResolvedValue(true);

      await ${featureName.toLowerCase()}Controller.delete${className}(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});
`;
  }

  /**
   * Generate utility unit test content
   * @param {Object} feature - Feature specification
   * @param {string} className - Class name
   * @returns {string} Test content
   */
  generateUtilityUnitTestContent(feature, className) {
    const featureName = feature.name;

    return `import { describe, it, expect, beforeEach } from 'vitest';
import ${className}Utils from '../../utils/${featureName.toLowerCase()}.js';

describe('${className}Utils', () => {
  describe('process${className}Data', () => {
    it('should process data correctly', () => {
      const inputData = { name: 'test', value: 123 };
      const result = ${className}Utils.process${className}Data(inputData);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle null input', () => {
      const result = ${className}Utils.process${className}Data(null);
      
      expect(result).toBeDefined();
    });

    it('should handle undefined input', () => {
      const result = ${className}Utils.process${className}Data(undefined);
      
      expect(result).toBeDefined();
    });
  });

  describe('validate${className}Input', () => {
    it('should validate correct input', () => {
      const validInput = { name: 'test', value: 123 };
      const result = ${className}Utils.validate${className}Input(validInput);
      
      expect(result).toBe(true);
    });

    it('should reject invalid input', () => {
      const invalidInput = { name: '', value: -1 };
      const result = ${className}Utils.validate${className}Input(invalidInput);
      
      expect(result).toBe(false);
    });
  });

  describe('format${className}Output', () => {
    it('should format output correctly', () => {
      const inputData = { name: 'test', value: 123 };
      const result = ${className}Utils.format${className}Output(inputData);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
`;
  }

  /**
   * Generate API integration test content
   * @param {Object} feature - Feature specification
   * @returns {string} Test content
   */
  generateAPIIntegrationTestContent(feature) {
    const featureName = feature.name;
    const kebabName = this.toKebabCase(featureName);

    return `import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';

describe('${featureName} API Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    // Start test server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Close test server
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    // Setup test data
  });

  describe('GET /api/${kebabName}', () => {
    it('should return ${featureName} list', async () => {
      const response = await request(app)
        .get('/api/${kebabName}')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/${kebabName}', () => {
    it('should create new ${featureName}', async () => {
      const ${featureName.toLowerCase()}Data = {
        name: 'Test ${featureName}',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/${kebabName}')
        .send(${featureName.toLowerCase()}Data)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(${featureName.toLowerCase()}Data.name);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        description: 'Test description'
      };

      await request(app)
        .post('/api/${kebabName}')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/${kebabName}/:id', () => {
    it('should update existing ${featureName}', async () => {
      // First create a ${featureName}
      const createResponse = await request(app)
        .post('/api/${kebabName}')
        .send({ name: 'Test ${featureName}', description: 'Test description' })
        .expect(201);

      const id = createResponse.body.id;
      const updateData = { name: 'Updated ${featureName}' };

      const response = await request(app)
        .put(\`/api/${kebabName}/\${id}\`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent ${featureName}', async () => {
      const id = 'non-existent-id';
      const updateData = { name: 'Updated ${featureName}' };

      await request(app)
        .put(\`/api/${kebabName}/\${id}\`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/${kebabName}/:id', () => {
    it('should delete existing ${featureName}', async () => {
      // First create a ${featureName}
      const createResponse = await request(app)
        .post('/api/${kebabName}')
        .send({ name: 'Test ${featureName}', description: 'Test description' })
        .expect(201);

      const id = createResponse.body.id;

      await request(app)
        .delete(\`/api/${kebabName}/\${id}\`)
        .expect(204);
    });

    it('should return 404 for non-existent ${featureName}', async () => {
      const id = 'non-existent-id';

      await request(app)
        .delete(\`/api/${kebabName}/\${id}\`)
        .expect(404);
    });
  });
});
`;
  }

  /**
   * Generate database integration test content
   * @param {Object} feature - Feature specification
   * @returns {string} Test content
   */
  generateDatabaseIntegrationTestContent(feature) {
    const featureName = feature.name;
    const className = this.toPascalCase(featureName);

    return `import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import ${className}Service from '../../services/${featureName.toLowerCase()}.js';

describe('${featureName} Database Integration Tests', () => {
  let prisma: PrismaClient;
  let ${featureName.toLowerCase()}Service: ${className}Service;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
        }
      }
    });
    
    ${featureName.toLowerCase()}Service = new ${className}Service();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.${this.toCamelCase(featureName)}.deleteMany();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.${this.toCamelCase(featureName)}.deleteMany();
  });

  describe('Database Operations', () => {
    it('should create ${featureName} in database', async () => {
      const ${featureName.toLowerCase()}Data = {
        name: 'Test ${featureName}',
        description: 'Test description'
      };

      const result = await ${featureName.toLowerCase()}Service.create${className}(${featureName.toLowerCase()}Data);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(${featureName.toLowerCase()}Data.name);

      // Verify in database
      const dbRecord = await prisma.${this.toCamelCase(featureName)}.findUnique({
        where: { id: result.id }
      });

      expect(dbRecord).toBeDefined();
      expect(dbRecord?.name).toBe(${featureName.toLowerCase()}Data.name);
    });

    it('should read ${featureName} from database', async () => {
      // Create test data directly in database
      const dbRecord = await prisma.${this.toCamelCase(featureName)}.create({
        data: {
          name: 'Test ${featureName}',
          description: 'Test description'
        }
      });

      const result = await ${featureName.toLowerCase()}Service.get${className}ById(dbRecord.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(dbRecord.id);
      expect(result?.name).toBe(dbRecord.name);
    });

    it('should update ${featureName} in database', async () => {
      // Create test data
      const dbRecord = await prisma.${this.toCamelCase(featureName)}.create({
        data: {
          name: 'Test ${featureName}',
          description: 'Test description'
        }
      });

      const updateData = {
        name: 'Updated ${featureName}',
        description: 'Updated description'
      };

      const result = await ${featureName.toLowerCase()}Service.update${className}(dbRecord.id, updateData);

      expect(result).toBeDefined();
      expect(result?.name).toBe(updateData.name);

      // Verify in database
      const updatedRecord = await prisma.${this.toCamelCase(featureName)}.findUnique({
        where: { id: dbRecord.id }
      });

      expect(updatedRecord?.name).toBe(updateData.name);
    });

    it('should delete ${featureName} from database', async () => {
      // Create test data
      const dbRecord = await prisma.${this.toCamelCase(featureName)}.create({
        data: {
          name: 'Test ${featureName}',
          description: 'Test description'
        }
      });

      const result = await ${featureName.toLowerCase()}Service.delete${className}(dbRecord.id);

      expect(result).toBe(true);

      // Verify deletion in database
      const deletedRecord = await prisma.${this.toCamelCase(featureName)}.findUnique({
        where: { id: dbRecord.id }
      });

      expect(deletedRecord).toBeNull();
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique constraints', async () => {
      const ${featureName.toLowerCase()}Data = {
        name: 'Unique ${featureName}',
        description: 'Test description'
      };

      // Create first record
      await ${featureName.toLowerCase()}Service.create${className}(${featureName.toLowerCase()}Data);

      // Try to create duplicate (if unique constraint exists)
      // This test would need to be adjusted based on actual schema
      expect(true).toBe(true); // Placeholder
    });

    it('should handle foreign key constraints', async () => {
      // Test foreign key relationships if they exist
      expect(true).toBe(true); // Placeholder
    });
  });
});
`;
  }

  /**
   * Generate E2E test content
   * @param {Object} feature - Feature specification
   * @returns {string} Test content
   */
  generateE2ETestContent(feature) {
    const featureName = feature.name;
    const kebabName = this.toKebabCase(featureName);

    return `import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('${featureName} E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  describe('${featureName} Page', () => {
    it('should load ${featureName} page', async () => {
      await page.goto(\`http://localhost:3000/${kebabName}\`);
      
      const title = await page.textContent('h1');
      expect(title).toContain('${featureName}');
    });

    it('should display ${featureName} list', async () => {
      await page.goto(\`http://localhost:3000/${kebabName}\`);
      
      const list = await page.locator('[data-testid="${kebabName}-list"]');
      await expect(list).toBeVisible();
    });

    it('should create new ${featureName}', async () => {
      await page.goto(\`http://localhost:3000/${kebabName}\`);
      
      // Click create button
      await page.click('[data-testid="create-${kebabName}-button"]');
      
      // Fill form
      await page.fill('[data-testid="${kebabName}-name-input"]', 'Test ${featureName}');
      await page.fill('[data-testid="${kebabName}-description-input"]', 'Test description');
      
      // Submit form
      await page.click('[data-testid="submit-${kebabName}-button"]');
      
      // Verify success
      const successMessage = await page.textContent('[data-testid="success-message"]');
      expect(successMessage).toContain('${featureName} created successfully');
    });

    it('should edit existing ${featureName}', async () => {
      await page.goto(\`http://localhost:3000/${kebabName}\`);
      
      // Click edit button for first item
      await page.click('[data-testid="edit-${kebabName}-button"]:first-child');
      
      // Update form
      await page.fill('[data-testid="${kebabName}-name-input"]', 'Updated ${featureName}');
      
      // Submit form
      await page.click('[data-testid="submit-${kebabName}-button"]');
      
      // Verify success
      const successMessage = await page.textContent('[data-testid="success-message"]');
      expect(successMessage).toContain('${featureName} updated successfully');
    });

    it('should delete ${featureName}', async () => {
      await page.goto(\`http://localhost:3000/${kebabName}\`);
      
      // Click delete button for first item
      await page.click('[data-testid="delete-${kebabName}-button"]:first-child');
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify success
      const successMessage = await page.textContent('[data-testid="success-message"]');
      expect(successMessage).toContain('${featureName} deleted successfully');
    });
  });

  describe('${featureName} API Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      await page.route('**/api/${kebabName}**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto(\`http://localhost:3000/${kebabName}\`);
      
      // Verify error message is displayed
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('Error loading ${featureName}');
    });
  });
});
`;
  }

  /**
   * Convert string to kebab-case
   * @param {string} str - Input string
   * @returns {string} kebab-case string
   */
  toKebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  /**
   * Convert string to camelCase
   * @param {string} str - Input string
   * @returns {string} camelCase string
   */
  toCamelCase(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Convert string to PascalCase
   * @param {string} str - Input string
   * @returns {string} PascalCase string
   */
  toPascalCase(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Write file with directory creation
   * @param {string} filePath - File path
   * @param {string} content - File content
   */
  async writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  }
}