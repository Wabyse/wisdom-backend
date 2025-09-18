const { PublishedNews } = require("../db/models");
require("dotenv").config();

exports.publishNews = async (req, res) => {
    try {
        const { title, description, date, organization_id } = req.body;

        const relativePath = path.join("news", organization_id.toString(), req.file.filename);

        const news = await db.PublishedNews.create({
            title,
            description,
            date,
            organization_id,
            image_path: relativePath
        });

        res.json(news);
    } catch (err) {
        console.error("Error uploading news:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
}