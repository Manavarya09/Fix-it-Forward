#!/usr/bin/env node
const { applyMigrations } = require('./db');

(async () => {
  try {
    console.log('Running migrations...');
    applyMigrations();
    console.log('Migrations applied.');
  } catch (err) {
    console.error('Migration failed:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
