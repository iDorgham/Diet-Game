import { CodeChange, SpecificationMapping } from './CodeChangeAnalyzer';
import fs from 'fs/promises';
import path from 'path';

export interface SpecificationUpdate {
  specPath: string;
  type: UpdateType;
  changes: SpecificationChange[];
  confidence: number;
  timestamp: Date;
  source: string;
  metadata: UpdateMetadata;
}

export interface SpecificationChange {
  type: 'add' | 'update' | 'remove' | 'move';
  section: string;
  content: string;
  details?: Record<string, any>;
  lineNumber?: number;
  context?: string;
}

export interface UpdateMetadata {
  codeChange: CodeChange;
  mapping: SpecificationMapping;
  validation: ValidationResult;
  conflicts: Conflict[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface Conflict {
  type: 'content' | 'structure' | 'format';
  description: string;
  resolution: 'auto' | 'manual' | 'skip';
  severity: 'low' | 'medium' | 'high';
}

export type UpdateType = 'requirements' | 'design' | 'tasks' | 'api' | 'data-model';

export class SpecificationUpdater {
  private aiService: any; // Grok AI service
  private validationRules: Map<string, ValidationRule[]> = new Map();

  constructor(aiService?: any) {
    this.aiService = aiService;
    this.initializeValidationRules();
  }

  async generateUpdates(
    codeChange: CodeChange, 
    mappings: SpecificationMapping[]
  ): Promise<SpecificationUpdate[]> {
    const updates: SpecificationUpdate[] = [];

    for (const mapping of mappings) {
      const update = await this.generateUpdateForSpec(codeChange, mapping);
      if (update) {
        updates.push(update);
      }
    }

    return updates;
  }

  private async generateUpdateForSpec(
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationUpdate | null> {
    try {
      const specContent = await this.readSpecification(mapping.specPath);
      if (!specContent) return null;

      const changes = await this.generateChanges(specContent, codeChange, mapping);
      if (changes.length === 0) return null;

      const validation = await this.validateChanges(changes, specContent);
      const conflicts = await this.detectConflicts(changes, specContent);

      const update: SpecificationUpdate = {
        specPath: mapping.specPath,
        type: this.determineUpdateType(codeChange, mapping),
        changes,
        confidence: this.calculateConfidence(codeChange, mapping, changes),
        timestamp: new Date(),
        source: `code-change:${codeChange.file}`,
        metadata: {
          codeChange,
          mapping,
          validation,
          conflicts
        }
      };

      return update;
    } catch (error) {
      console.error(`Error generating update for ${mapping.specPath}:`, error);
      return null;
    }
  }

  private async generateChanges(
    specContent: string, 
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    switch (codeChange.type) {
      case 'component':
        changes.push(...await this.generateComponentChanges(specContent, codeChange, mapping));
        break;
      case 'service':
        changes.push(...await this.generateServiceChanges(specContent, codeChange, mapping));
        break;
      case 'api':
        changes.push(...await this.generateAPIChanges(specContent, codeChange, mapping));
        break;
      case 'type':
        changes.push(...await this.generateTypeChanges(specContent, codeChange, mapping));
        break;
      case 'hook':
        changes.push(...await this.generateHookChanges(specContent, codeChange, mapping));
        break;
    }

    return changes;
  }

  private async generateComponentChanges(
    specContent: string, 
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    if (this.aiService) {
      // Use AI to generate component changes
      const aiChanges = await this.generateAIChanges(specContent, codeChange, 'component');
      changes.push(...aiChanges);
    } else {
      // Fallback to rule-based generation
      const componentInfo = await this.extractComponentInfo(codeChange);
      if (componentInfo) {
        changes.push({
          type: 'update',
          section: 'Components',
          content: `Updated component: ${componentInfo.name}`,
          details: {
            props: componentInfo.props,
            methods: componentInfo.methods,
            state: componentInfo.state,
            file: codeChange.file
          }
        });
      }
    }

    return changes;
  }

  private async generateServiceChanges(
    specContent: string, 
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    if (this.aiService) {
      const aiChanges = await this.generateAIChanges(specContent, codeChange, 'service');
      changes.push(...aiChanges);
    } else {
      const serviceInfo = await this.extractServiceInfo(codeChange);
      if (serviceInfo) {
        changes.push({
          type: 'update',
          section: 'Services',
          content: `Updated service: ${serviceInfo.name}`,
          details: {
            methods: serviceInfo.methods,
            dependencies: serviceInfo.dependencies,
            file: codeChange.file
          }
        });
      }
    }

    return changes;
  }

  private async generateAPIChanges(
    specContent: string, 
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    if (this.aiService) {
      const aiChanges = await this.generateAIChanges(specContent, codeChange, 'api');
      changes.push(...aiChanges);
    } else {
      const apiInfo = await this.extractAPIInfo(codeChange);
      if (apiInfo) {
        changes.push({
          type: 'update',
          section: 'API Endpoints',
          content: `Updated API endpoint: ${apiInfo.endpoint}`,
          details: {
            method: apiInfo.method,
            parameters: apiInfo.parameters,
            response: apiInfo.response,
            file: codeChange.file
          }
        });
      }
    }

    return changes;
  }

  private async generateTypeChanges(
    specContent: string, 
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    if (this.aiService) {
      const aiChanges = await this.generateAIChanges(specContent, codeChange, 'type');
      changes.push(...aiChanges);
    } else {
      const typeInfo = await this.extractTypeInfo(codeChange);
      if (typeInfo) {
        changes.push({
          type: 'update',
          section: 'Data Models',
          content: `Updated type definition: ${typeInfo.name}`,
          details: {
            properties: typeInfo.properties,
            methods: typeInfo.methods,
            file: codeChange.file
          }
        });
      }
    }

    return changes;
  }

  private async generateHookChanges(
    specContent: string, 
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): Promise<SpecificationChange[]> {
    const changes: SpecificationChange[] = [];

    if (this.aiService) {
      const aiChanges = await this.generateAIChanges(specContent, codeChange, 'hook');
      changes.push(...aiChanges);
    } else {
      const hookInfo = await this.extractHookInfo(codeChange);
      if (hookInfo) {
        changes.push({
          type: 'update',
          section: 'Hooks',
          content: `Updated hook: ${hookInfo.name}`,
          details: {
            parameters: hookInfo.parameters,
            returnType: hookInfo.returnType,
            file: codeChange.file
          }
        });
      }
    }

    return changes;
  }

  private async generateAIChanges(
    specContent: string, 
    codeChange: CodeChange, 
    changeType: string
  ): Promise<SpecificationChange[]> {
    const prompt = this.buildAIUpdatePrompt(specContent, codeChange, changeType);
    const response = await this.aiService.generate(prompt);
    return this.parseAIResponse(response);
  }

  private buildAIUpdatePrompt(
    specContent: string, 
    codeChange: CodeChange, 
    changeType: string
  ): string {
    return `
    Analyze the following code change and update the specification accordingly:
    
    Code Change:
    File: ${codeChange.file}
    Type: ${codeChange.type}
    Impact: ${JSON.stringify(codeChange.impact)}
    
    Current Specification:
    ${specContent}
    
    Generate appropriate updates to the specification including:
    1. Updated design sections for new components/APIs
    2. Updated requirements for new features
    3. Updated tasks for implementation changes
    4. Updated data models for type changes
    
    Format the response as a JSON array of changes with:
    - type: "add" | "update" | "remove"
    - section: section name to update
    - content: new content
    - details: additional metadata
    `;
  }

  private parseAIResponse(response: string): SpecificationChange[] {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  private async validateChanges(
    changes: SpecificationChange[], 
    specContent: string
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    for (const change of changes) {
      const validation = await this.validateChange(change, specContent);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(...validation.errors);
      }
      
      result.warnings.push(...validation.warnings);
      result.suggestions.push(...validation.suggestions);
    }

    return result;
  }

  private async validateChange(
    change: SpecificationChange, 
    specContent: string
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check if section exists
    if (!this.sectionExists(specContent, change.section)) {
      result.warnings.push(`Section "${change.section}" does not exist in specification`);
    }

    // Validate content format
    if (change.type === 'update' && !change.content.trim()) {
      result.errors.push('Update content cannot be empty');
      result.isValid = false;
    }

    // Check for conflicts
    if (this.hasConflicts(specContent, change)) {
      result.warnings.push('Potential conflict detected with existing content');
    }

    return result;
  }

  private async detectConflicts(
    changes: SpecificationChange[], 
    specContent: string
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    for (const change of changes) {
      if (this.hasConflicts(specContent, change)) {
        conflicts.push({
          type: 'content',
          description: `Content conflict in section "${change.section}"`,
          resolution: 'manual',
          severity: 'medium'
        });
      }
    }

    return conflicts;
  }

  private sectionExists(specContent: string, section: string): boolean {
    const sectionRegex = new RegExp(`^#+\\s*${section}\\s*$`, 'm');
    return sectionRegex.test(specContent);
  }

  private hasConflicts(specContent: string, change: SpecificationChange): boolean {
    // Simple conflict detection - can be enhanced
    const sectionContent = this.extractSectionContent(specContent, change.section);
    return sectionContent.includes(change.content.substring(0, 50));
  }

  private extractSectionContent(specContent: string, section: string): string {
    const sectionRegex = new RegExp(`^#+\\s*${section}\\s*$([\\s\\S]*?)(?=^#+\\s|$)`, 'm');
    const match = specContent.match(sectionRegex);
    return match ? match[1] : '';
  }

  private calculateConfidence(
    codeChange: CodeChange, 
    mapping: SpecificationMapping, 
    changes: SpecificationChange[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on mapping relevance
    confidence += mapping.relevance * 0.3;

    // Increase confidence based on change impact
    if (codeChange.impact.severity === 'high') confidence += 0.2;
    if (codeChange.impact.severity === 'critical') confidence += 0.3;

    // Decrease confidence if there are conflicts
    if (changes.some(change => this.hasConflicts('', change))) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(confidence, 1.0));
  }

  private determineUpdateType(
    codeChange: CodeChange, 
    mapping: SpecificationMapping
  ): UpdateType {
    if (mapping.specType === 'requirements') return 'requirements';
    if (mapping.specType === 'tasks') return 'tasks';
    if (codeChange.type === 'api') return 'api';
    if (codeChange.type === 'type') return 'data-model';
    return 'design';
  }

  private async readSpecification(specPath: string): Promise<string | null> {
    try {
      return await fs.readFile(specPath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  // Extraction methods for different code types
  private async extractComponentInfo(codeChange: CodeChange): Promise<any> {
    // Implement component info extraction
    return null;
  }

  private async extractServiceInfo(codeChange: CodeChange): Promise<any> {
    // Implement service info extraction
    return null;
  }

  private async extractAPIInfo(codeChange: CodeChange): Promise<any> {
    // Implement API info extraction
    return null;
  }

  private async extractTypeInfo(codeChange: CodeChange): Promise<any> {
    // Implement type info extraction
    return null;
  }

  private async extractHookInfo(codeChange: CodeChange): Promise<any> {
    // Implement hook info extraction
    return null;
  }

  private initializeValidationRules(): void {
    // Initialize validation rules for different specification types
    this.validationRules.set('requirements', [
      { type: 'format', rule: 'EARS format validation' },
      { type: 'completeness', rule: 'All required sections present' }
    ]);
    
    this.validationRules.set('design', [
      { type: 'format', rule: 'Markdown format validation' },
      { type: 'completeness', rule: 'Architecture sections present' }
    ]);
    
    this.validationRules.set('tasks', [
      { type: 'format', rule: 'Task format validation' },
      { type: 'completeness', rule: 'Effort estimates present' }
    ]);
  }
}

interface ValidationRule {
  type: string;
  rule: string;
}
