/**
 * Template Manager for Evaia Implementation Command
 * 
 * Manages Evaia-specific code templates and template inheritance.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateManager {
  constructor() {
    this.templatesDirectory = path.join(process.cwd(), 'docs', 'templates');
    this.templateCache = new Map();
    this.templateRegistry = new Map();
    this.initializeTemplates();
  }

  /**
   * Initialize available templates
   */
  initializeTemplates() {
    this.templateRegistry.set('api-endpoint', {
      name: 'API Endpoint Template',
      description: 'Template for REST API endpoints',
      files: ['controller.ts', 'service.ts', 'routes.ts', 'types.ts', 'validation.ts'],
      category: 'backend'
    });

    this.templateRegistry.set('component', {
      name: 'React Component Template',
      description: 'Template for React components',
      files: ['index.tsx', 'types.ts', 'styles.css', 'test.tsx'],
      category: 'frontend'
    });

    this.templateRegistry.set('service', {
      name: 'Service Template',
      description: 'Template for service classes',
      files: ['index.ts', 'types.ts', 'test.ts'],
      category: 'shared'
    });

    this.templateRegistry.set('page', {
      name: 'Page Template',
      description: 'Template for page components',
      files: ['index.tsx', 'types.ts', 'styles.css', 'test.tsx'],
      category: 'frontend'
    });

    this.templateRegistry.set('hook', {
      name: 'Custom Hook Template',
      description: 'Template for custom React hooks',
      files: ['index.ts', 'types.ts', 'test.ts'],
      category: 'frontend'
    });

    this.templateRegistry.set('ai-service', {
      name: 'AI Service Template',
      description: 'Template for AI service integration',
      files: ['index.ts', 'types.ts', 'config.ts', 'test.ts'],
      category: 'ai'
    });

    this.templateRegistry.set('workflow', {
      name: 'Workflow Template',
      description: 'Template for workflow automation',
      files: ['index.ts', 'types.ts', 'steps.ts', 'test.ts'],
      category: 'automation'
    });
  }

  /**
   * Get template for feature
   * @param {Object} featureSpec - Feature specification
   * @param {string} templateName - Template name (optional)
   * @returns {Object} Template configuration
   */
  async getTemplate(featureSpec, templateName = null) {
    try {
      // Determine template based on feature type or provided name
      const templateKey = templateName || this.detectTemplateType(featureSpec);
      
      if (!this.templateRegistry.has(templateKey)) {
        console.log(chalk.yellow(`⚠️  Template ${templateKey} not found, using default`));
        return this.getDefaultTemplate(featureSpec);
      }

      const templateConfig = this.templateRegistry.get(templateKey);
      
      // Load template files
      const template = await this.loadTemplate(templateKey, featureSpec);
      
      return {
        ...templateConfig,
        ...template,
        key: templateKey
      };

    } catch (error) {
      console.error(chalk.red(`Error getting template: ${error.message}`));
      return this.getDefaultTemplate(featureSpec);
    }
  }

  /**
   * Detect template type from feature specification
   * @param {Object} featureSpec - Feature specification
   * @returns {string} Template type
   */
  detectTemplateType(featureSpec) {
    const featureType = featureSpec.type?.toLowerCase();
    const featureName = featureSpec.name?.toLowerCase();

    // AI-related features
    if (featureType === 'ai' || featureName?.includes('ai') || featureName?.includes('intelligence')) {
      return 'ai-service';
    }

    // Workflow/automation features
    if (featureType === 'workflow' || featureName?.includes('workflow') || featureName?.includes('automation')) {
      return 'workflow';
    }

    // API features
    if (featureType === 'api' || featureName?.includes('api') || featureName?.includes('endpoint')) {
      return 'api-endpoint';
    }

    // Component features
    if (featureType === 'component' || featureName?.includes('component') || featureName?.includes('ui')) {
      return 'component';
    }

    // Page features
    if (featureType === 'page' || featureName?.includes('page') || featureName?.includes('view')) {
      return 'page';
    }

    // Service features
    if (featureType === 'service' || featureName?.includes('service') || featureName?.includes('integration')) {
      return 'service';
    }

    // Default to component template
    return 'component';
  }

  /**
   * Get default template
   * @param {Object} featureSpec - Feature specification
   * @returns {Object} Default template
   */
  getDefaultTemplate(featureSpec) {
    return {
      name: 'Default Template',
      description: 'Default implementation template',
      files: ['index.ts', 'types.ts', 'test.ts'],
      category: 'shared',
      key: 'default'
    };
  }

  /**
   * Load template files
   * @param {string} templateKey - Template key
   * @param {Object} featureSpec - Feature specification
   * @returns {Object} Loaded template
   */
  async loadTemplate(templateKey, featureSpec) {
    try {
      // Check cache first
      if (this.templateCache.has(templateKey)) {
        return this.templateCache.get(templateKey);
      }

      const templatePath = path.join(this.templatesDirectory, `${templateKey}-template.md`);
      
      try {
        const content = await fs.readFile(templatePath, 'utf-8');
        const template = this.parseTemplateFile(content, featureSpec);
        
        // Cache the template
        this.templateCache.set(templateKey, template);
        
        return template;
      } catch (error) {
        // Template file doesn't exist, generate from registry
        return this.generateTemplateFromRegistry(templateKey, featureSpec);
      }

    } catch (error) {
      console.error(chalk.red(`Error loading template: ${error.message}`));
      return this.generateTemplateFromRegistry(templateKey, featureSpec);
    }
  }

  /**
   * Parse template file content
   * @param {string} content - Template file content
   * @param {Object} featureSpec - Feature specification
   * @returns {Object} Parsed template
   */
  parseTemplateFile(content, featureSpec) {
    const lines = content.split('\n');
    const template = {
      files: {},
      variables: {},
      patterns: {}
    };

    let currentFile = null;
    let inCodeBlock = false;
    let codeContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // File section header
      if (trimmedLine.startsWith('### ')) {
        if (currentFile && codeContent.length > 0) {
          template.files[currentFile] = codeContent.join('\n');
        }
        currentFile = trimmedLine.substring(4).replace('.md', '');
        codeContent = [];
        inCodeBlock = false;
      }
      // Code block start
      else if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && codeContent.length > 0) {
          template.files[currentFile] = codeContent.join('\n');
          codeContent = [];
        }
      }
      // Code content
      else if (inCodeBlock && currentFile) {
        codeContent.push(line);
      }
      // Variable definition
      else if (trimmedLine.startsWith('{{') && trimmedLine.endsWith('}}')) {
        const varName = trimmedLine.slice(2, -2);
        template.variables[varName] = this.getVariableValue(varName, featureSpec);
      }
    }

    // Add last file if exists
    if (currentFile && codeContent.length > 0) {
      template.files[currentFile] = codeContent.join('\n');
    }

    return template;
  }

  /**
   * Generate template from registry
   * @param {string} templateKey - Template key
   * @param {Object} featureSpec - Feature specification
   * @returns {Object} Generated template
   */
  generateTemplateFromRegistry(templateKey, featureSpec) {
    const templateConfig = this.templateRegistry.get(templateKey);
    const template = {
      files: {},
      variables: this.generateTemplateVariables(featureSpec),
      patterns: this.generateTemplatePatterns(templateKey)
    };

    // Generate file templates based on template type
    for (const fileName of templateConfig.files) {
      template.files[fileName] = this.generateFileTemplate(fileName, templateKey, featureSpec);
    }

    return template;
  }

  /**
   * Generate template variables
   * @param {Object} featureSpec - Feature specification
   * @returns {Object} Template variables
   */
  generateTemplateVariables(featureSpec) {
    const featureName = featureSpec.name;
    const featureType = featureSpec.type;
    const className = this.toPascalCase(featureName);
    const functionName = this.toCamelCase(featureName);
    const constantName = this.toConstantCase(featureName);
    const kebabName = this.toKebabCase(featureName);

    return {
      FEATURE_NAME: featureName,
      FEATURE_TYPE: featureType,
      CLASS_NAME: className,
      FUNCTION_NAME: functionName,
      CONSTANT_NAME: constantName,
      KEBAB_NAME: kebabName,
      DESCRIPTION: featureSpec.description || `Implementation of ${featureName}`,
      AUTHOR: 'Evaia Implementation Command',
      DATE: new Date().toISOString().split('T')[0],
      YEAR: new Date().getFullYear()
    };
  }

  /**
   * Generate template patterns
   * @param {string} templateKey - Template key
   * @returns {Object} Template patterns
   */
  generateTemplatePatterns(templateKey) {
    const patterns = {
      'api-endpoint': {
        imports: ['express', 'joi', 'http-status-codes'],
        exports: ['router', 'controller', 'service'],
        middleware: ['auth', 'validation', 'rateLimit']
      },
      'component': {
        imports: ['react', 'typescript', 'css'],
        exports: ['component', 'types', 'styles'],
        hooks: ['useState', 'useEffect', 'useCallback']
      },
      'service': {
        imports: ['typescript', 'logging', 'error-handling'],
        exports: ['service', 'types', 'interfaces'],
        patterns: ['singleton', 'factory', 'strategy']
      },
      'ai-service': {
        imports: ['ai-client', 'typescript', 'logging'],
        exports: ['aiService', 'types', 'config'],
        patterns: ['adapter', 'facade', 'observer']
      }
    };

    return patterns[templateKey] || {};
  }

  /**
   * Generate file template
   * @param {string} fileName - File name
   * @param {string} templateKey - Template key
   * @param {Object} featureSpec - Feature specification
   * @returns {string} File template content
   */
  generateFileTemplate(fileName, templateKey, featureSpec) {
    const variables = this.generateTemplateVariables(featureSpec);
    const patterns = this.generateTemplatePatterns(templateKey);

    // Generate template based on file type and template key
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      return this.generateReactTemplate(fileName, variables, patterns);
    } else if (fileName.endsWith('.ts') || fileName.endsWith('.js')) {
      return this.generateTypeScriptTemplate(fileName, templateKey, variables, patterns);
    } else if (fileName.endsWith('.css')) {
      return this.generateCSSTemplate(fileName, variables);
    } else if (fileName.endsWith('.test.ts') || fileName.endsWith('.test.tsx')) {
      return this.generateTestTemplate(fileName, variables, patterns);
    }

    return this.generateGenericTemplate(fileName, variables);
  }

  /**
   * Generate React component template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @param {Object} patterns - Template patterns
   * @returns {string} React template
   */
  generateReactTemplate(fileName, variables, patterns) {
    return `import React from 'react';
import { ${patterns.hooks?.join(', ') || 'useState, useEffect'} } from 'react';
import './${fileName.replace(/\.(tsx|jsx)$/, '.css')}';

interface ${variables.CLASS_NAME}Props {
  // Define component props here
}

const ${variables.CLASS_NAME}: React.FC<${variables.CLASS_NAME}Props> = (props) => {
  // Component implementation
  return (
    <div className="${variables.KEBAB_NAME}">
      <h1>${variables.DESCRIPTION}</h1>
      {/* Component content */}
    </div>
  );
};

export default ${variables.CLASS_NAME};
export type { ${variables.CLASS_NAME}Props };
`;
  }

  /**
   * Generate TypeScript template
   * @param {string} fileName - File name
   * @param {string} templateKey - Template key
   * @param {Object} variables - Template variables
   * @param {Object} patterns - Template patterns
   * @returns {string} TypeScript template
   */
  generateTypeScriptTemplate(fileName, templateKey, variables, patterns) {
    if (templateKey === 'api-endpoint') {
      return this.generateAPITemplate(fileName, variables, patterns);
    } else if (templateKey === 'service') {
      return this.generateServiceTemplate(fileName, variables, patterns);
    } else if (templateKey === 'ai-service') {
      return this.generateAIServiceTemplate(fileName, variables, patterns);
    }

    return this.generateGenericTypeScriptTemplate(fileName, variables);
  }

  /**
   * Generate API template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @param {Object} patterns - Template patterns
   * @returns {string} API template
   */
  generateAPITemplate(fileName, variables, patterns) {
    return `import express from 'express';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

// Validation schemas
const ${variables.FUNCTION_NAME}Schema = Joi.object({
  // Define validation schema here
});

class ${variables.CLASS_NAME}Controller {
  // Controller methods
  async get${variables.CLASS_NAME}(req: Request, res: Response) {
    try {
      // Implementation
      res.status(StatusCodes.OK).json({ message: 'Success' });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async create${variables.CLASS_NAME}(req: Request, res: Response) {
    try {
      // Implementation
      res.status(StatusCodes.CREATED).json({ message: 'Created' });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}

export default ${variables.CLASS_NAME}Controller;
`;
  }

  /**
   * Generate service template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @param {Object} patterns - Template patterns
   * @returns {string} Service template
   */
  generateServiceTemplate(fileName, variables, patterns) {
    return `import { Logger } from '../utils/logger';

interface ${variables.CLASS_NAME}Config {
  // Define service configuration
}

class ${variables.CLASS_NAME}Service {
  private logger: Logger;
  private config: ${variables.CLASS_NAME}Config;

  constructor(config: ${variables.CLASS_NAME}Config) {
    this.config = config;
    this.logger = new Logger('${variables.CLASS_NAME}Service');
  }

  async ${variables.FUNCTION_NAME}(): Promise<void> {
    this.logger.info('Executing ${variables.FUNCTION_NAME}');
    // Service implementation
  }
}

export default ${variables.CLASS_NAME}Service;
export type { ${variables.CLASS_NAME}Config };
`;
  }

  /**
   * Generate AI service template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @param {Object} patterns - Template patterns
   * @returns {string} AI service template
   */
  generateAIServiceTemplate(fileName, variables, patterns) {
    return `import { AIClient } from '../ai/ai-client';
import { Logger } from '../utils/logger';

interface ${variables.CLASS_NAME}Config {
  apiKey: string;
  model: string;
  temperature?: number;
}

class ${variables.CLASS_NAME}Service {
  private aiClient: AIClient;
  private logger: Logger;
  private config: ${variables.CLASS_NAME}Config;

  constructor(config: ${variables.CLASS_NAME}Config) {
    this.config = config;
    this.aiClient = new AIClient(config.apiKey);
    this.logger = new Logger('${variables.CLASS_NAME}Service');
  }

  async process${variables.CLASS_NAME}(input: string): Promise<string> {
    this.logger.info('Processing ${variables.FUNCTION_NAME}');
    
    try {
      const response = await this.aiClient.generate({
        model: this.config.model,
        prompt: input,
        temperature: this.config.temperature || 0.7
      });
      
      return response.text;
    } catch (error) {
      this.logger.error('AI processing failed', error);
      throw error;
    }
  }
}

export default ${variables.CLASS_NAME}Service;
export type { ${variables.CLASS_NAME}Config };
`;
  }

  /**
   * Generate CSS template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @returns {string} CSS template
   */
  generateCSSTemplate(fileName, variables) {
    return `.${variables.KEBAB_NAME} {
  /* Component styles */
  padding: 1rem;
  margin: 0.5rem 0;
}

.${variables.KEBAB_NAME} h1 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.${variables.KEBAB_NAME} .content {
  /* Content styles */
}
`;
  }

  /**
   * Generate test template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @param {Object} patterns - Template patterns
   * @returns {string} Test template
   */
  generateTestTemplate(fileName, variables, patterns) {
    return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ${variables.CLASS_NAME} from './${fileName.replace('.test.ts', '').replace('.test.tsx', '')}';

describe('${variables.CLASS_NAME}', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should work correctly', () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
`;
  }

  /**
   * Generate generic template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @returns {string} Generic template
   */
  generateGenericTemplate(fileName, variables) {
    return `// ${variables.DESCRIPTION}
// Generated by Evaia Implementation Command
// Date: ${variables.DATE}

export class ${variables.CLASS_NAME} {
  // Implementation
}
`;
  }

  /**
   * Generate generic TypeScript template
   * @param {string} fileName - File name
   * @param {Object} variables - Template variables
   * @returns {string} Generic TypeScript template
   */
  generateGenericTypeScriptTemplate(fileName, variables) {
    return `// ${variables.DESCRIPTION}
// Generated by Evaia Implementation Command
// Date: ${variables.DATE}

interface ${variables.CLASS_NAME}Config {
  // Configuration interface
}

class ${variables.CLASS_NAME} {
  private config: ${variables.CLASS_NAME}Config;

  constructor(config: ${variables.CLASS_NAME}Config) {
    this.config = config;
  }

  // Implementation methods
}

export default ${variables.CLASS_NAME};
export type { ${variables.CLASS_NAME}Config };
`;
  }

  /**
   * Get variable value
   * @param {string} varName - Variable name
   * @param {Object} featureSpec - Feature specification
   * @returns {string} Variable value
   */
  getVariableValue(varName, featureSpec) {
    const featureName = featureSpec.name;
    
    switch (varName) {
      case 'COMPONENT_NAME':
        return this.toPascalCase(featureName);
      case 'FEATURE_NAME':
        return featureName;
      case 'FUNCTION_NAME':
        return this.toCamelCase(featureName);
      case 'CONSTANT_NAME':
        return this.toConstantCase(featureName);
      case 'KEBAB_NAME':
        return this.toKebabCase(featureName);
      case 'DESCRIPTION':
        return featureSpec.description || `Implementation of ${featureName}`;
      default:
        return `{{${varName}}}`;
    }
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
   * Convert string to camelCase
   * @param {string} str - Input string
   * @returns {string} camelCase string
   */
  toCamelCase(str) {
    return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Convert string to CONSTANT_CASE
   * @param {string} str - Input string
   * @returns {string} CONSTANT_CASE string
   */
  toConstantCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '');
  }

  /**
   * Convert string to kebab-case
   * @param {string} str - Input string
   * @returns {string} kebab-case string
   */
  toKebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }
}