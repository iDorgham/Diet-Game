import { FileChange, CodeChange, ChangeImpact, ChangeType } from './FileSystemWatcher';
import fs from 'fs/promises';
import path from 'path';

export interface SpecificationMapping {
  specPath: string;
  specType: 'requirements' | 'design' | 'tasks';
  relevance: number;
  sections: string[];
}

export class CodeChangeAnalyzer {
  private specMappings: Map<string, string[]> = new Map();
  private impactKeywords: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSpecMappings();
    this.initializeImpactKeywords();
  }

  async analyzeChange(change: FileChange): Promise<CodeChange> {
    const analysis: CodeChange = {
      file: change.path,
      type: this.determineChangeType(change),
      impact: await this.analyzeImpact(change),
      specifications: await this.findRelatedSpecs(change),
      timestamp: change.timestamp,
      hash: change.hash || ''
    };

    return analysis;
  }

  private determineChangeType(change: FileChange): ChangeType {
    const filePath = change.path.toLowerCase();

    if (filePath.includes('docs/specs/')) {
      return 'specification';
    } else if (filePath.includes('src/components/')) {
      return 'component';
    } else if (filePath.includes('src/services/')) {
      return 'service';
    } else if (filePath.includes('src/hooks/')) {
      return 'hook';
    } else if (filePath.includes('src/types/') || filePath.includes('src/interfaces/')) {
      return 'type';
    } else if (filePath.includes('src/api/') || filePath.includes('src/endpoints/')) {
      return 'api';
    } else if (filePath.includes('test/') || filePath.includes('__tests__/') || filePath.includes('.test.')) {
      return 'test';
    }

    return 'other';
  }

  private async analyzeImpact(change: FileChange): Promise<ChangeImpact> {
    const impact: ChangeImpact = {
      severity: 'low',
      affectedSystems: [],
      breakingChanges: [],
      newFeatures: [],
      bugFixes: []
    };

    if (!change.content) {
      return impact;
    }

    const content = change.content.toLowerCase();

    // Check for breaking changes
    if (this.containsBreakingChange(content)) {
      impact.severity = 'high';
      impact.breakingChanges.push('Breaking change detected in code');
    }

    // Check for new features
    if (this.containsNewFeature(content)) {
      impact.newFeatures.push('New feature implementation detected');
      if (impact.severity === 'low') {
        impact.severity = 'medium';
      }
    }

    // Check for bug fixes
    if (this.containsBugFix(content)) {
      impact.bugFixes.push('Bug fix implementation detected');
    }

    // Analyze affected systems
    impact.affectedSystems = this.analyzeAffectedSystems(change.path, content);

    return impact;
  }

  private containsBreakingChange(content: string): boolean {
    const breakingKeywords = [
      'breaking change',
      '@deprecated',
      'remove',
      'delete',
      'rename',
      'migrate',
      'upgrade',
      'breaking:',
      'breaking -'
    ];

    return breakingKeywords.some(keyword => content.includes(keyword));
  }

  private containsNewFeature(content: string): boolean {
    const featureKeywords = [
      '@feature',
      'new feature',
      'add feature',
      'implement',
      'create new',
      'feature:',
      'feat:',
      'new:',
      'add:'
    ];

    return featureKeywords.some(keyword => content.includes(keyword));
  }

  private containsBugFix(content: string): boolean {
    const fixKeywords = [
      '@fix',
      'bug fix',
      'fix bug',
      'resolve',
      'fix:',
      'bugfix:',
      'patch:',
      'hotfix:'
    ];

    return fixKeywords.some(keyword => content.includes(keyword));
  }

  private analyzeAffectedSystems(filePath: string, content: string): string[] {
    const systems: string[] = [];

    // Analyze file path
    if (filePath.includes('ai-coach')) systems.push('ai-coach-system');
    if (filePath.includes('api')) systems.push('api-endpoints');
    if (filePath.includes('database') || filePath.includes('schema')) systems.push('database-schema');
    if (filePath.includes('gamification') || filePath.includes('xp') || filePath.includes('achievement')) {
      systems.push('gamification-engine');
    }
    if (filePath.includes('social') || filePath.includes('community')) systems.push('social-community');
    if (filePath.includes('nutrition') || filePath.includes('food')) systems.push('nutrition-tracking');
    if (filePath.includes('homepage') || filePath.includes('landing')) systems.push('homepage');
    if (filePath.includes('deployment') || filePath.includes('infrastructure')) {
      systems.push('deployment-infrastructure');
    }

    // Analyze content for system indicators
    const systemKeywords = this.impactKeywords.get('systems') || [];
    for (const keyword of systemKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        const system = this.mapKeywordToSystem(keyword);
        if (system && !systems.includes(system)) {
          systems.push(system);
        }
      }
    }

    return systems;
  }

  private async findRelatedSpecs(change: FileChange): Promise<string[]> {
    const relatedSpecs: string[] = [];
    const filePath = change.path;

    // Direct specification mapping
    for (const [srcPattern, specPatterns] of this.specMappings) {
      if (filePath.includes(srcPattern)) {
        for (const specPattern of specPatterns) {
          const specPath = this.mapFilePathToSpecPath(filePath, srcPattern, specPattern);
          if (specPath && await this.specExists(specPath)) {
            relatedSpecs.push(specPath);
          }
        }
      }
    }

    // Content-based specification detection
    if (change.content) {
      const contentSpecs = await this.findSpecsByContent(change.content);
      relatedSpecs.push(...contentSpecs);
    }

    return [...new Set(relatedSpecs)]; // Remove duplicates
  }

  private mapFilePathToSpecPath(filePath: string, srcPattern: string, specPattern: string): string {
    const relativePath = filePath.replace(srcPattern, '');
    const specPath = path.join('docs/specs', specPattern, relativePath);
    
    // Convert file extension to .md
    return specPath.replace(/\.(ts|tsx|js|jsx)$/, '.md');
  }

  private async specExists(specPath: string): Promise<boolean> {
    try {
      await fs.access(specPath);
      return true;
    } catch {
      return false;
    }
  }

  private async findSpecsByContent(content: string): Promise<string[]> {
    const specs: string[] = [];
    const contentLower = content.toLowerCase();

    // Look for system-specific keywords
    const systemKeywords = this.impactKeywords.get('systems') || [];
    for (const keyword of systemKeywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        const system = this.mapKeywordToSystem(keyword);
        if (system) {
          const specPath = `docs/specs/${system}/design.md`;
          if (await this.specExists(specPath)) {
            specs.push(specPath);
          }
        }
      }
    }

    return specs;
  }

  private mapKeywordToSystem(keyword: string): string | null {
    const keywordMap: Record<string, string> = {
      'ai': 'ai-coach-system',
      'coach': 'ai-coach-system',
      'recommendation': 'ai-coach-system',
      'api': 'api-endpoints',
      'endpoint': 'api-endpoints',
      'database': 'database-schema',
      'schema': 'database-schema',
      'gamification': 'gamification-engine',
      'xp': 'gamification-engine',
      'achievement': 'gamification-engine',
      'quest': 'gamification-engine',
      'social': 'social-community',
      'community': 'social-community',
      'friend': 'social-community',
      'nutrition': 'nutrition-tracking',
      'food': 'nutrition-tracking',
      'meal': 'nutrition-tracking',
      'homepage': 'homepage',
      'landing': 'homepage',
      'deployment': 'deployment-infrastructure',
      'infrastructure': 'deployment-infrastructure'
    };

    return keywordMap[keyword.toLowerCase()] || null;
  }

  private initializeSpecMappings(): void {
    this.specMappings.set('src/components/', [
      'component-architecture/',
      'ui-components/'
    ]);
    
    this.specMappings.set('src/services/', [
      'api-architecture/',
      'ai-coach-system/',
      'gamification-engine/',
      'social-community/',
      'nutrition-tracking/'
    ]);
    
    this.specMappings.set('src/hooks/', [
      'component-architecture/',
      'api-architecture/'
    ]);
    
    this.specMappings.set('src/types/', [
      'database-schema/',
      'api-architecture/',
      'ai-coach-system/',
      'gamification-engine/',
      'social-community/',
      'nutrition-tracking/'
    ]);
    
    this.specMappings.set('src/api/', [
      'api-endpoints/',
      'api-architecture/'
    ]);
  }

  private initializeImpactKeywords(): void {
    this.impactKeywords.set('systems', [
      'ai', 'coach', 'recommendation', 'api', 'endpoint', 'database', 'schema',
      'gamification', 'xp', 'achievement', 'quest', 'social', 'community',
      'friend', 'nutrition', 'food', 'meal', 'homepage', 'landing',
      'deployment', 'infrastructure'
    ]);
  }

  async getSpecificationMappings(codeChange: CodeChange): Promise<SpecificationMapping[]> {
    const mappings: SpecificationMapping[] = [];

    for (const specPath of codeChange.specifications) {
      const mapping: SpecificationMapping = {
        specPath,
        specType: this.determineSpecType(specPath),
        relevance: this.calculateRelevance(codeChange, specPath),
        sections: this.determineRelevantSections(codeChange, specPath)
      };

      mappings.push(mapping);
    }

    return mappings.sort((a, b) => b.relevance - a.relevance);
  }

  private determineSpecType(specPath: string): 'requirements' | 'design' | 'tasks' {
    if (specPath.includes('requirements.md')) return 'requirements';
    if (specPath.includes('tasks.md')) return 'tasks';
    return 'design';
  }

  private calculateRelevance(codeChange: CodeChange, specPath: string): number {
    let relevance = 0.5; // Base relevance

    // Increase relevance based on change type and spec type
    if (codeChange.type === 'component' && specPath.includes('design.md')) {
      relevance += 0.3;
    }
    if (codeChange.type === 'api' && specPath.includes('design.md')) {
      relevance += 0.3;
    }
    if (codeChange.type === 'type' && specPath.includes('requirements.md')) {
      relevance += 0.2;
    }

    // Increase relevance based on impact severity
    if (codeChange.impact.severity === 'high') relevance += 0.2;
    if (codeChange.impact.severity === 'critical') relevance += 0.3;

    return Math.min(relevance, 1.0);
  }

  private determineRelevantSections(codeChange: CodeChange, specPath: string): string[] {
    const sections: string[] = [];

    if (codeChange.type === 'component') {
      sections.push('Architecture', 'Components', 'UI/UX');
    }
    if (codeChange.type === 'api') {
      sections.push('API Endpoints', 'Authentication', 'Data Models');
    }
    if (codeChange.type === 'service') {
      sections.push('Services', 'Integration', 'Business Logic');
    }
    if (codeChange.type === 'type') {
      sections.push('Data Models', 'Interfaces', 'Types');
    }

    return sections;
  }
}
