const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { MONGODB_URI, PORT } = require('./config');
const { connectToDatabase } = require('./db');
const { requireDatabase, notFoundApi, errorHandler } = require('./middleware/errors');

const app = express();
app.use(cors());
app.use(express.json());

// REST API
app.use('/api', requireDatabase);
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api', notFoundApi);

// Production Vue build (created by `npm run build`)
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

app.use(express.static(DIST_DIR));

// History-mode fallback: any other GET request (e.g. a refresh on /courses)
// returns index.html so Vue Router can render the route instead of a 404.
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (!fs.existsSync(INDEX_HTML)) {
        return res
            .status(503)
            .type('text')
            .send('The frontend has not been built yet. Run `npm run build` in the project root, then refresh this page.');
    }
    res.sendFile(INDEX_HTML);
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

connectToDatabase(MONGODB_URI);
