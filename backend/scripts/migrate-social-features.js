#!/usr/bin/env node

/**
 * Social Features Database Migration Script
 * Sprint 9-10: Social Features APIs - Day 1 Task 1.1
 * 
 * This script runs the social features database migration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/database/connection.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('🚀 Starting Social Features Database Migration...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', '005_social_features_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Migration file loaded successfully');
        
        // Execute the migration
        console.log('⚡ Executing migration...');
        await query(migrationSQL);
        
        console.log('✅ Social Features Database Migration completed successfully!');
        console.log('📊 Created tables:');
        console.log('   - friend_requests');
        console.log('   - friendships');
        console.log('   - posts');
        console.log('   - post_likes');
        console.log('   - post_comments');
        console.log('   - post_shares');
        console.log('   - teams');
        console.log('   - team_members');
        console.log('   - team_invitations');
        console.log('   - team_challenges');
        console.log('   - team_challenge_participants');
        console.log('   - mentorship_profiles');
        console.log('   - mentorship_requests');
        console.log('   - mentorship_sessions');
        console.log('   - user_activities');
        console.log('   - social_notifications');
        console.log('🔍 Created indexes and functions for performance optimization');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        logger.error('Social features migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
runMigration();
