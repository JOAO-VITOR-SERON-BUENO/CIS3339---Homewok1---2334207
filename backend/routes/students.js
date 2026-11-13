const express = require('express');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const { HttpError, validateObjectId } = require('../middleware/errors');

const router = express.Router();

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toText(value) {
    return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

// GET /api/students?search=term
// Lists all students, or those whose name contains `search` (case-insensitive)
// or whose student ID matches it exactly.
router.get('/', async (req, res) => {
    const search = toText(req.query.search);
    const filter = search
        ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { studentId: search }] }
        : {};
    const students = await Student.find(filter).sort({ name: 1, studentId: 1 }).lean();
    res.json(students);
});

// GET /api/students/:id
router.get('/:id', validateObjectId('id'), async (req, res) => {
    const student = await Student.findById(req.params.id).lean();
    if (!student) throw new HttpError(404, 'Student not found');
    res.json(student);
});

// POST /api/students  { name, studentId, phone, zip }
router.post('/', async (req, res) => {
    const body = req.body || {};
    const data = {
        name: toText(body.name),
        studentId: toText(body.studentId),
        phone: toText(body.phone),
        zip: toText(body.zip),
    };

    if (data.studentId && (await Student.exists({ studentId: data.studentId }))) {
        throw new HttpError(409, 'A student with this student ID already exists');
    }

    // Mongoose schema validation reports any missing/invalid fields (400).
    const student = await Student.create(data);
    res.status(201).json({ message: 'Student added successfully', student });
});

// DELETE /api/students/:id — also removes the student's enrollments.
router.delete('/:id', validateObjectId('id'), async (req, res) => {
    const student = await Student.findByIdAndDelete(req.params.id).lean();
    if (!student) throw new HttpError(404, 'Student not found');

    const { deletedCount } = await Enrollment.deleteMany({ student: student._id });
    res.json({
        message: 'Student deleted successfully',
        student,
        enrollmentsRemoved: deletedCount,
    });
});

module.exports = router;
