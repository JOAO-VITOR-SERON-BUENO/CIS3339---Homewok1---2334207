const path = require('path');

// Always load the .env that sits next to this file, regardless of the
// directory the server is started from (e.g. `npm start` at the repo root).
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined. Check backend/.env.');
    process.exit(1);
}

module.exports = {
    MONGODB_URI,
    PORT: Number(process.env.PORT) || 3000,
};
