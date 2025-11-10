const { sequelize, PublishedNews, ManagerEvaluationTemplate, ManagerEvaluationCategory, ManagerEvaluation, TempOrgAvgTask, ManagerComment, User, PeCandidate, TraineeRegistrationData } = require("../db/models");
const path = require("path");
const fs = require("fs");
const { hashPassword } = require("../utils/hashPassword");
require("dotenv").config();
const validator = require("validator");
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

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
                let cleanPath = newsData.image_path.replace(/\\/g, '/');

                // Remove any "uploads/" prefix if present in the path
                cleanPath = cleanPath.replace(/^\/?uploads\/news\//, 'news/');

                // News images are stored in news/ folder, so use /news route instead of /uploads
                if (cleanPath.includes('news/')) {
                    // Ensure it starts with /news/
                    if (cleanPath.startsWith('/news/')) {
                        newsData.image_url = cleanPath;
                    } else if (cleanPath.startsWith('news/')) {
                        newsData.image_url = `/${cleanPath}`;
                    } else {
                        // Extract organization ID and filename
                        const match = cleanPath.match(/news\/(\d+\/[^\/]+)/);
                        if (match) {
                            newsData.image_url = `/news/${match[1]}`;
                        } else {
                            newsData.image_url = `/${cleanPath}`;
                        }
                    }
                } else {
                    // If it doesn't contain 'news/', assume it's a regular upload
                    newsData.image_url = `/uploads/${cleanPath}`;
                }

                // Log for debugging to ensure each news has unique image
                console.log(`📰 News ID: ${newsData.id}, Image Path: ${newsData.image_path}, Image URL: ${newsData.image_url}`);
            } else {
                newsData.image_url = null;
                console.log(`⚠️ News ID: ${newsData.id} has no image_path`);
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

exports.addNewsImage = async (req, res) => {
    try {
        const { newsId } = req.params;

        // Get the news item to find organization_id
        const news = await PublishedNews.findByPk(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        const organizationId = news.organization_id;
        const relativePath = path.join("news", organizationId.toString(), req.file.filename);

        // Note: We're adding the image to the directory, but not updating the news.image_path
        // The image_path stays as the original, but getNewsImages will find all images in the directory

        res.json({
            success: true,
            message: "Image added successfully",
            image: {
                filename: req.file.filename,
                path: relativePath.replace(/\\/g, '/'),
                url: `/news/${organizationId}/${req.file.filename}`
            }
        });
    } catch (err) {
        console.error("Error adding news image:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add image",
            error: err.message
        });
    }
};

exports.addTestImagesToNews = async (req, res) => {
    try {
        const { newsId, count = 3 } = req.body;

        // Get the news item to find organization_id
        const news = await PublishedNews.findByPk(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        const organizationId = news.organization_id;
        const newsDir = path.join(__dirname, '..', 'news', organizationId.toString());

        // Ensure directory exists
        if (!fs.existsSync(newsDir)) {
            fs.mkdirSync(newsDir, { recursive: true });
        }

        // Get existing images in the directory
        const existingFiles = fs.existsSync(newsDir) ? fs.readdirSync(newsDir) : [];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        let existingImages = existingFiles.filter(file =>
            imageExtensions.includes(path.extname(file).toLowerCase())
        );

        // If no images in this directory, try to find images from other organizations
        if (existingImages.length === 0) {
            const newsBaseDir = path.join(__dirname, '..', 'news');
            if (fs.existsSync(newsBaseDir)) {
                const orgDirs = fs.readdirSync(newsBaseDir, { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => d.name);

                for (const orgId of orgDirs) {
                    const otherOrgDir = path.join(newsBaseDir, orgId);
                    const otherFiles = fs.readdirSync(otherOrgDir);
                    const otherImages = otherFiles.filter(file =>
                        imageExtensions.includes(path.extname(file).toLowerCase())
                    );

                    if (otherImages.length > 0) {
                        // Copy first image from another organization to this one
                        const sourcePath = path.join(otherOrgDir, otherImages[0]);
                        const ext = path.extname(otherImages[0]);
                        const newFilename = `imported-${Date.now()}${ext}`;
                        const destPath = path.join(newsDir, newFilename);

                        fs.copyFileSync(sourcePath, destPath);
                        existingImages = [newFilename];
                        console.log(`📸 Copied source image from org ${orgId} to org ${organizationId}`);
                        break;
                    }
                }
            }
        }

        if (existingImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No existing images found to copy. Please upload at least one image first."
            });
        }

        // Copy existing images to create test images
        const copiedImages = [];
        for (let i = 0; i < count; i++) {
            const sourceImage = existingImages[0]; // Use the first image as source
            const sourcePath = path.join(newsDir, sourceImage);
            const ext = path.extname(sourceImage);
            const timestamp = Date.now() + i;
            const newFilename = `test-${timestamp}${ext}`;
            const destPath = path.join(newsDir, newFilename);

            // Copy the file
            fs.copyFileSync(sourcePath, destPath);

            copiedImages.push({
                filename: newFilename,
                path: `news/${organizationId}/${newFilename}`,
                url: `/news/${organizationId}/${newFilename}`
            });
        }

        console.log(`✅ Added ${copiedImages.length} test images to news ${newsId}`);

        res.json({
            success: true,
            message: `Added ${copiedImages.length} test images successfully`,
            images: copiedImages
        });
    } catch (err) {
        console.error("Error adding test images:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add test images",
            error: err.message
        });
    }
};

exports.getNewsImages = async (req, res) => {
    try {
        const { newsId } = req.params;

        // Get the news item to find organization_id
        const news = await PublishedNews.findByPk(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        const organizationId = news.organization_id;
        const newsDir = path.join(__dirname, '..', 'news', organizationId.toString());

        console.log(`🔍 Fetching images for news ${newsId}, organization ${organizationId}`);
        console.log(`📁 Looking in directory: ${newsDir}`);

        // Check if directory exists
        if (!fs.existsSync(newsDir)) {
            console.log(`❌ Directory does not exist: ${newsDir}`);
            return res.json({
                success: true,
                images: []
            });
        }

        // Read all files from the directory
        const files = fs.readdirSync(newsDir);
        console.log(`📄 Found ${files.length} files in directory:`, files);

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

        // Filter only image files and create full URLs
        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                const isImage = imageExtensions.includes(ext);
                console.log(`   ${file} - ${ext} - ${isImage ? '✅ Image' : '❌ Not an image'}`);
                return isImage;
            })
            .map(file => {
                const cleanPath = `news/${organizationId}/${file}`.replace(/\\/g, '/');
                const imageData = {
                    filename: file,
                    path: cleanPath,
                    url: `/news/${organizationId}/${file}`,
                    fullUrl: null // Will be constructed on frontend with proper base URL
                };
                console.log(`   📸 Image data for news ${newsId}:`, imageData);
                return imageData;
            })
            .sort((a, b) => {
                // Sort by filename (timestamp-based) descending
                return b.filename.localeCompare(a.filename);
            });

        console.log(`✅ Returning ${images.length} images for news ${newsId}`);

        res.json({
            success: true,
            images: images
        });
    } catch (err) {
        console.error("❌ Error fetching news images:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news images",
            error: err.message
        });
    }
};

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
            theory_test_date,
            theory_start_time,
            theory_end_time,
            theory_test_score,
            practical_test_date,
            practical_start_time,
            practical_end_time,
            practical_test_score,
            fc_test_date,
            fc_start_time,
            fc_end_time,
            fc_test_score,
            nationality,
            profession,
            profession_code
        } = req.body;

        // Normalize and validate email
        const normalizedEmail = email?.toLowerCase().trim();
        if (
            !name ||
            !id_number ||
            !organization_id ||
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
                    email: normalizedEmail || null,
                    organization_id,
                    user_id: user.id,
                    category: category || null,
                    candidate_id,
                    phone_number: phone_number || null,
                    recommended_country: recommended_country || null,

                    practical_start_date: practical_test_date
                        ? new Date(`${practical_test_date}T${practical_start_time || "00:00:00"}`)
                        : null,
                    practical_end_date: practical_test_date
                        ? new Date(`${practical_test_date}T${practical_end_time || "00:00:00"}`)
                        : null,
                    practical_test_score: practical_test_score || null,

                    theory_start_date: theory_test_date
                        ? new Date(`${theory_test_date}T${theory_start_time || "00:00:00"}`)
                        : null,
                    theory_end_date: theory_test_date
                        ? new Date(`${theory_test_date}T${theory_end_time || "00:00:00"}`)
                        : null,
                    theory_test_score: theory_test_score || null,

                    fc_start_date: fc_test_date
                        ? new Date(`${fc_test_date}T${fc_start_time || "00:00:00"}`)
                        : null,
                    fc_end_date: fc_test_date
                        ? new Date(`${fc_test_date}T${fc_end_time || "00:00:00"}`)
                        : null,
                    fc_test_score: fc_test_score || null,
                    nationality: nationality || null,
                    profession: profession || null,
                    profession_code: profession_code || null,
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
            theory_test_date,
            theory_start_time,
            theory_end_time,
            theory_test_score,
            practical_test_date,
            practical_start_time,
            practical_end_time,
            practical_test_score,
            fc_test_date,
            fc_start_time,
            fc_end_time,
            fc_test_score,
            nationality,
            profession,
            profession_code
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
            !organization_id ||
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
                email: normalizedEmail || null,
                organization_id,
                category: category || null,
                phone_number: phone_number || null,
                recommended_country: recommended_country || null,

                practical_start_date: practical_test_date
                    ? new Date(`${practical_test_date}T${practical_start_time || "00:00:00"}`)
                    : null,
                practical_end_date: practical_test_date
                    ? new Date(`${practical_test_date}T${practical_end_time || "00:00:00"}`)
                    : null,
                practical_test_score: practical_test_score || null,

                theory_start_date: theory_test_date
                    ? new Date(`${theory_test_date}T${theory_start_time || "00:00:00"}`)
                    : null,
                theory_end_date: theory_test_date
                    ? new Date(`${theory_test_date}T${theory_end_time || "00:00:00"}`)
                    : null,
                theory_test_score: theory_test_score || null,

                fc_start_date: fc_test_date
                    ? new Date(`${fc_test_date}T${fc_start_time || "00:00:00"}`)
                    : null,
                fc_end_date: fc_test_date
                    ? new Date(`${fc_test_date}T${fc_end_time || "00:00:00"}`)
                    : null,
                fc_test_score: fc_test_score || null,
                nationality: nationality || null,
                profession: profession || null,
                profession_code: profession_code || null,
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

exports.checkTrainee = async (req, res) => {
    try {
        const { selectedUsers } = req.body;

        if (!Array.isArray(selectedUsers) || selectedUsers.length === 0) {
            return res.status(400).json({ message: "selectedUsers must be a non-empty array" });
        }

        const [updatedCount] = await TraineeRegistrationData.update(
            { is_new: false },
            { where: { id: { [Op.in]: selectedUsers } } }
        );

        return res.status(200).json({
            message: `${updatedCount} trainees updated successfully.`,
            updatedCount,
        });
    } catch (error) {
        console.error("Error updating trainees:", error);
        res.status(500).json({
            message: error.message || "Server error while updating users",
        });
    }
};