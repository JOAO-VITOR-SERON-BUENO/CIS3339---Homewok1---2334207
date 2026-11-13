const mongoose = require('mongoose');
const { isDatabaseConnected } = require('../db');

/** An error with an HTTP status code, thrown by route handlers. */
class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

/** Rejects API requests with 503 while MongoDB is unavailable. */
function requireDatabase(req, res, next) {
    if (!isDatabaseConnected()) {
        return res.status(503).json({ error: 'The database is unavailable. Please try again shortly.' });
    }
    next();
}

/** Validates that route parameter `name` is a valid MongoDB ObjectId. */
function validateObjectId(name) {
    return (req, res, next) => {
        if (!mongoose.isValidObjectId(req.params[name])) {
            return res.status(400).json({ error: `Invalid ${name}` });
        }
        next();
    };
}

function notFoundApi(req, res) {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
}

const DUPLICATE_MESSAGES = {
    studentId: 'A student with this student ID already exists',
    courseId: 'A course with this course ID already exists',
    student: 'This student is already enrolled in this course',
};

// Express recognizes error handlers by their four-argument signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, details: err.details });
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.fromEntries(
            Object.entries(err.errors).map(([field, error]) => [field, error.message])
        );
        return res.status(400).json({ error: Object.values(details).join('. '), details });
    }

    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: `Invalid value for ${err.path}` });
    }

    // Unique index violation (e.g. two requests racing to add the same record).
    if (err && err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];
        return res.status(409).json({ error: DUPLICATE_MESSAGES[field] || 'Duplicate record' });
    }

    // Malformed JSON request body.
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body must be valid JSON' });
    }

    if (err && (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError' ||
        err.name === 'MongoNotConnectedError')) {
        return res.status(503).json({ error: 'The database is unavailable. Please try again shortly.' });
    }

    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

module.exports = { HttpError, requireDatabase, validateObjectId, notFoundApi, errorHandler };
