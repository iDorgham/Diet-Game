import { EventEmitter } from 'events';
import { FileSystemWatcher, FileChange, CodeChange } from './FileSystemWatcher';
import { CodeChangeAnalyzer, SpecificationMapping } from './CodeChangeAnalyzer';
import { SpecificationUpdater, SpecificationUpdate } from './SpecificationUpdater';
import { RealTimeSyncService } from './RealTimeSyncService';

export interface SyncManagerOptions {
  watchPatterns?: string[];
  debounceMs?: number;
  autoUpdate?: boolean;
  enableRealtime?: boolean;
  enableAI?: boolean;
  aiService?: any;
}

export interface SyncStats {
  totalChanges: number;
  processedChanges: number;
  generatedUpdates: number;
  appliedUpdates: number;
  conflicts: number;
  errors: number;
  uptime: number;
}

export class SpecificationSyncManager extends EventEmitter {
  private fileWatcher: FileSystemWatcher;
  private changeAnalyzer: CodeChangeAnalyzer;
  private specificationUpdater: SpecificationUpdater;
  private realTimeSyncService: RealTimeSyncService;
  private isRunning = false;
  private startTime: number = 0;
  private stats: SyncStats = {
    totalChanges: 0,
    processedChanges: 0,
    generatedUpdates: 0,
    appliedUpdates: 0,
    conflicts: 0,
    errors: 0,
    uptime: 0
  };

  constructor(private options: SyncManagerOptions = {}) {
    super();
    
    this.options = {
      watchPatterns: [
        'docs/specs/**/*.md',
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.jsx'
      ],
      debounceMs: 1000,
      autoUpdate: false,
      enableRealtime: true,
      enableAI: false,
      ...options
    };

    this.initializeServices();
    this.setupEventHandlers();
  }

  private initializeServices(): void {
    // Initialize file system watcher
    this.fileWatcher = new FileSystemWatcher({
      debounceMs: this.options.debounceMs
    });

    // Initialize change analyzer
    this.changeAnalyzer = new CodeChangeAnalyzer();

    // Initialize specification updater
    this.specificationUpdater = new SpecificationUpdater(this.options.aiService);

    // Initialize real-time sync service if enabled
    if (this.options.enableRealtime) {
      this.realTimeSyncService = new RealTimeSyncService();
    }
  }

  private setupEventHandlers(): void {
    // File system watcher events
    this.fileWatcher.on('fileChange', this.handleFileChange.bind(this));
    this.fileWatcher.on('error', this.handleError.bind(this));

    // Real-time sync service events
    if (this.realTimeSyncService) {
      this.realTimeSyncService.on('update_broadcast', this.handleUpdateBroadcast.bind(this));
      this.realTimeSyncService.on('conflict_created', this.handleConflictCreated.bind(this));
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      // Start file system watcher
      await this.fileWatcher.startWatching();
      this.emit('fileWatcherStarted');

      // Start real-time sync service if enabled
      if (this.realTimeSyncService) {
        await this.realTimeSyncService.start();
        this.emit('realtimeServiceStarted');
      }

      this.isRunning = true;
      this.startTime = Date.now();
      this.emit('started');

    } catch (error) {
      this.emit('error', { type: 'startup', error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Stop file system watcher
      await this.fileWatcher.stopWatching();
      this.emit('fileWatcherStopped');

      // Stop real-time sync service if enabled
      if (this.realTimeSyncService) {
        await this.realTimeSyncService.stop();
        this.emit('realtimeServiceStopped');
      }

      this.isRunning = false;
      this.emit('stopped');

    } catch (error) {
      this.emit('error', { type: 'shutdown', error });
      throw error;
    }
  }

  private async handleFileChange(change: FileChange): Promise<void> {
    try {
      this.stats.totalChanges++;
      this.emit('fileChange', change);

      // Skip specification files to avoid infinite loops
      if (change.path.includes('docs/specs/')) {
        return;
      }

      // Analyze the change
      const codeChange = await this.changeAnalyzer.analyzeChange(change);
      this.stats.processedChanges++;
      this.emit('codeChangeAnalyzed', codeChange);

      // Find related specifications
      const mappings = await this.changeAnalyzer.getSpecificationMappings(codeChange);
      if (mappings.length === 0) {
        this.emit('noRelatedSpecs', codeChange);
        return;
      }

      // Generate specification updates
      const updates = await this.specificationUpdater.generateUpdates(codeChange, mappings);
      this.stats.generatedUpdates += updates.length;
      this.emit('updatesGenerated', updates);

      // Process each update
      for (const update of updates) {
        await this.processUpdate(update);
      }

    } catch (error) {
      this.stats.errors++;
      this.emit('error', { type: 'fileChange', change, error });
    }
  }

  private async processUpdate(update: SpecificationUpdate): Promise<void> {
    try {
      // Validate update
      if (!update.metadata.validation.isValid) {
        this.emit('updateValidationFailed', update);
        return;
      }

      // Handle conflicts
      if (update.metadata.conflicts.length > 0) {
        this.stats.conflicts += update.metadata.conflicts.length;
        await this.handleConflicts(update);
      }

      // Apply update if auto-update is enabled
      if (this.options.autoUpdate) {
        await this.applyUpdate(update);
      } else {
        // Queue update for manual review
        this.emit('updateQueued', update);
      }

      // Broadcast update if real-time is enabled
      if (this.realTimeSyncService) {
        await this.realTimeSyncService.broadcastSpecificationUpdate(update);
      }

    } catch (error) {
      this.stats.errors++;
      this.emit('error', { type: 'processUpdate', update, error });
    }
  }

  private async handleConflicts(update: SpecificationUpdate): Promise<void> {
    for (const conflict of update.metadata.conflicts) {
      if (this.realTimeSyncService) {
        await this.realTimeSyncService.createConflict({
          type: conflict.type,
          specPath: update.specPath,
          description: conflict.description,
          severity: conflict.severity,
          resolution: conflict.resolution
        });
      }

      this.emit('conflictDetected', { update, conflict });
    }
  }

  private async applyUpdate(update: SpecificationUpdate): Promise<void> {
    try {
      // Apply the update to the specification file
      await this.writeSpecificationUpdate(update);
      this.stats.appliedUpdates++;
      this.emit('updateApplied', update);

    } catch (error) {
      this.stats.errors++;
      this.emit('error', { type: 'applyUpdate', update, error });
    }
  }

  private async writeSpecificationUpdate(update: SpecificationUpdate): Promise<void> {
    const fs = await import('fs/promises');
    
    try {
      // Read current specification
      const currentContent = await fs.readFile(update.specPath, 'utf-8');
      
      // Apply changes
      const updatedContent = this.applyChangesToContent(currentContent, update.changes);
      
      // Write updated content
      await fs.writeFile(update.specPath, updatedContent, 'utf-8');
      
    } catch (error) {
      throw new Error(`Failed to write specification update: ${error.message}`);
    }
  }

  private applyChangesToContent(content: string, changes: any[]): string {
    let updatedContent = content;

    for (const change of changes) {
      switch (change.type) {
        case 'add':
          updatedContent = this.addContent(updatedContent, change);
          break;
        case 'update':
          updatedContent = this.updateContent(updatedContent, change);
          break;
        case 'remove':
          updatedContent = this.removeContent(updatedContent, change);
          break;
      }
    }

    return updatedContent;
  }

  private addContent(content: string, change: any): string {
    // Implement content addition logic
    const sectionRegex = new RegExp(`(^#+\\s*${change.section}\\s*$[\\s\\S]*?)(?=^#+\\s|$)`, 'm');
    const match = content.match(sectionRegex);
    
    if (match) {
      return content.replace(sectionRegex, `${match[1]}\n\n${change.content}\n`);
    } else {
      // Add new section
      return `${content}\n\n## ${change.section}\n\n${change.content}\n`;
    }
  }

  private updateContent(content: string, change: any): string {
    // Implement content update logic
    const sectionRegex = new RegExp(`(^#+\\s*${change.section}\\s*$)([\\s\\S]*?)(?=^#+\\s|$)`, 'm');
    return content.replace(sectionRegex, `$1\n${change.content}\n`);
  }

  private removeContent(content: string, change: any): string {
    // Implement content removal logic
    const sectionRegex = new RegExp(`^#+\\s*${change.section}\\s*$[\\s\\S]*?(?=^#+\\s|$)`, 'm');
    return content.replace(sectionRegex, '');
  }

  private handleError(error: any): void {
    this.stats.errors++;
    this.emit('error', error);
  }

  private handleUpdateBroadcast(data: any): void {
    this.emit('updateBroadcast', data);
  }

  private handleConflictCreated(conflict: any): void {
    this.emit('conflictCreated', conflict);
  }

  // Public API methods
  async generateUpdateForFile(filePath: string): Promise<SpecificationUpdate[]> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      
      const change: FileChange = {
        path: filePath,
        event: 'change',
        timestamp: new Date(),
        content
      };

      const codeChange = await this.changeAnalyzer.analyzeChange(change);
      const mappings = await this.changeAnalyzer.getSpecificationMappings(codeChange);
      const updates = await this.specificationUpdater.generateUpdates(codeChange, mappings);

      return updates;
    } catch (error) {
      this.emit('error', { type: 'generateUpdate', filePath, error });
      return [];
    }
  }

  async applyQueuedUpdate(update: SpecificationUpdate): Promise<void> {
    await this.applyUpdate(update);
  }

  async resolveConflict(conflictId: string, resolution: any): Promise<void> {
    if (this.realTimeSyncService) {
      // Handle conflict resolution through real-time service
      this.emit('conflictResolved', { conflictId, resolution });
    }
  }

  getStats(): SyncStats {
    return {
      ...this.stats,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  getConnectionStats(): any {
    if (this.realTimeSyncService) {
      return this.realTimeSyncService.getConnectionStats();
    }
    return null;
  }

  getActiveConflicts(): any[] {
    if (this.realTimeSyncService) {
      return this.realTimeSyncService.getActiveConflicts();
    }
    return [];
  }

  // Configuration methods
  setAutoUpdate(enabled: boolean): void {
    this.options.autoUpdate = enabled;
    this.emit('configChanged', { autoUpdate: enabled });
  }

  setRealtimeEnabled(enabled: boolean): void {
    this.options.enableRealtime = enabled;
    this.emit('configChanged', { enableRealtime: enabled });
  }

  setAIEnabled(enabled: boolean, aiService?: any): void {
    this.options.enableAI = enabled;
    this.options.aiService = aiService;
    this.emit('configChanged', { enableAI: enabled });
  }
}
