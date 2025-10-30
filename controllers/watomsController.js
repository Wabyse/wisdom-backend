const { sequelize, PublishedNews, ManagerEvaluationTemplate, ManagerEvaluationCategory, ManagerEvaluation, TempOrgAvgTask, ManagerComment, User, PeCandidate } = require("../db/models");
const path = require("path");
const { hashPassword } = require("../utils/hashPassword");
require("dotenv").config();
const validator = require("validator");
const jwt = require('jsonwebtoken');

exports.publishNews = async (req, res) => {
    try {
        const { title, description, date, organization_id } = req.body;

        // Define relativePath based on whether a file was uploaded
        let relativePath = null;
        if (req.file) {
            relativePath = path.join("news", organization_id.toString(), req.file.filename);
        }

        const news = await PublishedNews.create({
            title,
            description,
            date,
            organization_id,
            image_path: relativePath
        });

        res.json({ message: "News published successfully", news });
    } catch (err) {
        console.error("Error uploading news:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
}

exports.getNewsList = async (req, res) => {
    try {
        const { organization_id } = req.query;

        // Build where clause for filtering by organization
        const whereClause = organization_id ? { organization_id } : {};

        const newsList = await PublishedNews.findAll({
            where: whereClause,
            order: [['date', 'DESC']], // Most recent first
            attributes: [
                'id', 'title', 'description', 'date',
                'image_path', 'organization_id', 'notification', 'createdAt'
            ]
        });

        // Transform the data to include full image URLs
        const transformedNewsList = newsList.map(news => {
            const newsData = news.toJSON();
            if (newsData.image_path) {
                // Replace backslashes with forward slashes
                const cleanPath = newsData.image_path.replace(/\\/g, '/');
                newsData.image_url = `/uploads/${cleanPath}`;
            } else {
                newsData.image_url = null;
            }
            return newsData;
        });

        res.json({
            success: true,
            count: transformedNewsList.length,
            data: transformedNewsList
        });
    } catch (err) {
        console.error("Error fetching news list:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news list",
            error: err.message
        });
    }
}

exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { notification } = req.body;

        // Validate input
        if (typeof notification !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Notification value must be a boolean (true or false)"
            });
        }

        // Check if the news exists
        const news = await PublishedNews.findByPk(id);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        // Update the notification status
        await PublishedNews.update(
            { notification },
            { where: { id } }
        );

        // Fetch the updated news to return
        const updatedNews = await PublishedNews.findByPk(id, {
            attributes: ['id', 'title', 'description', 'date', 'image_path', 'organization_id', 'notification', 'updatedAt']
        });

        res.json({
            success: true,
            message: "Notification status updated successfully",
            data: updatedNews
        });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update notification status",
            error: err.message
        });
    }
}

exports.getManagerEvaluationTemplate = async (req, res) => {
    try {
        const categories = await ManagerEvaluationCategory.findAll({
            attributes: ['id', 'title'],
            include: [
                {
                    model: ManagerEvaluationTemplate,
                    as: 'templates',
                    attributes: ['id', 'title', 'max_score']
                }
            ],
            order: [['id', 'ASC']]
        });

        // Transform into the desired shape
        const result = categories.map(category => ({
            title: category.title,
            statements: category.templates.map(statement => ({
                id: statement.id,
                title: statement.title,
                max_score: statement.max_score
            }))
        }));

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.submitManagerEvaluation = async (req, res) => {
    try {
        const { employee_id, date, evaluations } = req.body;

        // Flatten the evaluations array into allEvaluation
        const allEvaluation = [
            ...evaluations[0].statements,
            ...evaluations[1].statements,
            ...evaluations[2].statements
        ];

        // Build bulk insert data
        const records = allEvaluation.map(ev => ({
            employee_id,
            date,
            status: 'confirmed',
            score: ev.score,
            template_id: ev.id
        }));

        // Insert bulk data
        await ManagerEvaluation.bulkCreate(records);

        res.json({
            success: true,
            count: records.length,
            message: `${records.length} evaluations submitted successfully`
        });
    } catch (err) {
        console.error("Error submitting manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit manager evaluation",
            error: err.message
        });
    }
};

exports.getManagerEvaluations = async (req, res) => {
    try {

        const { id } = req.params;

        const evaluations = await ManagerEvaluation.findAll({
            attributes: ['id', 'score', 'date', 'status'],
            where: { employee_id: id },
            include: [
                {
                    model: ManagerEvaluationTemplate,
                    as: 'template',
                    attributes: ['title', 'max_score']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: evaluations
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.getEmployeeEvaluation = async (req, res) => {
    try {

        const { id, month } = req.params;

        if (!id || !month) {
            return res.status(400).json({
                success: false,
                message: "employee_id and month are required"
            });
        }

        const evaluations = await ManagerEvaluation.findAll({
            attributes: ['id', 'score', 'date', 'status'],
            where: { employee_id: id, date: month },
            include: [
                {
                    model: ManagerEvaluationTemplate,
                    as: 'template',
                    attributes: ['title', 'max_score']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: evaluations
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.updateManagerEvaluation = async (req, res) => {
    try {
        const { employee_id, date, evaluations } = req.body;

        // Flatten evaluations into a single array
        const allEvaluation = [
            ...evaluations[0].statements,
            ...evaluations[1].statements,
            ...evaluations[2].statements,
        ];

        // Loop and update each record
        for (const ev of allEvaluation) {
            await ManagerEvaluation.update(
                { score: ev.score }, // update only score
                {
                    where: {
                        employee_id,
                        date,
                        template_id: ev.id, // template id is the link to the statement
                    },
                }
            );
        }

        res.json({
            success: true,
            count: allEvaluation.length,
            message: `${allEvaluation.length} evaluations updated successfully`,
        });
    } catch (err) {
        console.error("Error updating manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update manager evaluation",
            error: err.message,
        });
    }
};

exports.submitOrgTaskAvg = async (req, res) => {
    try {
        const { score, date, organization_id } = req.body;

        // Build bulk insert data
        const taskScore = await TempOrgAvgTask.create({
            score,
            date,
            organization_id,
        });

        res.json({
            success: true,
            taskScore
        });
    } catch (err) {
        console.error("Error submitting manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit manager evaluation",
            error: err.message
        });
    }
};

exports.getOrgTasksAvg = async (req, res) => {
    try {

        const { id } = req.params;

        const avgTasks = await TempOrgAvgTask.findAll({
            attributes: ['id', 'score', 'date', 'organization_id'],
            where: { organization_id: id },
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: avgTasks
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.submitManagerComment = async (req, res) => {
    try {
        const { comment, type, date, employee_id } = req.body;

        // Build bulk insert data
        const managerComment = await ManagerComment.create({
            comment,
            type,
            date,
            employee_id
        });

        res.json({
            success: true,
            managerComment
        });
    } catch (err) {
        console.error("Error submitting manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit manager evaluation",
            error: err.message
        });
    }
};

exports.getManagerComments = async (req, res) => {
    try {

        const { id } = req.params;

        const managerComments = await ManagerComment.findAll({
            attributes: ["comment", "type", "date"],
            where: { employee_id: id },
            order: [
                [
                    sequelize.literal(`CASE 
                        WHEN type = 'سلبي' THEN 1
                        WHEN type = 'ايجابي' THEN 2
                    END`),
                    "ASC"
                ],
                ["date", "DESC"]
            ]
        });

        res.json({
            success: true,
            data: managerComments
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.getCandidatesData = async (req, res) => {
    try {

        const candidates = await PeCandidate.findAll({
            order: [['id', 'DESC']],
        });

        res.json({
            success: true,
            candidates
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.createCandidateUser = async (req, res) => {
    try {
        const {
            name,
            id_number,
            passport_number,
            email,
            organization_id,
            category,
            candidate_id,
            phone_number,
            recommended_country,
            self_test_date,
            personal_test_date,
            theory_test_date,
            self_test_time,
            personal_test_time,
            theory_test_time,
        } = req.body;

        console.log(req.body)

        // Normalize and validate email
        const normalizedEmail = email?.toLowerCase().trim();
        if (
            !name ||
            !id_number ||
            !normalizedEmail ||
            !organization_id ||
            !category ||
            !phone_number ||
            !candidate_id
        ) {
            return res.status(400).json({ message: "Missing required fields" });
        }


        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Generate random password and candidate_id
        const password = Math.floor(10000 + Math.random() * 90000).toString();
        const hashedPassword = await hashPassword(password);

        // Transaction for user + candidate creation
        const result = await User.sequelize.transaction(async (transaction) => {
            const lastUser = await User.findOne({
                attributes: ["code"],
                order: [["code", "DESC"]],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const newCode = lastUser?.code ? lastUser.code + 1 : 1000;

            const user = await User.create(
                {
                    code: newCode,
                    password: hashedPassword,
                    role_id: 33,
                },
                { transaction }
            );

            const clean = (v) => (v === "" ? null : v);

            const candidate_data = await PeCandidate.create(
                {
                    name,
                    id_number,
                    passport_number: clean(passport_number),
                    email: normalizedEmail,
                    organization_id,
                    user_id: user.id,
                    category,
                    candidate_id,
                    phone_number,
                    recommended_country: clean(recommended_country),
                    self_test_date: self_test_date
                        ? new Date(`${self_test_date}T${self_test_time || "00:00:00"}`)
                        : null,

                    personal_test_date: personal_test_date
                        ? new Date(`${personal_test_date}T${personal_test_time || "00:00:00"}`)
                        : null,

                    theory_test_date: theory_test_date
                        ? new Date(`${theory_test_date}T${theory_test_time || "00:00:00"}`)
                        : null
                },
                { transaction }
            );

            // ✅ return both so we can access them later
            return { user, candidate_data };
        });

        // JWT setup
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({ id: result.user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(201).json({
            message: "User created successfully",
            code: result.user.code,
            token,
            candidate_data: result.candidate_data,
            password, // return raw password (consider removing later for security)
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};

exports.updateCandidateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            id_number,
            passport_number,
            email,
            organization_id,
            category,
            candidate_id,
            phone_number,
            recommended_country,
            self_test_date,
            personal_test_date,
            theory_test_date,
            self_test_time,
            personal_test_time,
            theory_test_time,
        } = req.body;

        // ✅ Check if candidate exists
        const candidate = await PeCandidate.findByPk(id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // ✅ Normalize & validate email
        const normalizedEmail = email?.toLowerCase().trim();
        if (
            !name ||
            !id_number ||
            !normalizedEmail ||
            !organization_id ||
            !category ||
            !phone_number ||
            !candidate_id
        ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // ✅ Start safe transaction
        const result = await PeCandidate.sequelize.transaction(async (transaction) => {
            const clean = (v) => (v === "" ? null : v);

            // ✅ Build update object
            const updateData = {
                name,
                id_number,
                passport_number: clean(passport_number),
                email: normalizedEmail,
                organization_id,
                category,
                phone_number,
                recommended_country: clean(recommended_country),

                // ✅ Combine date + time into proper ISO format
                self_test_date:
                    self_test_date && self_test_time
                        ? new Date(`${self_test_date}T${self_test_time}`)
                        : clean(self_test_date),

                personal_test_date:
                    personal_test_date && personal_test_time
                        ? new Date(`${personal_test_date}T${personal_test_time}`)
                        : clean(personal_test_date),

                theory_test_date:
                    theory_test_date && theory_test_time
                        ? new Date(`${theory_test_date}T${theory_test_time}`)
                        : clean(theory_test_date),
            };

            // ✅ Only update candidate_id if it’s actually different
            if (candidate.candidate_id !== candidate_id) {
                updateData.candidate_id = candidate_id;
            }

            const candidate_data = await candidate.update(updateData, { transaction });
            return { candidate_data };
        });

        // ✅ Return 200 for updates
        res.status(200).json({
            message: "Candidate updated successfully",
            candidate_data: result.candidate_data,
        });
    } catch (error) {
        console.error("Update Candidate Error:", error);

        // ✅ Handle duplicate constraint error cleanly
        if (error.name === "SequelizeUniqueConstraintError") {
            return res
                .status(409)
                .json({
                    message: `Duplicate value for a unique field: ${error.errors[0]?.message}`,
                });
        }

        res.status(500).json({
            message: error.message || "Server error while updating candidate",
        });
    }
};