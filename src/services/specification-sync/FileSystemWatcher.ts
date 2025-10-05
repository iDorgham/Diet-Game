import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export interface FileChange {
  path: string;
  event: 'change' | 'add' | 'unlink';
  timestamp: Date;
  content?: string;
  hash?: string;
}

export interface CodeChange {
  file: string;
  type: ChangeType;
  impact: ChangeImpact;
  specifications: string[];
  timestamp: Date;
  hash: string;
}

export interface ChangeImpact {
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSystems: string[];
  breakingChanges: string[];
  newFeatures: string[];
  bugFixes: string[];
}

export type ChangeType = 
  | 'specification' 
  | 'component' 
  | 'service' 
  | 'hook' 
  | 'type' 
  | 'api' 
  | 'test' 
  | 'other';

export class FileSystemWatcher extends EventEmitter {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private isWatching = false;
  private changeBuffer: Map<string, FileChange> = new Map();
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor(private options: WatcherOptions = {}) {
    super();
    this.options = {
      debounceMs: 1000,
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      ...options
    };
  }

  async startWatching(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    const watchPatterns = [
      'docs/specs/**/*.md',
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx',
      'src/**/*.json'
    ];

    for (const pattern of watchPatterns) {
      const watcher = chokidar.watch(pattern, {
        ignored: this.options.ignored,
        persistent: this.options.persistent,
        ignoreInitial: this.options.ignoreInitial
      });

      watcher.on('change', (filePath) => this.handleFileChange(filePath, 'change'));
      watcher.on('add', (filePath) => this.handleFileChange(filePath, 'add'));
      watcher.on('unlink', (filePath) => this.handleFileChange(filePath, 'unlink'));

      this.watchers.set(pattern, watcher);
    }

    this.isWatching = true;
    this.emit('started');
  }

  async stopWatching(): Promise<void> {
    if (!this.isWatching) {
      return;
    }

    for (const [pattern, watcher] of this.watchers) {
      await watcher.close();
    }

    this.watchers.clear();
    this.isWatching = false;
    this.emit('stopped');
  }

  private async handleFileChange(filePath: string, event: 'change' | 'add' | 'unlink'): Promise<void> {
    try {
      const change: FileChange = {
        path: filePath,
        event,
        timestamp: new Date(),
        content: event !== 'unlink' ? await this.readFileContent(filePath) : undefined,
        hash: event !== 'unlink' ? await this.calculateFileHash(filePath) : undefined
      };

      // Buffer changes to debounce rapid file changes
      this.changeBuffer.set(filePath, change);
      
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      this.debounceTimeout = setTimeout(() => {
        this.processBufferedChanges();
      }, this.options.debounceMs);

    } catch (error) {
      this.emit('error', { filePath, event, error });
    }
  }

  private async processBufferedChanges(): Promise<void> {
    const changes = Array.from(this.changeBuffer.values());
    this.changeBuffer.clear();

    for (const change of changes) {
      this.emit('fileChange', change);
    }
  }

  private async readFileContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      // File might not exist or be accessible
      return '';
    }
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const content = await this.readFileContent(filePath);
      const crypto = await import('crypto');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }

  getWatchedFiles(): string[] {
    const files: string[] = [];
    for (const watcher of this.watchers.values()) {
      files.push(...watcher.getWatched());
    }
    return files;
  }

  isFileWatched(filePath: string): boolean {
    for (const watcher of this.watchers.values()) {
      if (watcher.getWatched().includes(filePath)) {
        return true;
      }
    }
    return false;
  }
}

export interface WatcherOptions {
  debounceMs?: number;
  ignored?: RegExp | RegExp[];
  persistent?: boolean;
  ignoreInitial?: boolean;
}
