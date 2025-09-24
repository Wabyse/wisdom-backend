const { PublishedNews } = require("../db/models");
const path = require("path");
require("dotenv").config();

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