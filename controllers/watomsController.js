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
            order: [['createdAt', 'DESC']], // Most recent first
            attributes: ['id', 'title', 'description', 'date', 'image_path', 'createdAt']
        });

        // Transform the data to include full image URLs
        const transformedNewsList = newsList.map(news => {
            const newsData = news.toJSON();
            if (newsData.image_path) {
                // Convert relative path to full URL for news images
                // image_path is like "news/123/filename.jpg"
                // URL should be "/uploads/news/123/filename.jpg"
                newsData.image_url = `/uploads/${newsData.image_path}`;
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