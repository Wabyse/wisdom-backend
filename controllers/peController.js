const db = require('../db/models');

exports.fetchAllExam = async (req, res) => {
    try {
        const exams = await db.Exam.findAll();

        return res.status(200).json({
            status: "success",
            message: "exams got fetched successfully",
            exams
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await db.RatingScaleQuestion.findAll({
            where: { exam_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "exam got fetched successfully",
            exam
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchCandidate = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await db.PeCandidate.findOne({
            where: { candidate_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "candidate got fetched successfully",
            candidate
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.submitExamAnswers = async (req, res) => {
    try {
        const { candidate_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!candidate_id || !exam_id || !Array.isArray(allAnswers)) {
            return res.status(400).json({
                status: 'fail',
                message: 'candidate_id, exam_id and allAnswers array are required'
            });
        }

        // Step 1: Create a record in candidates_rate_scale_exams
        const examRecord = await db.CandidatesRateScaleExam.create({
            candidate_id,
            exam_id
        });

        // Step 2: Create all answers in candidates_rate_scale_answers
        const answersData = allAnswers.map((item) => ({
            score: item.answer,
            exam_id: examRecord.id, // FK to candidates_rate_scale_exams
            question_id: item.question_id, // we’ll add this column next
        }));

        await db.CandidatesRateScaleAnswer.bulkCreate(answersData);

        return res.status(201).json({
            status: 'success',
            message: 'Exam answers submitted successfully',
            examRecordId: examRecord.id,
        });
    } catch (error) {
        console.error('Error submitting exam answers:', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.fetchAllCandidateScores = async (req, res) => {
    try {
        const { id } = req.params;

        const exams = await db.CandidatesRateScaleExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["code"],
                },
            ],
            where: { candidate_id: id }
        });

        const questions = await db.RatingScaleQuestion.findAll();

        for (const exam of exams) {
            const answers = await db.CandidatesRateScaleAnswer.findAll({
                where: { exam_id: exam.id }
            })
        }

        return res.status(200).json({
            status: "success",
            message: "candidate got fetched successfully",
            exams
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}