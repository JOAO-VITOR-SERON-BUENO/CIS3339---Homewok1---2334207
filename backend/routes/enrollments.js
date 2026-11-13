const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { HttpError, validateObjectId } = require('../middleware/errors');

const router = express.Router();

function requireObjectId(value, label) {
    if (!value) throw new HttpError(400, `${label} is required`);
    if (!mongoose.isValidObjectId(value)) throw new HttpError(400, `Invalid ${label.toLowerCase()}`);
}

// GET /api/enrollments?courseId=<course _id>
// Returns the course and the students enrolled in it (the course roster).
router.get('/', async (req, res) => {
    const { courseId } = req.query;
    requireObjectId(courseId, 'Course');

    const course = await Course.findById(courseId).lean();
    if (!course) throw new HttpError(404, 'Course not found');

    const enrollments = await Enrollment.find({ course: course._id })
        .populate('student')
        .lean();

    const roster = enrollments
        .filter((enrollment) => enrollment.student) // ignore any orphaned rows
        .map((enrollment) => ({
            enrollmentId: enrollment._id,
            enrolledAt: enrollment.createdAt,
            student: enrollment.student,
        }))
        .sort((a, b) => a.student.name.localeCompare(b.student.name));

    res.json({ course, students: roster });
});

// POST /api/enrollments  { studentId, courseId }  (MongoDB _id values)
router.post('/', async (req, res) => {
    const { studentId, courseId } = req.body || {};
    requireObjectId(studentId, 'Student');
    requireObjectId(courseId, 'Course');

    // An enrollment may reference only an existing student and course.
    const [student, course] = await Promise.all([
        Student.findById(studentId).lean(),
        Course.findById(courseId).lean(),
    ]);
    if (!student) throw new HttpError(404, 'Student not found');
    if (!course) throw new HttpError(404, 'Course not found');

    if (await Enrollment.exists({ student: student._id, course: course._id })) {
        throw new HttpError(409, `${student.name} is already enrolled in ${course.courseId}`);
    }

    const enrollment = await Enrollment.create({ student: student._id, course: course._id });
    res.status(201).json({
        message: `${student.name} enrolled in ${course.courseId}`,
        enrollment: { _id: enrollment._id, student, course, enrolledAt: enrollment.createdAt },
    });
});

// DELETE /api/enrollments/:id — drops a single enrollment.
router.delete('/:id', validateObjectId('id'), async (req, res) => {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id).lean();
    if (!enrollment) throw new HttpError(404, 'Enrollment not found');
    res.json({ message: 'Enrollment removed successfully', enrollment });
});

module.exports = router;
