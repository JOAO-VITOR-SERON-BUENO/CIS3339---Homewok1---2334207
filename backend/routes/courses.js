const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { HttpError, validateObjectId } = require('../middleware/errors');

const router = express.Router();

function toText(value) {
    return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

// Must match the normalization applied by the Course schema setters.
function normalizeCourseId(value) {
    return toText(value).replace(/\s+/g, ' ').toUpperCase();
}

// GET /api/courses — lists all courses with their enrollment counts.
router.get('/', async (req, res) => {
    const [courses, counts] = await Promise.all([
        Course.find().sort({ courseId: 1 }).lean(),
        Enrollment.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]),
    ]);
    const countByCourse = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json(courses.map((course) => ({ ...course, enrollmentCount: countByCourse.get(String(course._id)) || 0 })));
});

// POST /api/courses  { courseId, name }
router.post('/', async (req, res) => {
    const body = req.body || {};
    const data = { courseId: normalizeCourseId(body.courseId), name: toText(body.name) };

    if (data.courseId && (await Course.exists({ courseId: data.courseId }))) {
        throw new HttpError(409, 'A course with this course ID already exists');
    }

    const course = await Course.create(data);
    res.status(201).json({ message: 'Course added successfully', course });
});

// DELETE /api/courses/:id — also removes the course's enrollments.
router.delete('/:id', validateObjectId('id'), async (req, res) => {
    const course = await Course.findByIdAndDelete(req.params.id).lean();
    if (!course) throw new HttpError(404, 'Course not found');

    const { deletedCount } = await Enrollment.deleteMany({ course: course._id });
    res.json({
        message: 'Course deleted successfully',
        course,
        enrollmentsRemoved: deletedCount,
    });
});

module.exports = router;
