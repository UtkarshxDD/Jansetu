#!/usr/bin/env node

import { seedFloodPosts, clearAllPosts } from './src/seeds/seedPosts.js';

const command = process.argv[2];

switch (command) {
  case 'seed':
    console.log('🌊 Seeding flood posts...');
    break;
  case 'clear':
    console.log('🗑️ Clearing all posts...');
    break;
  case 'help':
  default:
    console.log(`
🌊 Janhit Feed Seeder CLI

Usage:
  npm run seed           - Add dummy flood posts to the database
  npm run seed:clear     - Clear all posts from the database
  npm run seed:help      - Show this help message

Examples:
  npm run seed           # Seeds 8 flood posts from different cities
  npm run seed:clear     # Removes all posts and system user

Note: Make sure MongoDB is running before executing these commands.
    `);
    process.exit(0);
}

// Execute the command
if (command === 'seed') {
  seedFloodPosts()
    .then((result) => {
      console.log('✅ Seeding completed:', result.message);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error.message);
      process.exit(1);
    });
} else if (command === 'clear') {
  clearAllPosts()
    .then((result) => {
      console.log(`✅ Cleared ${result.deletedCount} posts`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Clearing failed:', error.message);
      process.exit(1);
    });
}
