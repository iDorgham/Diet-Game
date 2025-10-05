import { DatabaseService } from '../database/DatabaseService';
import { MLModelService } from '../ml/MLModelService';
import { NotificationService } from '../notifications/NotificationService';

interface TraceabilityEntity {
  id: string;
  type: 'Requirement' | 'Design' | 'Implementation' | 'Test';
  component: string;
  title: string;
  description: string;
  status: 'Draft' | 'Review' | 'Approved' | 'Implemented' | 'Tested';
  createdDate: Date;
  lastModified: Date;
  tags: string[];
  metadata: Record<string, any>;
}

interface TraceabilityRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: 'Implements' | 'Tests' | 'DependsOn' | 'ConflictsWith' | 'Refines';
  strength: number; // 0-1, how strong the relationship is
  confidence: number; // 0-1, confidence in the relationship
  createdDate: Date;
  lastVerified: Date;
}

interface RequirementDesignMapping {
  requirementId: string;
  requirementType: 'EARS' | 'Functional' | 'NonFunctional' | 'UserStory';
  designElements: DesignElement[];
  coverage: number; // Percentage of requirement covered by design
  gaps: string[]; // Missing design elements
  lastUpdated: Date;
}

interface DesignElement {
  id: string;
  type: 'API' | 'DataModel' | 'Component' | 'Service' | 'Interface';
  title: string;
  description: string;
  filePath?: string;
  lineNumbers?: number[];
}

interface TraceabilityMatrix {
  requirementsToDesign: RequirementDesignMapping[];
  designToImplementation: DesignImplementationMapping[];
  requirementsToTests: RequirementTestMapping[];
  crossComponentDependencies: ComponentDependency[];
  changeImpactAnalysis: ChangeImpact[];
}

interface DesignImplementationMapping {
  designElementId: string;
  implementationFiles: string[];
  codeCoverage: number;
  testCoverage: number;
  complexity: 'Low' | 'Medium' | 'High';
  lastUpdated: Date;
}

interface RequirementTestMapping {
  requirementId: string;
  testCases: TestCase[];
  coverage: number;
  lastUpdated: Date;
}

interface TestCase {
  id: string;
  title: string;
  type: 'Unit' | 'Integration' | 'E2E' | 'Performance';
  filePath: string;
  status: 'Pass' | 'Fail' | 'Pending' | 'Skipped';
}

interface ComponentDependency {
  sourceComponent: string;
  targetComponent: string;
  dependencyType: 'Direct' | 'Indirect' | 'Data' | 'API';
  strength: number;
  description: string;
}

interface ChangeImpact {
  changeId: string;
  affectedRequirements: string[];
  affectedDesignElements: string[];
  affectedImplementationFiles: string[];
  affectedTests: string[];
  estimatedEffort: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  dependencies: string[];
  recommendations: string[];
}

export class TraceabilityMatrixEngine {
  private db: DatabaseService;
  private mlService: MLModelService;
  private notificationService: NotificationService;

  constructor() {
    this.db = new DatabaseService();
    this.mlService = new MLModelService();
    this.notificationService = new NotificationService();
  }

  /**
   * Create a new traceability entity
   */
  async createEntity(entity: Omit<TraceabilityEntity, 'id' | 'createdDate' | 'lastModified'>): Promise<TraceabilityEntity> {
    const newEntity: TraceabilityEntity = {
      ...entity,
      id: this.generateId(),
      createdDate: new Date(),
      lastModified: new Date()
    };

    await this.db.insert('traceability_entities', newEntity);
    
    // Notify stakeholders of new entity
    await this.notificationService.notifyEntityCreated(newEntity);
    
    return newEntity;
  }

  /**
   * Create a traceability relationship between entities
   */
  async createRelationship(relationship: Omit<TraceabilityRelationship, 'id' | 'createdDate' | 'lastVerified'>): Promise<TraceabilityRelationship> {
    const newRelationship: TraceabilityRelationship = {
      ...relationship,
      id: this.generateId(),
      createdDate: new Date(),
      lastVerified: new Date()
    };

    // Validate relationship
    await this.validateRelationship(newRelationship);

    await this.db.insert('traceability_relationships', newRelationship);
    
    // Update traceability matrix
    await this.updateTraceabilityMatrix(newRelationship);
    
    return newRelationship;
  }

  /**
   * Get complete traceability matrix for a component
   */
  async getTraceabilityMatrix(component?: string): Promise<TraceabilityMatrix> {
    const entities = await this.db.query('traceability_entities', { component });
    const relationships = await this.db.query('traceability_relationships');

    // Build requirements to design mapping
    const requirementsToDesign = await this.buildRequirementsToDesignMapping(entities, relationships);
    
    // Build design to implementation mapping
    const designToImplementation = await this.buildDesignToImplementationMapping(entities, relationships);
    
    // Build requirements to tests mapping
    const requirementsToTests = await this.buildRequirementsToTestsMapping(entities, relationships);
    
    // Build cross-component dependencies
    const crossComponentDependencies = await this.buildCrossComponentDependencies(entities, relationships);
    
    // Get change impact analysis
    const changeImpactAnalysis = await this.getChangeImpactAnalysis();

    return {
      requirementsToDesign,
      designToImplementation,
      requirementsToTests,
      crossComponentDependencies,
      changeImpactAnalysis
    };
  }

  /**
   * Analyze change impact on traceability
   */
  async analyzeChangeImpact(change: ChangeRequest): Promise<ChangeImpact> {
    const affectedEntities = await this.findAffectedEntities(change);
    const affectedRelationships = await this.findAffectedRelationships(change);
    
    // Use ML to predict impact
    const impactPrediction = await this.mlService.predictChangeImpact(change, affectedEntities);
    
    const changeImpact: ChangeImpact = {
      changeId: change.id,
      affectedRequirements: affectedEntities.filter(e => e.type === 'Requirement').map(e => e.id),
      affectedDesignElements: affectedEntities.filter(e => e.type === 'Design').map(e => e.id),
      affectedImplementationFiles: affectedEntities.filter(e => e.type === 'Implementation').map(e => e.id),
      affectedTests: affectedEntities.filter(e => e.type === 'Test').map(e => e.id),
      estimatedEffort: impactPrediction.estimatedEffort,
      riskLevel: impactPrediction.riskLevel,
      dependencies: affectedRelationships.map(r => r.targetId),
      recommendations: impactPrediction.recommendations
    };

    // Store change impact analysis
    await this.db.insert('change_impact_analysis', changeImpact);
    
    // Notify stakeholders if high impact
    if (changeImpact.riskLevel === 'High' || changeImpact.riskLevel === 'Critical') {
      await this.notificationService.notifyHighImpactChange(changeImpact);
    }

    return changeImpact;
  }

  /**
   * Update traceability matrix when changes occur
   */
  async updateTraceabilityMatrix(change: ChangeRequest): Promise<void> {
    const impact = await this.analyzeChangeImpact(change);
    
    // Update affected relationships
    for (const relationshipId of impact.dependencies) {
      const relationship = await this.db.get('traceability_relationships', relationshipId);
      if (relationship) {
        // Recalculate relationship strength
        relationship.strength = await this.calculateRelationshipStrength(relationship);
        relationship.lastVerified = new Date();
        
        await this.db.update('traceability_relationships', relationshipId, relationship);
      }
    }
    
    // Update entity statuses
    for (const entityId of [
      ...impact.affectedRequirements,
      ...impact.affectedDesignElements,
      ...impact.affectedImplementationFiles,
      ...impact.affectedTests
    ]) {
      const entity = await this.db.get('traceability_entities', entityId);
      if (entity) {
        entity.lastModified = new Date();
        await this.db.update('traceability_entities', entityId, entity);
      }
    }
  }

  /**
   * Calculate traceability coverage metrics
   */
  async calculateCoverageMetrics(component?: string): Promise<CoverageMetrics> {
    const matrix = await this.getTraceabilityMatrix(component);
    
    const totalRequirements = matrix.requirementsToDesign.length;
    const coveredRequirements = matrix.requirementsToDesign.filter(m => m.coverage > 0).length;
    const requirementsCoverage = totalRequirements > 0 ? (coveredRequirements / totalRequirements) * 100 : 0;
    
    const totalDesignElements = matrix.designToImplementation.length;
    const implementedDesignElements = matrix.designToImplementation.filter(m => m.implementationFiles.length > 0).length;
    const designCoverage = totalDesignElements > 0 ? (implementedDesignElements / totalDesignElements) * 100 : 0;
    
    const totalTestRequirements = matrix.requirementsToTests.length;
    const testedRequirements = matrix.requirementsToTests.filter(m => m.coverage > 0).length;
    const testCoverage = totalTestRequirements > 0 ? (testedRequirements / totalTestRequirements) * 100 : 0;
    
    return {
      requirementsCoverage,
      designCoverage,
      testCoverage,
      overallCoverage: (requirementsCoverage + designCoverage + testCoverage) / 3,
      gaps: await this.identifyCoverageGaps(matrix)
    };
  }

  /**
   * Find traceability gaps and inconsistencies
   */
  async identifyGaps(): Promise<TraceabilityGap[]> {
    const matrix = await this.getTraceabilityMatrix();
    const gaps: TraceabilityGap[] = [];
    
    // Find requirements without design coverage
    for (const reqMapping of matrix.requirementsToDesign) {
      if (reqMapping.coverage < 100) {
        gaps.push({
          type: 'MissingDesign',
          sourceId: reqMapping.requirementId,
          description: `Requirement ${reqMapping.requirementId} has incomplete design coverage (${reqMapping.coverage}%)`,
          severity: reqMapping.coverage < 50 ? 'High' : 'Medium',
          recommendations: ['Create missing design elements', 'Update existing design elements']
        });
      }
    }
    
    // Find design elements without implementation
    for (const designMapping of matrix.designToImplementation) {
      if (designMapping.implementationFiles.length === 0) {
        gaps.push({
          type: 'MissingImplementation',
          sourceId: designMapping.designElementId,
          description: `Design element ${designMapping.designElementId} has no implementation`,
          severity: 'High',
          recommendations: ['Implement design element', 'Update design if not needed']
        });
      }
    }
    
    // Find requirements without tests
    for (const testMapping of matrix.requirementsToTests) {
      if (testMapping.coverage < 100) {
        gaps.push({
          type: 'MissingTests',
          sourceId: testMapping.requirementId,
          description: `Requirement ${testMapping.requirementId} has incomplete test coverage (${testMapping.coverage}%)`,
          severity: testMapping.coverage < 50 ? 'High' : 'Medium',
          recommendations: ['Create missing test cases', 'Update existing test cases']
        });
      }
    }
    
    return gaps;
  }

  /**
   * Generate traceability report
   */
  async generateTraceabilityReport(component?: string): Promise<TraceabilityReport> {
    const matrix = await this.getTraceabilityMatrix(component);
    const coverage = await this.calculateCoverageMetrics(component);
    const gaps = await this.identifyGaps();
    
    return {
      component,
      generatedAt: new Date(),
      summary: {
        totalEntities: matrix.requirementsToDesign.length + matrix.designToImplementation.length + matrix.requirementsToTests.length,
        totalRelationships: matrix.crossComponentDependencies.length,
        coverageMetrics: coverage,
        gapCount: gaps.length
      },
      matrix,
      coverage,
      gaps,
      recommendations: await this.generateRecommendations(matrix, coverage, gaps)
    };
  }

  // Private helper methods

  private async buildRequirementsToDesignMapping(entities: TraceabilityEntity[], relationships: TraceabilityRelationship[]): Promise<RequirementDesignMapping[]> {
    const mappings: RequirementDesignMapping[] = [];
    
    const requirements = entities.filter(e => e.type === 'Requirement');
    
    for (const requirement of requirements) {
      const designRelationships = relationships.filter(r => 
        r.sourceId === requirement.id && r.relationshipType === 'Refines'
      );
      
      const designElements = designRelationships.map(r => {
        const designEntity = entities.find(e => e.id === r.targetId);
        return designEntity ? this.mapEntityToDesignElement(designEntity) : null;
      }).filter(Boolean) as DesignElement[];
      
      const coverage = designElements.length > 0 ? 100 : 0;
      const gaps = coverage < 100 ? ['No design elements found'] : [];
      
      mappings.push({
        requirementId: requirement.id,
        requirementType: requirement.metadata.type as any,
        designElements,
        coverage,
        gaps,
        lastUpdated: new Date()
      });
    }
    
    return mappings;
  }

  private async buildDesignToImplementationMapping(entities: TraceabilityEntity[], relationships: TraceabilityRelationship[]): Promise<DesignImplementationMapping[]> {
    const mappings: DesignImplementationMapping[] = [];
    
    const designElements = entities.filter(e => e.type === 'Design');
    
    for (const design of designElements) {
      const implementationRelationships = relationships.filter(r => 
        r.sourceId === design.id && r.relationshipType === 'Implements'
      );
      
      const implementationFiles = implementationRelationships.map(r => {
        const implEntity = entities.find(e => e.id === r.targetId);
        return implEntity?.metadata.filePath || implEntity?.id;
      }).filter(Boolean) as string[];
      
      mappings.push({
        designElementId: design.id,
        implementationFiles,
        codeCoverage: implementationFiles.length > 0 ? 100 : 0,
        testCoverage: 0, // TODO: Calculate from test relationships
        complexity: this.calculateComplexity(design),
        lastUpdated: new Date()
      });
    }
    
    return mappings;
  }

  private async buildRequirementsToTestsMapping(entities: TraceabilityEntity[], relationships: TraceabilityRelationship[]): Promise<RequirementTestMapping[]> {
    const mappings: RequirementTestMapping[] = [];
    
    const requirements = entities.filter(e => e.type === 'Requirement');
    
    for (const requirement of requirements) {
      const testRelationships = relationships.filter(r => 
        r.sourceId === requirement.id && r.relationshipType === 'Tests'
      );
      
      const testCases = testRelationships.map(r => {
        const testEntity = entities.find(e => e.id === r.targetId);
        return testEntity ? this.mapEntityToTestCase(testEntity) : null;
      }).filter(Boolean) as TestCase[];
      
      const coverage = testCases.length > 0 ? 100 : 0;
      
      mappings.push({
        requirementId: requirement.id,
        testCases,
        coverage,
        lastUpdated: new Date()
      });
    }
    
    return mappings;
  }

  private async buildCrossComponentDependencies(entities: TraceabilityEntity[], relationships: TraceabilityRelationship[]): Promise<ComponentDependency[]> {
    const dependencies: ComponentDependency[] = [];
    const components = [...new Set(entities.map(e => e.component))];
    
    for (const sourceComponent of components) {
      for (const targetComponent of components) {
        if (sourceComponent !== targetComponent) {
          const crossRelationships = relationships.filter(r => {
            const sourceEntity = entities.find(e => e.id === r.sourceId);
            const targetEntity = entities.find(e => e.id === r.targetId);
            return sourceEntity?.component === sourceComponent && targetEntity?.component === targetComponent;
          });
          
          if (crossRelationships.length > 0) {
            dependencies.push({
              sourceComponent,
              targetComponent,
              dependencyType: 'Direct',
              strength: crossRelationships.reduce((sum, r) => sum + r.strength, 0) / crossRelationships.length,
              description: `${crossRelationships.length} relationships between ${sourceComponent} and ${targetComponent}`
            });
          }
        }
      }
    }
    
    return dependencies;
  }

  private async getChangeImpactAnalysis(): Promise<ChangeImpact[]> {
    return await this.db.query('change_impact_analysis', {}, { limit: 10, orderBy: 'createdDate', order: 'DESC' });
  }

  private async findAffectedEntities(change: ChangeRequest): Promise<TraceabilityEntity[]> {
    // Find entities affected by the change based on file paths, component, or tags
    const conditions: any = {};
    
    if (change.filePaths) {
      conditions.metadata = { filePath: { $in: change.filePaths } };
    }
    
    if (change.component) {
      conditions.component = change.component;
    }
    
    if (change.tags) {
      conditions.tags = { $in: change.tags };
    }
    
    return await this.db.query('traceability_entities', conditions);
  }

  private async findAffectedRelationships(change: ChangeRequest): Promise<TraceabilityRelationship[]> {
    const affectedEntities = await this.findAffectedEntities(change);
    const entityIds = affectedEntities.map(e => e.id);
    
    return await this.db.query('traceability_relationships', {
      $or: [
        { sourceId: { $in: entityIds } },
        { targetId: { $in: entityIds } }
      ]
    });
  }

  private async calculateRelationshipStrength(relationship: TraceabilityRelationship): Promise<number> {
    // Use ML model to calculate relationship strength based on various factors
    const factors = {
      relationshipType: relationship.relationshipType,
      confidence: relationship.confidence,
      age: Date.now() - relationship.createdDate.getTime(),
      verificationFrequency: Date.now() - relationship.lastVerified.getTime()
    };
    
    return await this.mlService.calculateRelationshipStrength(factors);
  }

  private async validateRelationship(relationship: TraceabilityRelationship): Promise<void> {
    // Validate that source and target entities exist
    const sourceEntity = await this.db.get('traceability_entities', relationship.sourceId);
    const targetEntity = await this.db.get('traceability_entities', relationship.targetId);
    
    if (!sourceEntity || !targetEntity) {
      throw new Error('Source or target entity not found');
    }
    
    // Validate relationship type compatibility
    const validTypes = this.getValidRelationshipTypes(sourceEntity.type, targetEntity.type);
    if (!validTypes.includes(relationship.relationshipType)) {
      throw new Error(`Invalid relationship type ${relationship.relationshipType} between ${sourceEntity.type} and ${targetEntity.type}`);
    }
  }

  private getValidRelationshipTypes(sourceType: string, targetType: string): string[] {
    const validTypes: Record<string, string[]> = {
      'Requirement-Design': ['Refines'],
      'Design-Implementation': ['Implements'],
      'Requirement-Test': ['Tests'],
      'Implementation-Test': ['Tests'],
      'Design-Design': ['DependsOn', 'ConflictsWith'],
      'Implementation-Implementation': ['DependsOn', 'ConflictsWith']
    };
    
    return validTypes[`${sourceType}-${targetType}`] || [];
  }

  private mapEntityToDesignElement(entity: TraceabilityEntity): DesignElement {
    return {
      id: entity.id,
      type: entity.metadata.type as any,
      title: entity.title,
      description: entity.description,
      filePath: entity.metadata.filePath,
      lineNumbers: entity.metadata.lineNumbers
    };
  }

  private mapEntityToTestCase(entity: TraceabilityEntity): TestCase {
    return {
      id: entity.id,
      title: entity.title,
      type: entity.metadata.testType as any,
      filePath: entity.metadata.filePath,
      status: entity.status as any
    };
  }

  private calculateComplexity(entity: TraceabilityEntity): 'Low' | 'Medium' | 'High' {
    // Simple complexity calculation based on description length and metadata
    const descriptionLength = entity.description.length;
    const metadataKeys = Object.keys(entity.metadata).length;
    
    const complexityScore = descriptionLength / 100 + metadataKeys;
    
    if (complexityScore < 5) return 'Low';
    if (complexityScore < 15) return 'Medium';
    return 'High';
  }

  private async generateRecommendations(matrix: TraceabilityMatrix, coverage: CoverageMetrics, gaps: TraceabilityGap[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (coverage.overallCoverage < 80) {
      recommendations.push('Improve overall traceability coverage to at least 80%');
    }
    
    if (gaps.length > 0) {
      recommendations.push(`Address ${gaps.length} identified traceability gaps`);
    }
    
    if (coverage.requirementsCoverage < 90) {
      recommendations.push('Ensure all requirements have corresponding design elements');
    }
    
    if (coverage.testCoverage < 80) {
      recommendations.push('Improve test coverage for requirements');
    }
    
    return recommendations;
  }

  private generateId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Supporting interfaces
interface ChangeRequest {
  id: string;
  type: 'Requirement' | 'Design' | 'Implementation' | 'Test';
  component?: string;
  filePaths?: string[];
  tags?: string[];
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface CoverageMetrics {
  requirementsCoverage: number;
  designCoverage: number;
  testCoverage: number;
  overallCoverage: number;
  gaps: TraceabilityGap[];
}

interface TraceabilityGap {
  type: 'MissingDesign' | 'MissingImplementation' | 'MissingTests' | 'InconsistentRelationship';
  sourceId: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
}

interface TraceabilityReport {
  component?: string;
  generatedAt: Date;
  summary: {
    totalEntities: number;
    totalRelationships: number;
    coverageMetrics: CoverageMetrics;
    gapCount: number;
  };
  matrix: TraceabilityMatrix;
  coverage: CoverageMetrics;
  gaps: TraceabilityGap[];
  recommendations: string[];
}

