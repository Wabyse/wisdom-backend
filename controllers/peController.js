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

exports.fetchMCQExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await db.McqQuestion.findAll({
            include: [
                {
                    model: db.McqChoice,
                    as: "choices",
                    required: true,
                    attributes: ["id", "name", "status"],
                },
            ],
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
            exam_id: examRecord.id,
            question_id: item.question_id,
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

exports.submitMCQExamAnswers = async (req, res) => {
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
        const examRecord = await db.CandidatesMcqExam.create({
            candidate_id,
            exam_id
        });

        // Step 2: Create all answers in candidates_rate_scale_answers
        const answersData = allAnswers.map((item) => ({
            choice_id: item.answer,
            exam_id: examRecord.id,
            question_id: item.question_id,
        }));

        await db.CandidatesMcqAnswer.bulkCreate(answersData);

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

        // Fetch exams for this candidate
        const exams = await db.CandidatesRateScaleExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["code"],
                    where: { type: "rating scale" },
                },
            ],
            where: { candidate_id: id },
        });


        // 2️⃣ Fetch all supporting data
        const questionCodes = await db.ExamResultCode.findAll();
        const questions = await db.RatingScaleQuestion.findAll();

        // Convert to maps for quick lookups
        const questionsMap = new Map(questions.map(q => [q.id, q]));
        const codeMap = new Map(questionCodes.map(c => [c.id, c.name]));

        // Final result object (keyed by exam code)
        const results = {};

        // 3️⃣ Process each exam
        for (const exam of exams) {
            const answers = await db.CandidatesRateScaleAnswer.findAll({
                where: { exam_id: exam.id },
            });

            const groupedScores = {};

            // 4️⃣ Loop through each answer
            for (const ans of answers) {
                const question = questionsMap.get(ans.question_id);
                if (!question) continue;

                // Apply reverse logic
                let score = ans.score;
                if (question.reverse) {
                    score = question.rate_scale + 1 - ans.score;
                }

                // Group by code_id
                const codeId = question.code_id;
                if (!groupedScores[codeId]) groupedScores[codeId] = 0;
                groupedScores[codeId] += score;
            }

            // 5️⃣ Convert code IDs to readable names
            const readableScores = {};
            for (const [codeId, totalScore] of Object.entries(groupedScores)) {
                const codeName = codeMap.get(Number(codeId)) || `Code ${codeId}`;
                readableScores[codeName] = totalScore;
            }

            // 6️⃣ Assign to results object with exam code as key
            results[exam.exam.code] = readableScores;
        }

        return res.status(200).json({
            status: "success",
            message: "Candidate exam scores calculated successfully",
            results,
        });
    } catch (error) {
        console.error("Error fetching candidate scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.fetchAllCandidateMCQScores = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Fetch exams for this candidate (only MCQ type)
        const exams = await db.CandidatesMcqExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["code"],
                    where: { type: "MCQ" },
                },
            ],
            where: { candidate_id: id },
        });

        // 2️⃣ Prepare final results
        const results = {};

        // 3️⃣ Process each exam
        for (const exam of exams) {
            // Get all answers for this exam
            const answers = await db.CandidatesMcqAnswer.findAll({
                where: { exam_id: exam.id },
            });

            let totalQuestions = answers.length;
            let totalCorrect = 0;

            // 4️⃣ Loop through each answer
            for (const ans of answers) {
                // Fetch the selected choice to see if it's correct
                const choice = await db.McqChoice.findByPk(ans.choice_id, {
                    attributes: ["status"],
                });

                if (choice && choice.status === true) {
                    totalCorrect += 1;
                }
            }

            // Avoid division by zero
            const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

            // 5️⃣ Store result using exam code as key
            results[exam.exam.code] = {
                totalQuestions,
                totalCorrect,
                percentage: Number(score.toFixed(2)),
            };
        }

        return res.status(200).json({
            status: "success",
            message: "Candidate MCQ exam scores calculated successfully",
            results,
        });
    } catch (error) {
        console.error("Error fetching candidate MCQ scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};