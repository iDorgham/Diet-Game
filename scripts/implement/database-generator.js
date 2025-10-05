/**
 * Database Generator for Evaia Implementation Command
 * 
 * Generates Prisma database models and migrations.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseGenerator {
  constructor() {
    this.generatedFiles = [];
  }

  /**
   * Generate database models
   * @param {Object} context - Implementation context
   */
  async generateModels(context) {
    try {
      console.log(chalk.blue('🗄️ Generating database models...'));

      const { feature } = context;
      
      if (!feature.database) {
        console.log(chalk.yellow('⚠️  No database specification found, generating default model'));
        feature.database = this.generateDefaultDatabaseSpec(feature);
      }

      // Generate Prisma schema
      await this.generatePrismaSchema(context);
      
      // Generate TypeScript types
      await this.generateTypeScriptTypes(context);

      console.log(chalk.green(`✅ Generated database models`));

    } catch (error) {
      console.error(chalk.red(`❌ Error generating database models: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate database migrations
   * @param {Object} context - Implementation context
   */
  async generateMigrations(context) {
    try {
      console.log(chalk.blue('🗄️ Generating database migrations...'));

      const { feature } = context;
      
      if (!feature.database) {
        console.log(chalk.yellow('⚠️  No database specification found, skipping migrations'));
        return;
      }

      // Generate migration files
      for (const migration of feature.database.migrations) {
        await this.generateMigrationFile(context, migration);
      }

      console.log(chalk.green(`✅ Generated ${feature.database.migrations.length} migrations`));

    } catch (error) {
      console.error(chalk.red(`❌ Error generating migrations: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate Prisma schema
   * @param {Object} context - Implementation context
   */
  async generatePrismaSchema(context) {
    const { feature } = context;
    const featureName = feature.name;
    const tableName = this.toSnakeCase(featureName);

    // Generate Prisma model
    const prismaModel = this.generatePrismaModel(feature);
    
    // Update or create schema.prisma file
    const schemaPath = path.join(process.cwd(), 'backend', 'prisma', 'schema.prisma');
    await this.updatePrismaSchema(schemaPath, prismaModel);

    console.log(chalk.green(`✅ Updated Prisma schema with ${featureName} model`));
  }

  /**
   * Generate TypeScript types
   * @param {Object} context - Implementation context
   */
  async generateTypeScriptTypes(context) {
    const { feature } = context;
    const featureName = feature.name;
    const className = this.toPascalCase(featureName);

    // Generate TypeScript types file
    const typesPath = path.join(process.cwd(), 'backend', 'src', 'types', `${featureName.toLowerCase()}.ts`);
    const typesContent = this.generateTypeScriptTypesContent(feature, className);

    await this.writeFile(typesPath, typesContent);
    this.generatedFiles.push(typesPath);

    console.log(chalk.green(`✅ Generated TypeScript types: ${typesPath}`));
  }

  /**
   * Generate migration file
   * @param {Object} context - Implementation context
   * @param {Object} migration - Migration specification
   */
  async generateMigrationFile(context, migration) {
    const { feature } = context;
    const featureName = feature.name;
    const migrationName = migration.name;
    
    // Generate migration SQL
    const migrationContent = this.generateMigrationContent(migration, feature);
    
    // Create migration file
    const migrationPath = path.join(process.cwd(), 'backend', 'migrations', `${migrationName}.sql`);
    await this.writeFile(migrationPath, migrationContent);
    this.generatedFiles.push(migrationPath);

    console.log(chalk.green(`✅ Generated migration: ${migrationPath}`));
  }

  /**
   * Generate default database specification
   * @param {Object} feature - Feature specification
   * @returns {Object} Database specification
   */
  generateDefaultDatabaseSpec(feature) {
    const featureName = feature.name;
    const tableName = this.toSnakeCase(featureName);

    return {
      tables: [
        {
          name: tableName,
          fields: [
            { name: 'id', type: 'uuid', primary: true, default: 'gen_random_uuid()' },
            { name: 'created_at', type: 'timestamp', default: 'now()', nullable: false },
            { name: 'updated_at', type: 'timestamp', default: 'now()', nullable: false },
            { name: 'name', type: 'varchar(255)', nullable: false },
            { name: 'description', type: 'text', nullable: true },
            { name: 'status', type: 'varchar(50)', default: "'active'", nullable: false }
          ],
          indexes: [
            { name: `idx_${tableName}_id`, columns: ['id'], unique: true },
            { name: `idx_${tableName}_status`, columns: ['status'] },
            { name: `idx_${tableName}_created_at`, columns: ['created_at'] }
          ],
          relationships: []
        }
      ],
      migrations: [
        {
          name: `create_${tableName}_table`,
          up: this.generateCreateTableSQL(tableName),
          down: `DROP TABLE IF EXISTS ${tableName};`
        }
      ]
    };
  }

  /**
   * Generate Prisma model
   * @param {Object} feature - Feature specification
   * @returns {string} Prisma model
   */
  generatePrismaModel(feature) {
    const featureName = feature.name;
    const tableName = this.toSnakeCase(featureName);
    const className = this.toPascalCase(featureName);

    let model = `model ${className} {\n`;
    
    // Add fields
    for (const field of feature.database.tables[0].fields) {
      const fieldName = field.name;
      const fieldType = this.mapToPrismaType(field.type);
      const isOptional = field.nullable ? '?' : '';
      const isId = field.primary ? '@id' : '';
      const isUnique = field.unique ? '@unique' : '';
      const defaultValue = field.default ? `@default(${field.default})` : '';
      const attributes = [isId, isUnique, defaultValue].filter(Boolean).join(' ');
      
      model += `  ${fieldName} ${fieldType}${isOptional} ${attributes}\n`;
    }

    // Add indexes
    for (const index of feature.database.tables[0].indexes) {
      if (index.unique) {
        model += `  @@unique([${index.columns.join(', ')}])\n`;
      } else {
        model += `  @@index([${index.columns.join(', ')}])\n`;
      }
    }

    model += `  @@map("${tableName}")\n`;
    model += `}\n`;

    return model;
  }

  /**
   * Generate TypeScript types content
   * @param {Object} feature - Feature specification
   * @param {string} className - Class name
   * @returns {string} TypeScript types content
   */
  generateTypeScriptTypesContent(feature, className) {
    const table = feature.database.tables[0];
    
    let typesContent = `// TypeScript types for ${feature.name}
// Generated by Evaia Implementation Command

export interface ${className} {
`;

    // Add field types
    for (const field of table.fields) {
      const fieldName = field.name;
      const fieldType = this.mapToTypeScriptType(field.type);
      const isOptional = field.nullable ? '?' : '';
      
      typesContent += `  ${fieldName}${isOptional}: ${fieldType};\n`;
    }

    typesContent += `}

export interface Create${className}Input {
`;

    // Add input types (excluding auto-generated fields)
    for (const field of table.fields) {
      if (field.name === 'id' || field.name === 'created_at' || field.name === 'updated_at') {
        continue;
      }
      
      const fieldName = field.name;
      const fieldType = this.mapToTypeScriptType(field.type);
      const isOptional = field.nullable ? '?' : '';
      
      typesContent += `  ${fieldName}${isOptional}: ${fieldType};\n`;
    }

    typesContent += `}

export interface Update${className}Input {
`;

    // Add update types (all fields optional)
    for (const field of table.fields) {
      if (field.name === 'id' || field.name === 'created_at') {
        continue;
      }
      
      const fieldName = field.name;
      const fieldType = this.mapToTypeScriptType(field.type);
      
      typesContent += `  ${fieldName}?: ${fieldType};\n`;
    }

    typesContent += `}

export interface ${className}Query {
  id?: string;
  status?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export default ${className};
`;

    return typesContent;
  }

  /**
   * Generate migration content
   * @param {Object} migration - Migration specification
   * @param {Object} feature - Feature specification
   * @returns {string} Migration content
   */
  generateMigrationContent(migration, feature) {
    return `-- Migration: ${migration.name}
-- Generated by Evaia Implementation Command
-- Feature: ${feature.name}
-- Date: ${new Date().toISOString()}

-- Up migration
${migration.up};

-- Down migration (commented out)
-- ${migration.down};
`;
  }

  /**
   * Generate create table SQL
   * @param {string} tableName - Table name
   * @returns {string} Create table SQL
   */
  generateCreateTableSQL(tableName) {
    return `CREATE TABLE ${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_${tableName}_id ON ${tableName}(id);
CREATE INDEX idx_${tableName}_status ON ${tableName}(status);
CREATE INDEX idx_${tableName}_created_at ON ${tableName}(created_at);`;
  }

  /**
   * Update Prisma schema file
   * @param {string} schemaPath - Schema file path
   * @param {string} model - Prisma model
   */
  async updatePrismaSchema(schemaPath, model) {
    try {
      let schemaContent = '';
      
      // Read existing schema if it exists
      try {
        schemaContent = await fs.readFile(schemaPath, 'utf-8');
      } catch (error) {
        // Schema file doesn't exist, create basic structure
        schemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;
      }

      // Check if model already exists
      const modelName = model.split('\n')[0].replace('model ', '').replace(' {', '');
      const modelRegex = new RegExp(`model ${modelName} \\{[\\s\\S]*?\\}`, 'g');
      
      if (modelRegex.test(schemaContent)) {
        // Replace existing model
        schemaContent = schemaContent.replace(modelRegex, model);
      } else {
        // Add new model
        schemaContent += '\n' + model + '\n';
      }

      await fs.writeFile(schemaPath, schemaContent, 'utf-8');
      this.generatedFiles.push(schemaPath);

    } catch (error) {
      console.error(chalk.red(`❌ Error updating Prisma schema: ${error.message}`));
      throw error;
    }
  }

  /**
   * Map database type to Prisma type
   * @param {string} dbType - Database type
   * @returns {string} Prisma type
   */
  mapToPrismaType(dbType) {
    const typeMap = {
      'uuid': 'String',
      'varchar': 'String',
      'text': 'String',
      'integer': 'Int',
      'bigint': 'BigInt',
      'boolean': 'Boolean',
      'timestamp': 'DateTime',
      'date': 'DateTime',
      'time': 'DateTime',
      'json': 'Json',
      'jsonb': 'Json'
    };

    // Extract base type from type with length (e.g., varchar(255) -> varchar)
    const baseType = dbType.split('(')[0].toLowerCase();
    
    return typeMap[baseType] || 'String';
  }

  /**
   * Map database type to TypeScript type
   * @param {string} dbType - Database type
   * @returns {string} TypeScript type
   */
  mapToTypeScriptType(dbType) {
    const typeMap = {
      'uuid': 'string',
      'varchar': 'string',
      'text': 'string',
      'integer': 'number',
      'bigint': 'number',
      'boolean': 'boolean',
      'timestamp': 'Date',
      'date': 'Date',
      'time': 'Date',
      'json': 'any',
      'jsonb': 'any'
    };

    // Extract base type from type with length
    const baseType = dbType.split('(')[0].toLowerCase();
    
    return typeMap[baseType] || 'string';
  }

  /**
   * Convert string to snake_case
   * @param {string} str - Input string
   * @returns {string} snake_case string
   */
  toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
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