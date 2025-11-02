require("dotenv").config({ path: `${process.cwd()}/.env` });
const path = require("path");
const fs = require("fs");
const { sequelize, PublishedNews } = require("../db/models");

async function generateTestImages() {
    try {
        console.log("🚀 Starting test image generation...\n");

        // Get all news items
        const newsList = await PublishedNews.findAll({
            attributes: ['id', 'title', 'organization_id', 'image_path'],
            order: [['id', 'ASC']]
        });

        console.log(`📰 Found ${newsList.length} news items\n`);

        // Find organizations with images that we can use as sources
        const newsDir = path.join(__dirname, '..', 'news');
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        
        // Find a source image from any organization
        let sourceImagePath = null;
        let sourceOrgId = null;
        
        if (fs.existsSync(newsDir)) {
            const orgDirs = fs.readdirSync(newsDir, { withFileTypes: true })
                .filter(d => d.isDirectory())
                .map(d => d.name);
            
            for (const orgId of orgDirs) {
                const orgDir = path.join(newsDir, orgId);
                const files = fs.readdirSync(orgDir);
                const imageFiles = files.filter(file => 
                    imageExtensions.includes(path.extname(file).toLowerCase())
                );
                
                if (imageFiles.length > 0) {
                    sourceImagePath = path.join(orgDir, imageFiles[0]);
                    sourceOrgId = orgId;
                    console.log(`📸 Found source image in org ${orgId}: ${imageFiles[0]}\n`);
                    break;
                }
            }
        }

        if (!sourceImagePath) {
            console.error("❌ No source images found! Please upload at least one image to any organization directory.");
            process.exit(1);
        }

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Process each news item
        for (const news of newsList) {
            try {
                const orgId = news.organization_id.toString();
                const orgDir = path.join(newsDir, orgId);

                // Ensure directory exists
                if (!fs.existsSync(orgDir)) {
                    fs.mkdirSync(orgDir, { recursive: true });
                    console.log(`📁 Created directory for org ${orgId}`);
                }

                // Check if directory already has images
                const existingFiles = fs.readdirSync(orgDir);
                const existingImages = existingFiles.filter(file => 
                    imageExtensions.includes(path.extname(file).toLowerCase())
                );

                // If already has images, skip or add more
                if (existingImages.length >= 3) {
                    console.log(`⏭️  News ${news.id} (org ${orgId}): Already has ${existingImages.length} images, skipping`);
                    skipCount++;
                    continue;
                }

                // Determine how many images to create
                const imagesNeeded = Math.max(3 - existingImages.length, 0);
                
                if (imagesNeeded === 0) {
                    console.log(`⏭️  News ${news.id} (org ${orgId}): Already has enough images`);
                    skipCount++;
                    continue;
                }

                // Use existing image in directory if available, otherwise use source image
                let imageToCopy = sourceImagePath;
                if (existingImages.length > 0) {
                    imageToCopy = path.join(orgDir, existingImages[0]);
                }

                // Copy images
                const copiedImages = [];
                for (let i = 0; i < imagesNeeded; i++) {
                    const ext = path.extname(imageToCopy);
                    const timestamp = Date.now() + i + successCount * 10; // Ensure uniqueness
                    const newFilename = `test-${timestamp}${ext}`;
                    const destPath = path.join(orgDir, newFilename);

                    fs.copyFileSync(imageToCopy, destPath);
                    copiedImages.push(newFilename);
                }

                console.log(`✅ News ${news.id} (org ${orgId}): Added ${copiedImages.length} test images`);
                console.log(`   Files: ${copiedImages.join(', ')}`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error processing news ${news.id}:`, error.message);
                errorCount++;
            }
        }

        console.log("\n" + "=".repeat(50));
        console.log("📊 Summary:");
        console.log(`   ✅ Successfully processed: ${successCount} news items`);
        console.log(`   ⏭️  Skipped: ${skipCount} news items`);
        console.log(`   ❌ Errors: ${errorCount} news items`);
        console.log("=".repeat(50) + "\n");

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Fatal error:", error);
        await sequelize.close();
        process.exit(1);
    }
}

// Run the script
generateTestImages();

