// quick test file test_token.js
require('dotenv').config();
console.log('TOKEN LENGTH:', process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.length : 'MISSING');
