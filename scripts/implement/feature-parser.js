/**
 * Feature Parser for Evaia Implementation Command
 * 
 * Parses feature specifications and validates implementation requirements.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeatureParser {
  constructor() {
    this.specsDirectory = path.join(process.cwd(), 'docs', 'specs');
    this.templatesDirectory = path.join(process.cwd(), 'docs', 'templates');
    this.featureCache = new Map();
  }

  /**
   * Parse feature specification from various sources
   * @param {string} featureName - Name of the feature to implement
   * @param {string} phase - Implementation phase
   * @param {Object} options - Implementation options
   * @returns {Object|null} Parsed feature specification
   */
  async parseFeature(featureName, phase, options) {
    try {
      console.log(chalk.blue(`🔍 Parsing feature specification: ${featureName}`));

      // Try to find feature specification in multiple locations
      const specSources = [
        await this.findSpecFile(featureName),
        await this.findTemplateFile(featureName),
        await this.generateFromName(featureName)
      ];

      let featureSpec = null;
      for (const source of specSources) {
        if (source) {
          featureSpec = source;
          break;
        }
      }

      if (!featureSpec) {
        console.log(chalk.yellow(`⚠️  No specification found for ${featureName}, generating from name`));
        featureSpec = await this.generateFromName(featureName);
      }

      // Validate and enhance specification
      featureSpec = await this.validateAndEnhanceSpec(featureSpec, phase, options);

      // Cache the parsed specification
      this.featureCache.set(featureName, featureSpec);

      console.log(chalk.green(`✅ Feature specification parsed successfully`));
      return featureSpec;

    } catch (error) {
      console.error(chalk.red(`❌ Error parsing feature specification: ${error.message}`));
      return null;
    }
  }

  /**
   * Find specification file for the feature
   * @param {string} featureName - Feature name
   * @returns {Object|null} Specification object or null
   */
  async findSpecFile(featureName) {
    try {
      const specFiles = [
        `${featureName}.md`,
        `${featureName}-spec.md`,
        `${featureName}-specification.md`,
        `${featureName.toLowerCase()}.md`,
        `${featureName.toLowerCase()}-spec.md`
      ];

      for (const fileName of specFiles) {
        const filePath = path.join(this.specsDirectory, fileName);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          return await this.parseSpecFile(content, featureName);
        } catch (error) {
          // File doesn't exist, try next
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(chalk.red(`Error finding spec file: ${error.message}`));
      return null;
    }
  }

  /**
   * Find template file for the feature
   * @param {string} featureName - Feature name
   * @returns {Object|null} Template object or null
   */
  async findTemplateFile(featureName) {
    try {
      const templateFiles = [
        `${featureName}-template.md`,
        `${featureName.toLowerCase()}-template.md`
      ];

      for (const fileName of templateFiles) {
        const filePath = path.join(this.templatesDirectory, fileName);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          return await this.parseTemplateFile(content, featureName);
        } catch (error) {
          // File doesn't exist, try next
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(chalk.red(`Error finding template file: ${error.message}`));
      return null;
    }
  }

  /**
   * Generate feature specification from name
   * @param {string} featureName - Feature name
   * @returns {Object} Generated specification
   */
  async generateFromName(featureName) {
    const featureType = this.detectFeatureType(featureName);
    
    return {
      name: featureName,
      type: featureType,
      description: `Implementation of ${featureName} feature`,
      requirements: this.generateDefaultRequirements(featureName, featureType),
      components: this.generateDefaultComponents(featureName, featureType),
      api: this.generateDefaultAPI(featureName, featureType),
      database: this.generateDefaultDatabase(featureName, featureType),
      tests: this.generateDefaultTests(featureName, featureType),
      documentation: this.generateDefaultDocumentation(featureName, featureType),
      generated: true
    };
  }

  /**
   * Detect feature type from name
   * @param {string} featureName - Feature name
   * @returns {string} Feature type
   */
  detectFeatureType(featureName) {
    const name = featureName.toLowerCase();
    
    if (name.includes('auth') || name.includes('login') || name.includes('user')) {
      return 'authentication';
    } else if (name.includes('api') || name.includes('endpoint')) {
      return 'api';
    } else if (name.includes('component') || name.includes('ui')) {
      return 'component';
    } else if (name.includes('service') || name.includes('integration')) {
      return 'service';
    } else if (name.includes('page') || name.includes('view')) {
      return 'page';
    } else if (name.includes('ai') || name.includes('ml') || name.includes('intelligence')) {
      return 'ai';
    } else if (name.includes('workflow') || name.includes('automation')) {
      return 'workflow';
    } else {
      return 'feature';
    }
  }

  /**
   * Generate default requirements
   * @param {string} featureName - Feature name
   * @param {string} featureType - Feature type
   * @returns {Array} Requirements array
   */
  generateDefaultRequirements(featureName, featureType) {
    const baseRequirements = [
      `Implement ${featureName} functionality`,
      'Follow TypeScript best practices',
      'Include proper error handling',
      'Add comprehensive logging',
      'Ensure security best practices'
    ];

    const typeSpecificRequirements = {
      authentication: [
        'Implement secure authentication flow',
        'Add JWT token management',
        'Include password hashing',
        'Add session management'
      ],
      api: [
        'Create RESTful API endpoints',
        'Add request validation',
        'Include response formatting',
        'Add rate limiting'
      ],
      component: [
        'Create reusable React component',
        'Add TypeScript interfaces',
        'Include proper styling',
        'Add accessibility features'
      ],
      service: [
        'Create service class with methods',
        'Add error handling',
        'Include logging',
        'Add configuration management'
      ],
      page: [
        'Create page component',
        'Add routing integration',
        'Include layout structure',
        'Add navigation'
      ],
      ai: [
        'Integrate AI services',
        'Add AI workflow automation',
        'Include AI monitoring',
        'Add AI response handling'
      ],
      workflow: [
        'Create workflow automation',
        'Add state management',
        'Include error handling',
        'Add monitoring'
      ]
    };

    return [
      ...baseRequirements,
      ...(typeSpecificRequirements[featureType] || [])
    ];
  }

  /**
   * Generate default components
   * @param {string} featureName - Feature name
   * @param {string} featureType - Feature type
   * @returns {Array} Components array
   */
  generateDefaultComponents(featureName, featureType) {
    const components = [];

    if (featureType === 'component' || featureType === 'page') {
      components.push({
        name: `${featureName}Component`,
        type: 'react',
        path: `src/components/${featureName.toLowerCase()}/`,
        files: ['index.tsx', 'types.ts', 'styles.css']
      });
    }

    if (featureType === 'service') {
      components.push({
        name: `${featureName}Service`,
        type: 'service',
        path: `src/services/`,
        files: ['index.ts', 'types.ts']
      });
    }

    if (featureType === 'api') {
      components.push({
        name: `${featureName}Controller`,
        type: 'controller',
        path: `backend/src/controllers/`,
        files: ['index.ts', 'types.ts']
      });
    }

    return components;
  }

  /**
   * Generate default API specification
   * @param {string} featureName - Feature name
   * @param {string} featureType - Feature type
   * @returns {Object} API specification
   */
  generateDefaultAPI(featureName, featureType) {
    if (featureType !== 'api' && featureType !== 'authentication') {
      return null;
    }

    const basePath = `/${featureName.toLowerCase()}`;
    
    return {
      basePath,
      endpoints: [
        {
          method: 'GET',
          path: basePath,
          description: `Get ${featureName} data`,
          parameters: [],
          responses: {
            200: 'Success',
            400: 'Bad Request',
            500: 'Internal Server Error'
          }
        },
        {
          method: 'POST',
          path: basePath,
          description: `Create ${featureName} data`,
          parameters: ['body'],
          responses: {
            201: 'Created',
            400: 'Bad Request',
            500: 'Internal Server Error'
          }
        }
      ],
      authentication: featureType === 'authentication' ? 'required' : 'optional'
    };
  }

  /**
   * Generate default database specification
   * @param {string} featureName - Feature name
   * @param {string} featureType - Feature type
   * @returns {Object} Database specification
   */
  generateDefaultDatabase(featureName, featureType) {
    const tableName = featureName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    return {
      tables: [
        {
          name: tableName,
          fields: [
            { name: 'id', type: 'uuid', primary: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' }
          ],
          indexes: ['id'],
          relationships: []
        }
      ],
      migrations: [
        {
          name: `create_${tableName}_table`,
          up: `CREATE TABLE ${tableName} (id UUID PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`,
          down: `DROP TABLE ${tableName};`
        }
      ]
    };
  }

  /**
   * Generate default tests specification
   * @param {string} featureName - Feature name
   * @param {string} featureType - Feature type
   * @returns {Object} Tests specification
   */
  generateDefaultTests(featureName, featureType) {
    return {
      unit: [
        {
          name: `${featureName} unit tests`,
          path: `src/test/${featureName.toLowerCase()}.test.ts`,
          coverage: 80
        }
      ],
      integration: [
        {
          name: `${featureName} integration tests`,
          path: `src/test/integration/${featureName.toLowerCase()}.test.ts`,
          coverage: 70
        }
      ],
      e2e: [
        {
          name: `${featureName} e2e tests`,
          path: `src/test/e2e/${featureName.toLowerCase()}.test.ts`,
          coverage: 60
        }
      ]
    };
  }

  /**
   * Generate default documentation specification
   * @param {string} featureName - Feature name
   * @param {string} featureType - Feature type
   * @returns {Object} Documentation specification
   */
  generateDefaultDocumentation(featureName, featureType) {
    return {
      api: {
        path: `docs/api/${featureName.toLowerCase()}.md`,
        format: 'markdown'
      },
      component: {
        path: `docs/components/${featureName.toLowerCase()}.md`,
        format: 'markdown'
      },
      user: {
        path: `docs/user/${featureName.toLowerCase()}.md`,
        format: 'markdown'
      }
    };
  }

  /**
   * Parse specification file content
   * @param {string} content - File content
   * @param {string} featureName - Feature name
   * @returns {Object} Parsed specification
   */
  async parseSpecFile(content, featureName) {
    // Parse markdown specification file
    const lines = content.split('\n');
    const spec = {
      name: featureName,
      type: 'feature',
      description: '',
      requirements: [],
      components: [],
      api: null,
      database: null,
      tests: null,
      documentation: null,
      generated: false
    };

    let currentSection = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        spec.description = trimmedLine.substring(2);
      } else if (trimmedLine.startsWith('## Requirements')) {
        currentSection = 'requirements';
      } else if (trimmedLine.startsWith('## Components')) {
        currentSection = 'components';
      } else if (trimmedLine.startsWith('## API')) {
        currentSection = 'api';
      } else if (trimmedLine.startsWith('## Database')) {
        currentSection = 'database';
      } else if (trimmedLine.startsWith('## Tests')) {
        currentSection = 'tests';
      } else if (trimmedLine.startsWith('## Documentation')) {
        currentSection = 'documentation';
      } else if (trimmedLine.startsWith('- ') && currentSection) {
        const item = trimmedLine.substring(2);
        if (currentSection === 'requirements') {
          spec.requirements.push(item);
        }
      }
    }

    return spec;
  }

  /**
   * Parse template file content
   * @param {string} content - File content
   * @param {string} featureName - Feature name
   * @returns {Object} Parsed template
   */
  async parseTemplateFile(content, featureName) {
    // Parse template file and convert to specification
    return {
      name: featureName,
      type: 'template',
      description: `Template-based implementation of ${featureName}`,
      requirements: ['Use template structure', 'Follow template patterns'],
      components: [],
      api: null,
      database: null,
      tests: null,
      documentation: null,
      generated: false,
      template: true
    };
  }

  /**
   * Validate and enhance specification
   * @param {Object} spec - Feature specification
   * @param {string} phase - Implementation phase
   * @param {Object} options - Implementation options
   * @returns {Object} Enhanced specification
   */
  async validateAndEnhanceSpec(spec, phase, options) {
    // Add phase-specific requirements
    spec.phase = phase;
    spec.options = options;

    // Add phase-specific enhancements
    if (phase === 'phase2' || phase === 'complete') {
      spec.requirements.push('Add performance optimizations');
      spec.requirements.push('Include caching mechanisms');
    }

    if (phase === 'phase3' || phase === 'complete') {
      spec.requirements.push('Add comprehensive testing');
      spec.requirements.push('Include monitoring and logging');
    }

    // Add option-specific enhancements
    if (options.withTests) {
      spec.requirements.push('Generate comprehensive test suite');
    }

    if (options.withDocs) {
      spec.requirements.push('Generate complete documentation');
    }

    if (options.withAi) {
      spec.requirements.push('Integrate AI services');
      spec.requirements.push('Add AI workflow automation');
    }

    if (options.fullStack) {
      spec.requirements.push('Implement complete full-stack solution');
      spec.requirements.push('Include frontend and backend components');
    }

    return spec;
  }
}