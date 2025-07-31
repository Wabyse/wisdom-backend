const db = require('../db/models');
const { Op } = require('sequelize');

const excludedIds = [1, 2, 3, 6, 11, 12];
const watomsIds = [3, 4, 5, 6, 7, 8, 9, 11];

// Helper to calculate evaluation for a single organization (center)
async function calculateEvaluation(org, cityLocations, defaultLocation, db) {
    let loc = org.location;
    let usedFallback = false;
    if (!loc || !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|(\d{1,2}))(\.\d+)?$/.test(loc)) {
        loc = cityLocations[org.city] || defaultLocation;
        usedFallback = true;
    }
    // ODBM: Trainee Attendance
    const students = await db.Student.findAll({ where: { school_id: org.id, deleted: false }, attributes: ['id', 'user_id'] });
    const studentIds = students.map(s => s.id);
    const studentUserIds = students.map(s => s.user_id);
    // Trainee Attendance
    let totalAttendance = 0, attended = 0;
    try {
        totalAttendance = await db.studentAttendance.count({ where: { student_id: studentIds, deleted: false } });
        attended = await db.studentAttendance.count({ where: { student_id: studentIds, status: 'attend', deleted: false } });
    } catch (e) { totalAttendance = 0; attended = 0; }
    const traineeAttendance = totalAttendance > 0 ? attended / totalAttendance : 0;
    // Trainee Commitment (ODBM & APBM)
    let traineeCommitment = 0;
    try {
        const formsTraineeCommitment = await db.Form.findAll({ where: { en_name: 'test', ar_name: { [db.Sequelize.Op.like]: '%اداء المتدرب%' }, deleted: false }, attributes: ['id', 'code'] });
        const formIdsTraineeCommitment = formsTraineeCommitment.map(f => f.id);
        const fieldsTraineeCommitment = await db.Field.findAll({ where: { form_id: formIdsTraineeCommitment, deleted: false }, attributes: ['id'] });
        const fieldIdsTraineeCommitment = fieldsTraineeCommitment.map(f => f.id);
        const subFieldsTraineeCommitment = await db.SubField.findAll({ where: { field_id: fieldIdsTraineeCommitment, deleted: false }, attributes: ['id'] });
        const subFieldIdsTraineeCommitment = subFieldsTraineeCommitment.map(sf => sf.id);
        const questionsTraineeCommitment = await db.Question.findAll({ where: { sub_field_id: subFieldIdsTraineeCommitment, deleted: false }, attributes: ['id', 'max_score'] });
        const questionIdsTraineeCommitment = questionsTraineeCommitment.map(q => q.id);
        const questionMaxScoresTraineeCommitment = Object.fromEntries(questionsTraineeCommitment.map(q => [q.id, q.max_score]));
        const reportsTraineeCommitment = await db.IndividualReport.findAll({ where: { Assessee_id: studentUserIds, deleted: false }, attributes: ['id'] });
        const reportIdsTraineeCommitment = reportsTraineeCommitment.map(r => r.id);
        const questionResultsTraineeCommitment = await db.QuestionResult.findAll({ where: { report_id: reportIdsTraineeCommitment, question_id: questionIdsTraineeCommitment, deleted: false }, attributes: ['score', 'question_id', 'report_id'] });
        let totalScoreTraineeCommitment = 0;
        let totalMaxTraineeCommitment = 0;
        for (const qr of questionResultsTraineeCommitment) {
            const max = questionMaxScoresTraineeCommitment[qr.question_id] || 1;
            totalScoreTraineeCommitment += qr.score;
            totalMaxTraineeCommitment += max;
        }
        traineeCommitment = totalMaxTraineeCommitment > 0 ? totalScoreTraineeCommitment / totalMaxTraineeCommitment : 0;
    } catch (e) { traineeCommitment = 0; }
    // Trainer Courses: Placeholder (always 0 for now)
    const trainerCourses = 0;
    // APBM: Project & Formative
    let projectAvg = 0, formativeAvg = 0;
    try {
        const quizTestTemplates = await db.QuizzesTestsTemplate.findAll({ where: { deleted: false }, attributes: ['id', 'type'] });
        const templateIdsTest = quizTestTemplates.filter(t => t.type === 'test').map(t => t.id);
        const templateIdsQuiz = quizTestTemplates.filter(t => t.type === 'quiz').map(t => t.id);
        // Project (test)
        const quizTestsProject = await db.QuizTest.findAll({ where: { template_id: templateIdsTest, student_id: studentIds, deleted: false }, attributes: ['result'] });
        const projectSum = quizTestsProject.reduce((sum, q) => sum + (q.result || 0), 0);
        projectAvg = quizTestsProject.length > 0 ? projectSum / quizTestsProject.length : 0;
        // Formative (quiz)
        const quizTestsFormative = await db.QuizTest.findAll({ where: { template_id: templateIdsQuiz, student_id: studentIds, deleted: false }, attributes: ['result'] });
        const formativeSum = quizTestsFormative.reduce((sum, q) => sum + (q.result || 0), 0);
        formativeAvg = quizTestsFormative.length > 0 ? formativeSum / quizTestsFormative.length : 0;
    } catch (e) { projectAvg = 0; formativeAvg = 0; }
    // TQBM: Training Regularity, Training Programs, Trainer, Digitization, Quality
    async function getCurriculumScore(arNameLike) {
        try {
            const forms = await db.Form.findAll({ where: { ar_name: { [db.Sequelize.Op.like]: `%${arNameLike}%` }, deleted: false }, attributes: ['id'] });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return 0;
            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return 0;
            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return 0;
            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return 0;
            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score]));
            const reports = await db.CurriculumReport.findAll({ where: { organization_id: org.id, deleted: false }, attributes: ['id'] });
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return 0;
            const results = await db.CurriculumResult.findAll({ where: { report_id: reportIds, question_id: questionIds, deleted: false }, attributes: ['score', 'question_id'] });
            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const max = questionMaxScores[r.question_id] || 1;
                totalScore += r.score;
                totalMax += max;
            }
            return totalMax > 0 ? totalScore / totalMax : 0;
        } catch (e) { return 0; }
    }
    async function getEnvironmentScore(arNameLike) {
        try {
            const forms = await db.Form.findAll({ where: { ar_name: { [db.Sequelize.Op.like]: `%${arNameLike}%` }, deleted: false }, attributes: ['id'] });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return 0;
            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return 0;
            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return 0;
            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return 0;
            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score]));
            const reports = await db.EnvironmentReports.findAll({ where: { organization_id: org.id, deleted: false }, attributes: ['id'] });
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return 0;
            const results = await db.EnvironmentResults.findAll({ where: { report_id: reportIds, question_id: questionIds, deleted: false }, attributes: ['score', 'question_id'] });
            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const max = questionMaxScores[r.question_id] || 1;
                totalScore += r.score;
                totalMax += max;
            }
            return totalMax > 0 ? totalScore / totalMax : 0;
        } catch (e) { return 0; }
    }
    // TQBM
    const trainingRegularity = await getCurriculumScore('بيئة التدريب');
    const trainingPrograms = await getCurriculumScore('برامج تدريبية');
    const trainer = await getCurriculumScore('اداء المدرب');
    const digitization = await getEnvironmentScore('الرقمنة و تخزين البيانات');
    const quality = await getEnvironmentScore('الجودة و التطوير');
    // COMMUNITY
    const community = await getEnvironmentScore('مشاركة مجتمعية');
    // INSTITUTIONAL
    const institutional = await getEnvironmentScore('اداء مؤسسي');
    // --- Calculate weighted evaluation ---
    const ODBM = (traineeAttendance * 0.4 + traineeCommitment * 0.2 + (trainerCourses || 0) * 0.4) * 0.2;
    const APBM = (projectAvg * 0.6 + formativeAvg * 0.3 + traineeCommitment * 0.1) * 0.2;
    const TQBM = (trainingRegularity * 0.25 + trainingPrograms * 0.25 + trainer * 0.25 + digitization * 0.15 + quality * 0.10) * 0.4;
    const communityParticipation = community * 0.1;
    const institutionalPerformance = institutional * 0.1;
    const evaluation = Math.round((ODBM + APBM + TQBM + communityParticipation + institutionalPerformance) * 100);
    return {
        id: org.id,
        name: org.name,
        city: org.city,
        location: loc,
        usedFallback,
        status: 'unknown', // status will be set by caller
        evaluation
    };
}

// --- SUMMARY ENDPOINT ---
exports.summary = async (req, res) => {
    try {
        const organizations = await db.Organization.findAll({
            where: { type: 'school', deleted: false },
            attributes: ['id', 'name', 'city', 'location'],
            order: [['id', 'ASC']]
        });
        // Helper: default locations for known cities
        const cityLocations = {
            'القاهرة': '30.0444,31.2357',
            'Cairo': '30.0444,31.2357',
            'الإسكندرية': '31.2001,29.9187',
            'Alexandria': '31.2001,29.9187',
            'الشرقية': '30.7326,31.7195',
            'الدقهلية': '31.0364,31.3807',
            'المنوفية': '30.5972,30.9876',
            'السويس': '29.9668,32.5498',
            'الإسماعيلية': '30.5852,32.2654',
            'دمياط': '31.4175,31.8144',
            'بورسعيد': '31.2653,32.3019',
            'الغربية': '30.8754,31.0335',
            'الفيوم': '29.3084,30.8428',
            'بني سويف': '29.0744,31.0978',
            'المنيا': '28.1099,30.7503',
            'أسيوط': '27.1809,31.1837',
            'سوهاج': '26.5591,31.6956',
            'قنا': '26.1551,32.7160',
            'الأقصر': '25.6872,32.6396',
            'أسوان': '24.0889,32.8998',
            'مطروح': '31.3543,27.2373',
            'البحر الأحمر': '26.7346,33.9366',
            'الوادي الجديد': '25.4473,30.5582',
            'شمال سيناء': '31.2018,33.7961',
            'جنوب سيناء': '28.1099,33.9938',
        };
        const defaultLocation = '26.8206,30.8025'; // Egypt center
        // Calculate evaluation for each center
        const centers = [];
        for (let idx = 0; idx < organizations.length; idx++) {
            const org = organizations[idx];
            const center = await calculateEvaluation(org, cityLocations, defaultLocation, db);
            center.status = idx < 5 ? 'online' : 'offline';
            centers.push(center);
        }
        const total = centers.length;
        const online = centers.filter(c => c.status === 'online');
        const offline = centers.filter(c => c.status === 'offline');
        const onlineAvg = online.length ? Math.round(online.reduce((sum, c) => sum + c.evaluation, 0) / online.length) : 0;
        res.json({
            totalCenters: total,
            onlineCenters: online.length,
            offlineCenters: offline.length,
            onlineEvaluation: onlineAvg
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.centers = async (req, res) => {
    try {
        const organizations = await db.Organization.findAll({
            where: {
                type: 'school',
                deleted: false,
                id: {
                    [Op.notIn]: excludedIds
                }
            },
            attributes: ['id', 'name', 'city', 'location'],
            order: [['id', 'ASC']]
        });
        // Helper: default locations for known cities
        const cityLocations = {
            'القاهرة': '30.0444,31.2357',
            'Cairo': '30.0444,31.2357',
            'الإسكندرية': '31.2001,29.9187',
            'Alexandria': '31.2001,29.9187',
            'الشرقية': '30.7326,31.7195',
            'الدقهلية': '31.0364,31.3807',
            'المنوفية': '30.5972,30.9876',
            'السويس': '29.9668,32.5498',
            'الإسماعيلية': '30.5852,32.2654',
            'دمياط': '31.4175,31.8144',
            'بورسعيد': '31.2653,32.3019',
            'الغربية': '30.8754,31.0335',
            'الفيوم': '29.3084,30.8428',
            'بني سويف': '29.0744,31.0978',
            'المنيا': '28.1099,30.7503',
            'أسيوط': '27.1809,31.1837',
            'سوهاج': '26.5591,31.6956',
            'قنا': '26.1551,32.7160',
            'الأقصر': '25.6872,32.6396',
            'أسوان': '24.0889,32.8998',
            'مطروح': '31.3543,27.2373',
            'البحر الأحمر': '26.7346,33.9366',
            'الوادي الجديد': '25.4473,30.5582',
            'شمال سيناء': '31.2018,33.7961',
            'جنوب سيناء': '28.1099,33.9938',
        };
        const defaultLocation = '26.8206,30.8025'; // Egypt center
        // Calculate evaluation for each center
        const centers = [];
        for (let idx = 0; idx < organizations.length; idx++) {
            const org = organizations[idx];
            let loc = org.location;
            let usedFallback = false;
            if (!loc || !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?((1[0-7]\d)|(\d{1,2}))(\.\d+)?$/.test(loc)) {
                loc = cityLocations[org.city] || defaultLocation;
                usedFallback = true;
            }
            // --- Calculate evaluation breakdown for this center ---
            // ODBM: Trainee Attendance
            const students = await db.Student.findAll({ where: { school_id: org.id, deleted: false }, attributes: ['id', 'user_id'] });
            const studentIds = students.map(s => s.id);
            const studentUserIds = students.map(s => s.user_id);
            // Trainee Attendance
            let totalAttendance = 0, attended = 0;
            try {
                totalAttendance = await db.studentAttendance.count({ where: { student_id: studentIds, deleted: false } });
                attended = await db.studentAttendance.count({ where: { student_id: studentIds, status: 'attend', deleted: false } });
            } catch (e) { totalAttendance = 0; attended = 0; }
            const traineeAttendance = totalAttendance > 0 ? attended / totalAttendance : 0;
            // Trainee Commitment (ODBM & APBM)
            let traineeCommitment = 0;
            try {
                const formsTraineeCommitment = await db.Form.findAll({ where: { en_name: 'test', code: { [db.Sequelize.Op.like]: '%| TR' }, deleted: false }, attributes: ['id', 'code'] });
                const formIdsTraineeCommitment = formsTraineeCommitment.map(f => f.id);
                const fieldsTraineeCommitment = await db.Field.findAll({ where: { form_id: formIdsTraineeCommitment, deleted: false }, attributes: ['id'] });
                const fieldIdsTraineeCommitment = fieldsTraineeCommitment.map(f => f.id);
                const subFieldsTraineeCommitment = await db.SubField.findAll({ where: { field_id: fieldIdsTraineeCommitment, deleted: false }, attributes: ['id'] });
                const subFieldIdsTraineeCommitment = subFieldsTraineeCommitment.map(sf => sf.id);
                const questionsTraineeCommitment = await db.Question.findAll({ where: { sub_field_id: subFieldIdsTraineeCommitment, deleted: false }, attributes: ['id', 'max_score'] });
                const questionIdsTraineeCommitment = questionsTraineeCommitment.map(q => q.id);
                const questionMaxScoresTraineeCommitment = Object.fromEntries(questionsTraineeCommitment.map(q => [q.id, q.max_score]));
                const reportsTraineeCommitment = await db.IndividualReport.findAll({ where: { Assessee_id: studentUserIds, deleted: false }, attributes: ['id'] });
                const reportIdsTraineeCommitment = reportsTraineeCommitment.map(r => r.id);
                const questionResultsTraineeCommitment = await db.QuestionResult.findAll({ where: { report_id: reportIdsTraineeCommitment, question_id: questionIdsTraineeCommitment, deleted: false }, attributes: ['score', 'question_id', 'report_id'] });
                let totalScoreTraineeCommitment = 0;
                let totalMaxTraineeCommitment = 0;
                for (const qr of questionResultsTraineeCommitment) {
                    const max = questionMaxScoresTraineeCommitment[qr.question_id] || 1;
                    totalScoreTraineeCommitment += qr.score;
                    totalMaxTraineeCommitment += max;
                }
                traineeCommitment = totalMaxTraineeCommitment > 0 ? totalScoreTraineeCommitment / totalMaxTraineeCommitment : 0;
            } catch (e) { traineeCommitment = 0; }
            // Trainer Courses: Placeholder (always 0 for now)
            const trainerCourses = 0;
            // APBM: Project & Formative
            let projectAvg = 0, formativeAvg = 0;
            try {
                const quizTestTemplates = await db.QuizzesTestsTemplate.findAll({ where: { deleted: false }, attributes: ['id', 'type'] });
                const templateIdsTest = quizTestTemplates.filter(t => t.type === 'test').map(t => t.id);
                const templateIdsQuiz = quizTestTemplates.filter(t => t.type === 'quiz').map(t => t.id);
                // Project (test)
                const quizTestsProject = await db.QuizTest.findAll({ where: { template_id: templateIdsTest, student_id: studentIds, deleted: false }, attributes: ['result'] });
                const projectSum = quizTestsProject.reduce((sum, q) => sum + (q.result || 0), 0);
                projectAvg = quizTestsProject.length > 0 ? projectSum / quizTestsProject.length : 0;
                // Formative (quiz)
                const quizTestsFormative = await db.QuizTest.findAll({ where: { template_id: templateIdsQuiz, student_id: studentIds, deleted: false }, attributes: ['result'] });
                const formativeSum = quizTestsFormative.reduce((sum, q) => sum + (q.result || 0), 0);
                formativeAvg = quizTestsFormative.length > 0 ? formativeSum / quizTestsFormative.length : 0;
            } catch (e) { projectAvg = 0; formativeAvg = 0; }
            // TQBM: Training Regularity, Training Programs, Trainer, Digitization, Quality
            async function getCurriculumScore(codeLike, organizationId) {
                try {
                    const { Op } = db.Sequelize;

                    const forms = await db.Form.findAll({
                        where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                        attributes: ['id']
                    });
                    const formIds = forms.map(f => f.id);
                    if (!formIds.length) return 0;

                    const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
                    const fieldIds = fields.map(f => f.id);
                    if (!fieldIds.length) return 0;

                    const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
                    const subFieldIds = subFields.map(sf => sf.id);
                    if (!subFieldIds.length) return 0;

                    const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
                    const questionIds = questions.map(q => q.id);
                    if (!questionIds.length) return 0;

                    const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

                    // ✅ Step 1: Get assessors (students & employees)
                    const students = await db.Student.findAll({
                        where: { school_id: organizationId },
                        attributes: ['user_id']
                    });
                    const employees = await db.Employee.findAll({
                        where: { organization_id: organizationId },
                        attributes: ['user_id']
                    });
                    const validAssessorIds = new Set([
                        ...students.map(s => s.user_id),
                        ...employees.map(e => e.user_id)
                    ]);
                    if (!validAssessorIds.size) return 0;

                    // ✅ Step 2: Get reports from valid assessors
                    const reports = await db.CurriculumReport.findAll({
                        where: { deleted: false },
                        attributes: ['id', 'Assessor_id']
                    });

                    const filteredReports = reports.filter(r => validAssessorIds.has(r.Assessor_id));
                    const reportIds = filteredReports.map(r => r.id);
                    if (!reportIds.length) return 0;

                    // ✅ Step 3: Get results
                    const results = await db.CurriculumResult.findAll({
                        where: {
                            report_id: reportIds,
                            question_id: questionIds,
                            deleted: false
                        },
                        attributes: ['score', 'question_id']
                    });

                    let totalScore = 0;
                    let totalMax = 0;
                    for (const r of results) {
                        const max = questionMaxScores[r.question_id] || 5;
                        totalScore += r.score;
                        totalMax += max;
                    }

                    return totalMax > 0 ? totalScore / totalMax : 0;
                } catch (e) {
                    console.error('getCurriculumScore error:', e);
                    return 0;
                }
            }
            async function getIndividualScore(codeLike) {
                try {
                    const forms = await db.Form.findAll({
                        where: { en_name: "test", code: { [Op.like]: `%${codeLike}` }, deleted: false },
                        attributes: ['id']
                    });
                    const formIds = forms.map(f => f.id);
                    if (!formIds.length) return 0;

                    const fields = await db.Field.findAll({
                        where: { form_id: formIds, deleted: false },
                        attributes: ['id']
                    });
                    const fieldIds = fields.map(f => f.id);
                    if (!fieldIds.length) return 0;

                    const subFields = await db.SubField.findAll({
                        where: { field_id: fieldIds, deleted: false },
                        attributes: ['id']
                    });
                    const subFieldIds = subFields.map(sf => sf.id);
                    if (!subFieldIds.length) return 0;

                    const questions = await db.Question.findAll({
                        where: { sub_field_id: subFieldIds, deleted: false },
                        attributes: ['id', 'max_score']
                    });
                    const questionIds = questions.map(q => q.id);
                    if (!questionIds.length) return 0;

                    const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

                    // ✅ Get employees for the org
                    const employees = await db.Employee.findAll({
                        where: { organization_id: org.id },
                        attributes: ['user_id']
                    });
                    const employeeUserIds = employees.map(e => e.user_id);
                    if (!employeeUserIds.length) return 0;

                    // ✅ Get only reports from those employees
                    const reports = await db.IndividualReport.findAll({
                        where: {
                            Assessee_id: employeeUserIds,
                            deleted: false
                        },
                        attributes: ['id']
                    });
                    const reportIds = reports.map(r => r.id);
                    if (!reportIds.length) return 0;

                    const results = await db.QuestionResult.findAll({
                        where: {
                            report_id: reportIds,
                            question_id: questionIds,
                            deleted: false
                        },
                        attributes: ['score', 'question_id']
                    });

                    let totalScore = 0;
                    let totalMax = 0;
                    for (const r of results) {
                        const max = questionMaxScores[r.question_id] || 1;
                        totalScore += r.score;
                        totalMax += max;
                    }

                    return totalMax > 0 ? totalScore / totalMax : 0;

                } catch (e) {
                    return 0;
                }
            }
            async function getEnvironmentScore(codeLike, org) {
                try {
                    const { Op } = db.Sequelize;

                    const forms = await db.Form.findAll({
                        where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                        attributes: ['id']
                    });
                    const formIds = forms.map(f => f.id);
                    if (!formIds.length) return 0;

                    const fields = await db.Field.findAll({
                        where: { form_id: formIds, deleted: false },
                        attributes: ['id']
                    });
                    const fieldIds = fields.map(f => f.id);
                    if (!fieldIds.length) return 0;

                    const subFields = await db.SubField.findAll({
                        where: { field_id: fieldIds, deleted: false },
                        attributes: ['id']
                    });
                    const subFieldIds = subFields.map(sf => sf.id);
                    if (!subFieldIds.length) return 0;

                    const questions = await db.Question.findAll({
                        where: { sub_field_id: subFieldIds, deleted: false },
                        attributes: ['id', 'max_score']
                    });
                    const questionIds = questions.map(q => q.id);
                    if (!questionIds.length) return 0;

                    const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

                    // ✅ Step 1: Get valid users (students + employees)
                    const students = await db.Student.findAll({
                        where: { school_id: org.id },
                        attributes: ['user_id']
                    });
                    const employees = await db.Employee.findAll({
                        where: { organization_id: org.id },
                        attributes: ['user_id']
                    });
                    const validUserIds = [...students.map(s => s.user_id), ...employees.map(e => e.user_id)];
                    if (!validUserIds.length) return 0;

                    // ✅ Step 2: Get reports written by those users
                    const reports = await db.EnvironmentReports.findAll({
                        where: {
                            user_id: validUserIds,
                            deleted: false
                        },
                        attributes: ['id']
                    });
                    const reportIds = reports.map(r => r.id);
                    if (!reportIds.length) return 0;

                    // ✅ Step 3: Get environment results for those reports & questions
                    const results = await db.EnvironmentResults.findAll({
                        where: {
                            report_id: reportIds,
                            question_id: questionIds,
                            deleted: false
                        },
                        attributes: ['score', 'question_id']
                    });

                    let totalScore = 0;
                    let totalMax = 0;
                    for (const r of results) {
                        const max = questionMaxScores[r.question_id] || 5;
                        totalScore += r.score;
                        totalMax += max;
                    }

                    return totalMax > 0 ? totalScore / totalMax : 0;
                } catch (e) {
                    console.error('getEnvironmentScore error:', e);
                    return 0;
                }
            }
            // TQBM
            const trainingRegularity = await getCurriculumScore('| TE', org.id);
            const trainingPrograms = await getCurriculumScore('| TG', org.id);
            const trainer = await getIndividualScore('| T');
            const digitization = await getEnvironmentScore('| DD', org);
            const quality = await getEnvironmentScore('| QD', org);
            // COMMUNITY
            const community = await getEnvironmentScore('| CP', org);
            // INSTITUTIONAL
            const institutional = await getEnvironmentScore('| IP', org);
            // --- Calculate weighted evaluation ---
            const ODBM = (traineeAttendance * 40 + traineeCommitment * 20 + (trainerCourses || 0) * 40) * 0.2;
            const APBM = (projectAvg * 60 + formativeAvg * 30 + traineeCommitment * 10) * 0.2;
            const TQBM = (trainingRegularity * 25 + trainingPrograms * 25 + trainer * 25 + digitization * 15 + quality * 10) * 0.4;
            const communityParticipation = (community * 100) * 0.1;
            const institutionalPerformance = (institutional * 100) * 0.1;
            const evaluation = Math.round((ODBM + APBM + TQBM + communityParticipation + institutionalPerformance));
            centers.push({
                id: org.id,
                name: org.name,
                city: org.city,
                location: loc,
                usedFallback,
                status: idx < 5 ? 'online' : 'offline',
                evaluation
            });
        }
        res.json({ centers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.centerDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const org = await db.Organization.findOne({
            where: { id, type: 'school', deleted: false },
            attributes: ['id', 'name', 'city', 'location']
        });
        if (!org) return res.status(404).json({ message: 'Center not found' });
        // Demo: status and evaluation as before
        const idx = org.id - 1;
        const status = idx < 5 ? 'online' : 'offline';
        const evaluation = Math.floor(Math.random() * 41) + 60;
        res.json({
            id: org.id,
            name: org.name,
            city: org.city,
            location: org.location,
            status,
            evaluation
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// New: Evaluation breakdown for a single center (mock for now)
exports.centerEvaluationBreakdown = async (req, res) => {
    try {
        const id = req.params.id;
        const db = require('../db/models'); //why?

        // ODBM: Trainee Attendance
        const students = await db.Student.findAll({
            where: { school_id: id, deleted: false },
            attributes: ['id', 'user_id']
        });
        const studentIds = students.map(s => s.id);
        const studentUserIds = students.map(s => s.user_id);

        // Trainee Attendance
        const totalAttendance = await db.studentAttendance.count({
            where: { student_id: studentIds, deleted: false }
        });
        const attended = await db.studentAttendance.count({
            where: { student_id: studentIds, status: 'attend', deleted: false }
        });
        const traineeAttendance = totalAttendance > 0 ? attended / totalAttendance : 0;

        // Trainee Commitment (ODBM & APBM)
        const formsTraineeCommitment = await db.Form.findAll({
            where: {
                en_name: 'test',
                code: { [db.Sequelize.Op.like]: '%| TR' },
                deleted: false
            },
            attributes: ['id', 'code']
        });
        const formIdsTraineeCommitment = formsTraineeCommitment.map(f => f.id);
        const fieldsTraineeCommitment = await db.Field.findAll({
            where: { form_id: formIdsTraineeCommitment, deleted: false },
            attributes: ['id']
        });
        const fieldIdsTraineeCommitment = fieldsTraineeCommitment.map(f => f.id);
        const subFieldsTraineeCommitment = await db.SubField.findAll({
            where: { field_id: fieldIdsTraineeCommitment, deleted: false },
            attributes: ['id']
        });
        const subFieldIdsTraineeCommitment = subFieldsTraineeCommitment.map(sf => sf.id);
        const questionsTraineeCommitment = await db.Question.findAll({
            where: { sub_field_id: subFieldIdsTraineeCommitment, deleted: false },
            attributes: ['id', 'max_score']
        });
        const questionIdsTraineeCommitment = questionsTraineeCommitment.map(q => q.id);
        const questionMaxScoresTraineeCommitment = Object.fromEntries(questionsTraineeCommitment.map(q => [q.id, q.max_score]));
        const reportsTraineeCommitment = await db.IndividualReport.findAll({
            where: { Assessee_id: studentUserIds, deleted: false },
            attributes: ['id']
        });
        const reportIdsTraineeCommitment = reportsTraineeCommitment.map(r => r.id);
        const questionResultsTraineeCommitment = await db.QuestionResult.findAll({
            where: { report_id: reportIdsTraineeCommitment, question_id: questionIdsTraineeCommitment, deleted: false },
            attributes: ['score', 'question_id', 'report_id']
        });
        let totalScoreTraineeCommitment = 0;
        let totalMaxTraineeCommitment = 0;
        for (const qr of questionResultsTraineeCommitment) {
            const max = questionMaxScoresTraineeCommitment[qr.question_id] || 1;
            totalScoreTraineeCommitment += qr.score;
            totalMaxTraineeCommitment += max;
        }
        const traineeCommitment = totalMaxTraineeCommitment > 0 ? totalScoreTraineeCommitment / totalMaxTraineeCommitment : 0;

        // Trainer Courses: Placeholder
        const trainerCourses = 0;

        // APBM: Project & Formative
        // Get all students' quizzes/tests
        const quizTestTemplates = await db.QuizzesTestsTemplate.findAll({
            where: { deleted: false },
            attributes: ['id', 'type']
        });
        const templateIdsTest = quizTestTemplates.filter(t => t.type === 'test').map(t => t.id);
        const templateIdsQuiz = quizTestTemplates.filter(t => t.type === 'quiz').map(t => t.id);
        // Project (test)
        const quizTestsProject = await db.QuizTest.findAll({
            where: { template_id: templateIdsTest, student_id: studentIds, deleted: false },
            attributes: ['result']
        });
        const projectSum = quizTestsProject.reduce((sum, q) => sum + (q.result || 0), 0);
        const projectAvg = quizTestsProject.length > 0 ? projectSum / quizTestsProject.length : 0;
        // Formative (quiz)
        const quizTestsFormative = await db.QuizTest.findAll({
            where: { template_id: templateIdsQuiz, student_id: studentIds, deleted: false },
            attributes: ['result']
        });
        const formativeSum = quizTestsFormative.reduce((sum, q) => sum + (q.result || 0), 0);
        const formativeAvg = quizTestsFormative.length > 0 ? formativeSum / quizTestsFormative.length : 0;

        // TQBM: Training Regularity, Training Programs, Trainer, Digitization, Quality
        // Helper for curriculum_reports/curriculum_results
        async function getCurriculumScore(codeLike, organizationId) {
            const { Op } = db.Sequelize;

            const forms = await db.Form.findAll({
                where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                attributes: ['id']
            });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return null;

            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return null;

            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return null;

            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return null;

            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

            const reports = await db.CurriculumReport.findAll({ where: { deleted: false }, attributes: ['id', 'Assessor_id'] });
            const reportAssessorMap = Object.fromEntries(reports.map(r => [r.id, r.Assessor_id]));
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return null;

            const students = await db.Student.findAll({ where: { school_id: organizationId }, attributes: ['user_id'] });
            const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
            const allowedAssessorIds = new Set([...students.map(s => s.user_id), ...employees.map(e => e.user_id)]);

            const results = await db.CurriculumResult.findAll({
                where: { report_id: reportIds, question_id: questionIds, deleted: false },
                attributes: ['score', 'question_id', 'report_id']
            });

            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const assessorId = reportAssessorMap[r.report_id];
                if (!allowedAssessorIds.has(assessorId)) continue;
                const max = questionMaxScores[r.question_id] || 5;
                totalScore += r.score;
                totalMax += max;
            }

            return totalMax > 0 ? (totalScore / totalMax) : null;
        }
        // Helper for individual_reports/questions_results
        async function getIndividualScore(codeLike, organizationId) {
            const { Op } = db.Sequelize;

            const forms = await db.Form.findAll({
                where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                attributes: ['id']
            });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return null;

            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return null;

            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return null;

            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return null;

            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

            const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
            const employeeUserIds = employees.map(e => e.user_id);
            if (!employeeUserIds.length) return null;

            const reports = await db.IndividualReport.findAll({
                where: {
                    deleted: false,
                    Assessee_id: employeeUserIds
                },
                attributes: ['id', 'Assessee_id']
            });
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return null;

            const reportAssesseeMap = Object.fromEntries(reports.map(r => [r.id, r.Assessee_id]));

            const results = await db.QuestionResult.findAll({
                where: { report_id: reportIds, question_id: questionIds, deleted: false },
                attributes: ['score', 'question_id', 'report_id']
            });

            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const assesseeId = reportAssesseeMap[r.report_id];
                if (!employeeUserIds.includes(assesseeId)) continue;

                const max = questionMaxScores[r.question_id] || 5;
                totalScore += r.score;
                totalMax += max;
            }

            return totalMax > 0 ? (totalScore / totalMax) : null;
        }
        // Helper for environment_reports/environment_results
        async function getEnvironmentScore(codeLike, organizationId) {
            const { Op } = db.Sequelize;

            const forms = await db.Form.findAll({
                where: { en_name: 'test', code: { [Op.like]: `%${codeLike}` }, deleted: false },
                attributes: ['id']
            });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return null;

            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return null;

            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return null;

            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return null;

            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

            // Get users from students/employees that belong to the organization
            const students = await db.Student.findAll({ where: { school_id: organizationId }, attributes: ['user_id'] });
            const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
            const validUserIds = [...students.map(s => s.user_id), ...employees.map(e => e.user_id)];
            if (!validUserIds.length) return null;

            const reports = await db.EnvironmentReports.findAll({
                where: {
                    user_id: validUserIds,
                    deleted: false
                },
                attributes: ['id']
            });
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return null;

            const results = await db.EnvironmentResults.findAll({
                where: {
                    report_id: reportIds,
                    question_id: questionIds,
                    deleted: false
                },
                attributes: ['score', 'question_id']
            });

            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const max = questionMaxScores[r.question_id] || 5;
                totalScore += r.score;
                totalMax += max;
            }

            return totalMax > 0 ? totalScore / totalMax : 0;
        }

        // TQBM
        const trainingRegularity = await getCurriculumScore('| TE', id);
        const trainingPrograms = await getCurriculumScore('| TG', id);
        const trainer = await getIndividualScore('| T', id);
        const digitization = await getEnvironmentScore('| DD', id);
        const quality = await getEnvironmentScore('| QD', id);

        // COMMUNITY
        const community = await getEnvironmentScore('| CP', id);
        // INSTITUTIONAL
        const institutional = await getEnvironmentScore('| IP', id);

        res.json({
            ODBM: {
                traineeAttendance,
                traineeCommitment,
                trainerCourses
            },
            APBM: {
                project: projectAvg,
                formative: formativeAvg,
                traineeCommitment
            },
            TQBM: {
                trainingRegularity,
                trainingPrograms,
                trainer,
                digitization,
                quality
            },
            COMMUNITY: community,
            INSTITUTIONAL: institutional
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.wisdomCenters = async (req, res) => {
    try {
        const organizations = await db.Organization.findAll({
            where: {
                type: 'school',
                deleted: false,
                id: {
                    [Op.notIn]: watomsIds
                }
            },
            attributes: ['id', 'name', 'city', 'location'],
            order: [['id', 'ASC']]
        });

        const cityLocations = {
            'القاهرة': '30.0444,31.2357',
            'Cairo': '30.0444,31.2357',
            'الإسكندرية': '31.2001,29.9187',
            'Alexandria': '31.2001,29.9187',
            'الشرقية': '30.7326,31.7195',
            'الدقهلية': '31.0364,31.3807',
            'المنوفية': '30.5972,30.9876',
            'السويس': '29.9668,32.5498',
            'الإسماعيلية': '30.5852,32.2654',
            'دمياط': '31.4175,31.8144',
            'بورسعيد': '31.2653,32.3019',
            'الغربية': '30.8754,31.0335',
            'الفيوم': '29.3084,30.8428',
            'بني سويف': '29.0744,31.0978',
            'المنيا': '28.1099,30.7503',
            'أسيوط': '27.1809,31.1837',
            'سوهاج': '26.5591,31.6956',
            'قنا': '26.1551,32.7160',
            'الأقصر': '25.6872,32.6396',
            'أسوان': '24.0889,32.8998',
            'مطروح': '31.3543,27.2373',
            'البحر الأحمر': '26.7346,33.9366',
            'الوادي الجديد': '25.4473,30.5582',
            'شمال سيناء': '31.2018,33.7961',
            'جنوب سيناء': '28.1099,33.9938'
        };

        const defaultLocation = '26.8206,30.8025';
        const centers = [];

        for (let idx = 0; idx < organizations.length; idx++) {
            const org = organizations[idx];
            let loc = org.location;
            let usedFallback = false;

            if (!loc || !/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(loc)) {
                loc = cityLocations[org.city] || defaultLocation;
                usedFallback = true;
            }

            // users data
            const students = await db.Student.findAll({ where: { school_id: org.id, deleted: false }, attributes: ['id', 'user_id'] });
            const studentIds = students.map(s => s.id);
            const employees = await db.Employee.findAll({ where: { organization_id: org.id, deleted: false }, attributes: ['id'] });
            const employeeIds = employees.map(e => e.id);
            const teachers = await db.Teacher.findAll({ where: { employee_id: employeeIds, deleted: false }, attributes: ['id', 'planned_sessions', 'employee_id'] });
            const teacherIds = teachers.map(t => t.id);

            const totalAttendance = await db.studentAttendance.count({ where: { student_id: studentIds, deleted: false } });
            const attended = await db.studentAttendance.count({ where: { student_id: studentIds, status: 'attend', deleted: false } });
            const studentAttendance = totalAttendance > 0 ? attended / totalAttendance : 0;

            let studentCommitment = 0;
            let morningLine = 0;

            // sessions (ODBM)
            let totalScore = 0;
            let countedTeachers = 0;

            for (const teacher of teachers) {
                const planned = teacher.planned_sessions;

                // Skip if no planned sessions (avoid divide by 0)
                if (!planned || planned === 0) continue;

                const substituteCount = await db.Substitute.count({
                    where: { substitute_id: teacher.employee_id }
                });

                const adjusted = planned - substituteCount;
                const score = (adjusted / planned);

                totalScore += score;
                countedTeachers += 1;
            }

            const session = countedTeachers > 0 ? totalScore / countedTeachers : 0;
            let projectAvg = 0, formativeAvg = 0;
            const quizTestTemplates = await db.QuizzesTestsTemplate.findAll({ where: { deleted: false }, attributes: ['id', 'type'] });
            const templateIdsTest = quizTestTemplates.filter(t => t.type === 'test').map(t => t.id);
            const templateIdsQuiz = quizTestTemplates.filter(t => t.type === 'quiz').map(t => t.id);

            const quizTestsProject = await db.QuizTest.findAll({ where: { template_id: templateIdsTest, student_id: studentIds, deleted: false }, attributes: ['result'] });
            const projectSum = quizTestsProject.reduce((sum, q) => sum + (q.result || 0), 0);
            projectAvg = quizTestsProject.length > 0 ? projectSum / quizTestsProject.length : 0;

            const quizTestsFormative = await db.QuizTest.findAll({ where: { template_id: templateIdsQuiz, student_id: studentIds, deleted: false }, attributes: ['result'] });
            const formativeSum = quizTestsFormative.reduce((sum, q) => sum + (q.result || 0), 0);
            formativeAvg = quizTestsFormative.length > 0 ? formativeSum / quizTestsFormative.length : 0;

            const teacherInterviewTest = await db.TeacherEvaluation.findAll({ where: { teacher_id: teacherIds, deleted: false } });

            const averageRowResults = row => {
                const scores = [row.first_result, row.second_result, row.third_result, row.fourth_result, row.fifth_result, row.sixth_result];
                const valid = scores.filter(v => typeof v === 'number');
                const total = valid.reduce((acc, val) => acc + val, 0);
                return valid.length ? total / valid.length : 0;
            };

            const averageOfRowAverages = (data, type) => {
                const filtered = data.filter(i => i.type === type);
                const averages = filtered.map(averageRowResults);
                const sum = averages.reduce((acc, avg) => acc + avg, 0);
                return averages.length ? sum / averages.length : 0;
            };

            const interviewAvg = averageOfRowAverages(teacherInterviewTest, 'interview');
            const testAvg = averageOfRowAverages(teacherInterviewTest, 'test');

            // Helper for individual_reports/questions_results
            async function getIndividualScore(codeLike, organizationId) {
                const { Op } = db.Sequelize;

                const forms = await db.Form.findAll({
                    where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                    attributes: ['id']
                });
                const formIds = forms.map(f => f.id);
                if (!formIds.length) return null;

                const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
                const fieldIds = fields.map(f => f.id);
                if (!fieldIds.length) return null;

                const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
                const subFieldIds = subFields.map(sf => sf.id);
                if (!subFieldIds.length) return null;

                const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
                const questionIds = questions.map(q => q.id);
                if (!questionIds.length) return null;

                const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

                const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
                const employeeUserIds = employees.map(e => e.user_id);
                if (!employeeUserIds.length) return null;

                const reports = await db.IndividualReport.findAll({
                    where: {
                        deleted: false,
                        Assessee_id: employeeUserIds
                    },
                    attributes: ['id', 'Assessee_id']
                });
                const reportIds = reports.map(r => r.id);
                if (!reportIds.length) return null;

                const reportAssesseeMap = Object.fromEntries(reports.map(r => [r.id, r.Assessee_id]));

                const results = await db.QuestionResult.findAll({
                    where: { report_id: reportIds, question_id: questionIds, deleted: false },
                    attributes: ['score', 'question_id', 'report_id']
                });

                let totalScore = 0;
                let totalMax = 0;
                for (const r of results) {
                    const assesseeId = reportAssesseeMap[r.report_id];
                    if (!employeeUserIds.includes(assesseeId)) continue;

                    const max = questionMaxScores[r.question_id] || 5;
                    totalScore += r.score;
                    totalMax += max;
                }

                return totalMax > 0 ? (totalScore / totalMax) : null;
            }
            // Helper for environment_reports/environment_results
            async function getEnvironmentScore(codeLike, organizationId) {
                const { Op } = db.Sequelize;

                const forms = await db.Form.findAll({
                    where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                    attributes: ['id']
                });
                const formIds = forms.map(f => f.id);
                if (!formIds.length) return null;

                const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
                const fieldIds = fields.map(f => f.id);
                if (!fieldIds.length) return null;

                const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
                const subFieldIds = subFields.map(sf => sf.id);
                if (!subFieldIds.length) return null;

                const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
                const questionIds = questions.map(q => q.id);
                if (!questionIds.length) return null;

                const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

                // Get users from students/employees that belong to the organization
                const students = await db.Student.findAll({ where: { school_id: organizationId }, attributes: ['user_id'] });
                const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
                const validUserIds = [...students.map(s => s.user_id), ...employees.map(e => e.user_id)];
                if (!validUserIds.length) return null;

                const reports = await db.EnvironmentReports.findAll({
                    where: {
                        user_id: validUserIds,
                        deleted: false
                    },
                    attributes: ['id']
                });
                const reportIds = reports.map(r => r.id);
                if (!reportIds.length) return 0;

                const results = await db.EnvironmentResults.findAll({
                    where: {
                        report_id: reportIds,
                        question_id: questionIds,
                        deleted: false
                    },
                    attributes: ['score', 'question_id']
                });

                let totalScore = 0;
                let totalMax = 0;
                for (const r of results) {
                    const max = questionMaxScores[r.question_id] || 5;
                    totalScore += r.score;
                    totalMax += max;
                }

                return totalMax > 0 ? totalScore / totalMax : 0;
            }

            const CRO = await getIndividualScore('Cl | PD', org.id);
            const teachersPerformance = CRO + interviewAvg + testAvg;
            const Env360 = await getEnvironmentScore('| EDU', org.id);
            morningLine = await getEnvironmentScore('ML | DO', org.id);
            const trainingRegularity = 0;
            const training360 = 0;
            const competenciesAcquisition = 0;
            const PDA = 0;
            const LabsEquipmentEfficiency = 0;

            const ODBM = (session + studentAttendance + studentCommitment + morningLine) * 100;
            const APBM = (projectAvg + formativeAvg + studentCommitment) * 100;
            const TQBM = (trainingRegularity + training360 + competenciesAcquisition) * 100;
            const PDBM = (teachersPerformance + PDA) * 100;
            const EEBM = (Env360 + LabsEquipmentEfficiency) * 100;

            const total = (ODBM + APBM + TQBM + PDBM + EEBM) / 14;

            const evaluation = Math.round(total);

            centers.push({
                id: org.id,
                name: org.name,
                city: org.city,
                location: loc,
                usedFallback,
                status: idx < 5 ? 'online' : 'offline',
                evaluation
            });
        }

        res.json({ centers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.wisdomCenterEvaluationBreakdown = async (req, res) => {
    try {
        const id = req.params.id;

        // ODBM:

        // Implemented Sessions (ODBM)
        let sessions = 0;

        // Student Attendance (ODBM)
        const students = await db.Student.findAll({
            where: { school_id: id, deleted: false },
            attributes: ['id', 'user_id']
        });
        const studentIds = students.map(s => s.id);

        const totalAttendance = await db.studentAttendance.count({
            where: { student_id: studentIds, deleted: false }
        });
        const attended = await db.studentAttendance.count({
            where: { student_id: studentIds, status: 'attend', deleted: false }
        });
        const studentAttendance = totalAttendance > 0 ? attended / totalAttendance : 0;

        // Student Commitment (ODBM & APBM)
        let studentCommitment = 0;

        // Morning Line (ODBM)
        let morningLine = 0;

        // APBM:

        // Project & Formative
        const quizTestTemplates = await db.QuizzesTestsTemplate.findAll({
            where: { deleted: false },
            attributes: ['id', 'type']
        });
        const templateIdsTest = quizTestTemplates.filter(t => t.type === 'test').map(t => t.id);
        const templateIdsQuiz = quizTestTemplates.filter(t => t.type === 'quiz').map(t => t.id);
        // Project (test)
        const quizTestsProject = await db.QuizTest.findAll({
            where: { template_id: templateIdsTest, student_id: studentIds, deleted: false },
            attributes: ['result']
        });
        const projectSum = quizTestsProject.reduce((sum, q) => sum + (q.result || 0), 0);
        const projectAvg = quizTestsProject.length > 0 ? projectSum / quizTestsProject.length : 0;
        // Formative (quiz)
        const quizTestsFormative = await db.QuizTest.findAll({
            where: { template_id: templateIdsQuiz, student_id: studentIds, deleted: false },
            attributes: ['result']
        });
        const formativeSum = quizTestsFormative.reduce((sum, q) => sum + (q.result || 0), 0);
        const formativeAvg = quizTestsFormative.length > 0 ? formativeSum / quizTestsFormative.length : 0;

        // teacher Interview and test
        const employees = await db.Employee.findAll({
            where: { organization_id: id, deleted: false },
            attributes: ['id']
        });
        const employeeIds = employees.map(e => e.id);

        const teachers = await db.Teacher.findAll({
            where: { employee_id: employeeIds, deleted: false },
            attributes: ['id']
        });
        const teacherIds = teachers.map(t => t.id);

        const teacherInterviewTest = await db.TeacherEvaluation.findAll({
            where: { teacher_id: teacherIds, deleted: false }
        });


        function averageRowResults(row) {
            const values = [
                row.first_result,
                row.second_result,
                row.third_result,
                row.fourth_result,
                row.fifth_result,
                row.sixth_result,
            ];

            const validValues = values.filter(v => typeof v === 'number');
            const sum = validValues.reduce((acc, val) => acc + val, 0);

            return validValues.length ? sum / validValues.length : 0;
        }

        function averageOfRowAverages(data, type) {
            const filtered = data.filter(item => item.type === type);
            const rowAverages = filtered.map(averageRowResults);
            const total = rowAverages.reduce((acc, avg) => acc + avg, 0);

            return rowAverages.length ? total / rowAverages.length : 0;
        }

        // Usage
        const interviewAvg = averageOfRowAverages(teacherInterviewTest, 'interview');
        const testAvg = averageOfRowAverages(teacherInterviewTest, 'test');


        // Training Regularity, Training Programs, Trainer, Digitization, Quality
        // Helper for curriculum_reports/curriculum_results
        async function getCurriculumScore(codeLike, organizationId) {
            const { Op } = db.Sequelize;

            const forms = await db.Form.findAll({
                where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                attributes: ['id']
            });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return null;

            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return null;

            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return null;

            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return null;

            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

            const reports = await db.CurriculumReport.findAll({ where: { deleted: false }, attributes: ['id', 'Assessor_id'] });
            const reportAssessorMap = Object.fromEntries(reports.map(r => [r.id, r.Assessor_id]));
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return null;

            const students = await db.Student.findAll({ where: { school_id: organizationId }, attributes: ['user_id'] });
            const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
            const allowedAssessorIds = new Set([...students.map(s => s.user_id), ...employees.map(e => e.user_id)]);

            const results = await db.CurriculumResult.findAll({
                where: { report_id: reportIds, question_id: questionIds, deleted: false },
                attributes: ['score', 'question_id', 'report_id']
            });

            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const assessorId = reportAssessorMap[r.report_id];
                if (!allowedAssessorIds.has(assessorId)) continue;
                const max = questionMaxScores[r.question_id] || 5;
                totalScore += r.score;
                totalMax += max;
            }

            return totalMax > 0 ? (totalScore / totalMax) : null;
        }
        // Helper for individual_reports/questions_results
        async function getIndividualScore(codeLike, organizationId) {
            const { Op } = db.Sequelize;

            const forms = await db.Form.findAll({
                where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                attributes: ['id']
            });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return null;

            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return null;

            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return null;

            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return null;

            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

            const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
            const employeeUserIds = employees.map(e => e.user_id);
            if (!employeeUserIds.length) return null;

            const reports = await db.IndividualReport.findAll({
                where: {
                    deleted: false,
                    Assessee_id: employeeUserIds
                },
                attributes: ['id', 'Assessee_id']
            });
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return 0;

            const reportAssesseeMap = Object.fromEntries(reports.map(r => [r.id, r.Assessee_id]));

            const results = await db.QuestionResult.findAll({
                where: { report_id: reportIds, question_id: questionIds, deleted: false },
                attributes: ['score', 'question_id', 'report_id']
            });

            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const assesseeId = reportAssesseeMap[r.report_id];
                if (!employeeUserIds.includes(assesseeId)) continue;

                const max = questionMaxScores[r.question_id] || 5;
                totalScore += r.score;
                totalMax += max;
            }

            return totalMax > 0 ? (totalScore / totalMax) : null;
        }
        // Helper for environment_reports/environment_results
        async function getEnvironmentScore(codeLike, organizationId) {
            const { Op } = db.Sequelize;

            const forms = await db.Form.findAll({
                where: { code: { [Op.like]: `%${codeLike}` }, deleted: false },
                attributes: ['id']
            });
            const formIds = forms.map(f => f.id);
            if (!formIds.length) return null;

            const fields = await db.Field.findAll({ where: { form_id: formIds, deleted: false }, attributes: ['id'] });
            const fieldIds = fields.map(f => f.id);
            if (!fieldIds.length) return null;

            const subFields = await db.SubField.findAll({ where: { field_id: fieldIds, deleted: false }, attributes: ['id'] });
            const subFieldIds = subFields.map(sf => sf.id);
            if (!subFieldIds.length) return null;

            const questions = await db.Question.findAll({ where: { sub_field_id: subFieldIds, deleted: false }, attributes: ['id', 'max_score'] });
            const questionIds = questions.map(q => q.id);
            if (!questionIds.length) return null;

            const questionMaxScores = Object.fromEntries(questions.map(q => [q.id, q.max_score || 5]));

            // Get users from students/employees that belong to the organization
            const students = await db.Student.findAll({ where: { school_id: organizationId }, attributes: ['user_id'] });
            const employees = await db.Employee.findAll({ where: { organization_id: organizationId }, attributes: ['user_id'] });
            const validUserIds = [...students.map(s => s.user_id), ...employees.map(e => e.user_id)];
            if (!validUserIds.length) return null;

            const reports = await db.EnvironmentReports.findAll({
                where: {
                    user_id: validUserIds,
                    deleted: false
                },
                attributes: ['id']
            });
            const reportIds = reports.map(r => r.id);
            if (!reportIds.length) return null;

            const results = await db.EnvironmentResults.findAll({
                where: {
                    report_id: reportIds,
                    question_id: questionIds,
                    deleted: false
                },
                attributes: ['score', 'question_id']
            });

            let totalScore = 0;
            let totalMax = 0;
            for (const r of results) {
                const max = questionMaxScores[r.question_id] || 5;
                totalScore += r.score;
                totalMax += max;
            }

            return totalMax > 0 ? totalScore / totalMax : 0;
        }


        morningLine = await getEnvironmentScore('ML | DO', id);
        // TQBM
        const trainingRegularity = 0;
        const training360 = 0;
        const competenciesAcquisition = 0;
        const CRO = await getIndividualScore('Cl | PD', id);
        const teachersPerformance = CRO + interviewAvg + testAvg;
        const PDA = 0;
        const Env360 = await getEnvironmentScore('| EDU', id);
        const LabsEquipmentEfficiency = 0;

        res.json({
            ODBM: {
                sessions,
                studentAttendance,
                studentCommitment,
                morningLine
            },
            APBM: {
                project: projectAvg,
                formative: formativeAvg,
                studentCommitment
            },
            TQBM: {
                trainingRegularity,
                training360,
                competenciesAcquisition
            },
            PDBM: {
                teachersPerformance,
                PDA
            },
            EEBM: {
                Env360,
                LabsEquipmentEfficiency
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};