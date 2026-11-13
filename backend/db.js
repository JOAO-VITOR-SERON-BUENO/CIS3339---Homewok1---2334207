const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const RETRY_DELAY_MS = 5000;

// Fail fast instead of silently queueing queries while MongoDB is unavailable.
mongoose.set('bufferCommands', false);

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));

/**
 * Creates the collections and indexes (including the unique indexes that
 * enforce duplicate prevention). Safe to run on every startup: existing
 * collections/indexes are left alone, and an empty or missing database is
 * created automatically.
 */
async function initializeDatabase() {
    for (const model of [Student, Course, Enrollment]) {
        await model.createCollection();
        await model.syncIndexes();
    }
}

/**
 * Connects to MongoDB, retrying until it succeeds so the server can start
 * before MongoDB is up and recover once it becomes available.
 */
async function connectToDatabase(uri) {
    for (;;) {
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            await initializeDatabase();
            console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`);
            return;
        } catch (error) {
            console.error(`Could not connect to MongoDB at ${uri}: ${error.message}`);
            console.error(`Is MongoDB running? Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            await mongoose.disconnect().catch(() => {});
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
}

function isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
}

module.exports = { connectToDatabase, isDatabaseConnected };
