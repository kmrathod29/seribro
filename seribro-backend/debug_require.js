// debug_require.js - require a module and print full error stack
try {
  const r = require('./backend/routes/studentProfileRoute');
  console.log('Module loaded:', typeof r);
} catch (err) {
  console.error('Require error message:', err.message);
  console.error('Full stack:');
  console.error(err.stack);
  process.exit(1);
}
console.log('OK');
