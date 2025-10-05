#!/usr/bin/env node

const { SpecificationSyncManager } = require('../src/services/specification-sync/SpecificationSyncManager');
const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');

const program = new Command();

program
  .name('spec-sync')
  .description('Real-time specification synchronization tool')
  .version('1.0.0');

// Start the sync service
program
  .command('start')
  .description('Start the specification sync service')
  .option('-p, --port <port>', 'WebSocket port', '8080')
  .option('-a, --auto-update', 'Enable automatic updates', false)
  .option('--no-realtime', 'Disable real-time features')
  .option('--ai', 'Enable AI-powered updates')
  .action(async (options) => {
    try {
      console.log('🚀 Starting Specification Sync Service...');
      
      const syncManager = new SpecificationSyncManager({
        enableRealtime: options.realtime,
        autoUpdate: options.autoUpdate,
        enableAI: options.ai
      });

      // Set up event handlers
      syncManager.on('started', () => {
        console.log('✅ Specification sync service started');
        console.log(`📡 WebSocket server running on port ${options.port}`);
        console.log(`🔄 Auto-update: ${options.autoUpdate ? 'enabled' : 'disabled'}`);
        console.log(`🤖 AI updates: ${options.ai ? 'enabled' : 'disabled'}`);
      });

      syncManager.on('fileChange', (change) => {
        console.log(`📝 File changed: ${change.path}`);
      });

      syncManager.on('codeChangeAnalyzed', (codeChange) => {
        console.log(`🔍 Code change analyzed: ${codeChange.type} - ${codeChange.file}`);
      });

      syncManager.on('updatesGenerated', (updates) => {
        console.log(`📋 Generated ${updates.length} specification updates`);
      });

      syncManager.on('updateApplied', (update) => {
        console.log(`✅ Applied update to: ${update.specPath}`);
      });

      syncManager.on('conflictDetected', ({ update, conflict }) => {
        console.log(`⚠️  Conflict detected in: ${update.specPath}`);
        console.log(`   ${conflict.description}`);
      });

      syncManager.on('error', (error) => {
        console.error('❌ Error:', error);
      });

      await syncManager.start();

      // Keep the process running
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down...');
        await syncManager.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to start sync service:', error);
      process.exit(1);
    }
  });

// Generate updates for a specific file
program
  .command('generate <file>')
  .description('Generate specification updates for a specific file')
  .option('-o, --output <file>', 'Output file for updates')
  .option('--dry-run', 'Show updates without applying them')
  .action(async (file, options) => {
    try {
      console.log(`🔍 Analyzing file: ${file}`);
      
      const syncManager = new SpecificationSyncManager({
        enableRealtime: false,
        autoUpdate: false
      });

      const updates = await syncManager.generateUpdateForFile(file);
      
      if (updates.length === 0) {
        console.log('ℹ️  No specification updates needed for this file');
        return;
      }

      console.log(`📋 Generated ${updates.length} updates:`);
      
      for (const update of updates) {
        console.log(`\n📄 ${update.specPath}`);
        console.log(`   Type: ${update.type}`);
        console.log(`   Confidence: ${(update.confidence * 100).toFixed(1)}%`);
        console.log(`   Changes: ${update.changes.length}`);
        
        if (update.metadata.conflicts.length > 0) {
          console.log(`   ⚠️  Conflicts: ${update.metadata.conflicts.length}`);
        }
      }

      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(updates, null, 2));
        console.log(`\n💾 Updates saved to: ${options.output}`);
      }

      if (options.dryRun) {
        console.log('\n🔍 Dry run complete - no changes applied');
      } else {
        console.log('\n❓ Apply these updates? (y/N)');
        // In a real implementation, you'd handle user input here
      }

    } catch (error) {
      console.error('❌ Failed to generate updates:', error);
      process.exit(1);
    }
  });

// Validate specifications
program
  .command('validate')
  .description('Validate all specifications')
  .option('-r, --report <file>', 'Generate validation report')
  .action(async (options) => {
    try {
      console.log('🔍 Validating specifications...');
      
      const specsDir = 'docs/specs';
      const specFiles = await findSpecFiles(specsDir);
      
      const results = [];
      let totalIssues = 0;

      for (const specFile of specFiles) {
        const result = await validateSpecification(specFile);
        results.push(result);
        totalIssues += result.issues.length;
        
        if (result.issues.length > 0) {
          console.log(`❌ ${specFile}: ${result.issues.length} issues`);
        } else {
          console.log(`✅ ${specFile}: Valid`);
        }
      }

      console.log(`\n📊 Validation complete: ${totalIssues} issues found`);

      if (options.report) {
        await fs.writeFile(options.report, JSON.stringify(results, null, 2));
        console.log(`📄 Report saved to: ${options.report}`);
      }

    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  });

// Monitor specifications
program
  .command('monitor')
  .description('Monitor specification changes in real-time')
  .option('-f, --filter <pattern>', 'Filter files by pattern')
  .action(async (options) => {
    try {
      console.log('👀 Monitoring specification changes...');
      
      const syncManager = new SpecificationSyncManager({
        enableRealtime: false,
        autoUpdate: false
      });

      syncManager.on('fileChange', (change) => {
        if (options.filter && !change.path.includes(options.filter)) {
          return;
        }
        
        const timestamp = change.timestamp.toLocaleTimeString();
        console.log(`[${timestamp}] ${change.event.toUpperCase()}: ${change.path}`);
      });

      syncManager.on('codeChangeAnalyzed', (codeChange) => {
        console.log(`🔍 ${codeChange.type}: ${codeChange.file}`);
        console.log(`   Impact: ${codeChange.impact.severity}`);
        console.log(`   Specs: ${codeChange.specifications.length}`);
      });

      await syncManager.start();

      console.log('👀 Monitoring started. Press Ctrl+C to stop.');

      process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping monitor...');
        await syncManager.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to start monitor:', error);
      process.exit(1);
    }
  });

// Show statistics
program
  .command('stats')
  .description('Show sync service statistics')
  .action(async () => {
    try {
      console.log('📊 Specification Sync Statistics');
      console.log('================================');
      
      const syncManager = new SpecificationSyncManager({
        enableRealtime: false,
        autoUpdate: false
      });

      await syncManager.start();
      
      // Wait a moment to collect stats
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stats = syncManager.getStats();
      const connectionStats = syncManager.getConnectionStats();
      const conflicts = syncManager.getActiveConflicts();

      console.log(`📈 Total Changes: ${stats.totalChanges}`);
      console.log(`🔄 Processed: ${stats.processedChanges}`);
      console.log(`📋 Updates Generated: ${stats.generatedUpdates}`);
      console.log(`✅ Updates Applied: ${stats.appliedUpdates}`);
      console.log(`⚠️  Conflicts: ${stats.conflicts}`);
      console.log(`❌ Errors: ${stats.errors}`);
      console.log(`⏱️  Uptime: ${Math.round(stats.uptime / 1000)}s`);

      if (connectionStats) {
        console.log('\n🔗 Connection Statistics');
        console.log(`   Total Connections: ${connectionStats.totalConnections}`);
        console.log(`   Total Subscriptions: ${connectionStats.totalSubscriptions}`);
        console.log(`   Active Conflicts: ${connectionStats.activeConflicts}`);
      }

      if (conflicts.length > 0) {
        console.log('\n⚠️  Active Conflicts');
        for (const conflict of conflicts) {
          console.log(`   ${conflict.specPath}: ${conflict.description}`);
        }
      }

      await syncManager.stop();

    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      process.exit(1);
    }
  });

// Helper functions
async function findSpecFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subFiles = await findSpecFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function validateSpecification(specFile) {
  const content = await fs.readFile(specFile, 'utf-8');
  const issues = [];
  
  // Basic validation rules
  if (!content.includes('# ')) {
    issues.push('Missing main heading');
  }
  
  if (!content.includes('## ')) {
    issues.push('Missing section headings');
  }
  
  if (content.length < 100) {
    issues.push('Content too short');
  }
  
  // Check for required sections based on file name
  if (specFile.includes('requirements.md')) {
    if (!content.includes('EARS') && !content.includes('requirement')) {
      issues.push('Missing requirements content');
    }
  }
  
  if (specFile.includes('design.md')) {
    if (!content.includes('architecture') && !content.includes('design')) {
      issues.push('Missing design content');
    }
  }
  
  if (specFile.includes('tasks.md')) {
    if (!content.includes('task') && !content.includes('implementation')) {
      issues.push('Missing tasks content');
    }
  }
  
  return {
    file: specFile,
    valid: issues.length === 0,
    issues
  };
}

program.parse();
