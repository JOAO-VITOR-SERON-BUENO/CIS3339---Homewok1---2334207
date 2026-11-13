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

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

connectToDatabase(MONGODB_URI);
