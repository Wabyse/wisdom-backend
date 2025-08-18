const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const {
  SchoolDocument,
  Department,
  Organization,
  DocCategory,
  DocSubCategory,
  User,
  Employee,
  EmployeeRole,
  Teacher,
  Subject
} = require("../db/models");

// Upload File
// controllers/fileController.js
exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { organization_id, user_id, sub_category } = req.body;
  if (!organization_id || !user_id || !sub_category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Normalize to forward slashes for clients
  const storedPath = req.file.path.replace(/\\/g, "/");

  try {
    const row = await SchoolDocument.create({
      file_path: storedPath,
      organization_id,
      user_id,
      sub_category,
    });

    // Decode originalname in case it’s mojibake
    const decodedOriginal =
      Buffer.from(req.file.originalname, "latin1").toString("utf8");

    res.json({
      message: "File uploaded successfully",
      filePath: storedPath,
      fileDetails: {
        originalname: decodedOriginal,
        savedAs: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        file: row
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Download File
exports.downloadFile = (req, res) => {
  const filename = decodeURIComponent(req.params[0]);

  // Convert stored "uploads/filename" into an actual OS-safe path
  const safePath = filename.replace(/[/\\]/g, path.sep); // normalize slashes
  const filePath = path.join(__dirname, "..", safePath); // goes into uploads/...

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "File download failed" });
    }
  });
};

// View Files
exports.viewFiles = async (req, res) => {
  try {
    const files = await SchoolDocument.findAll({
      attributes: ["id", "file_path", "createdAt"],
      include: [
        {
          model: DocSubCategory,
          as: "documentSubCategory",
          required: true,
          attributes: ["id", "name"],
          include: [
            {
              model: DocCategory,
              as: "documentCategory",
              required: true,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: User,
          as: "uploader",
          required: true,
          attributes: ["id", "code", "role_id"],
          include: [
            {
              model: Employee,
              as: "employee",
              required: false,
              attributes: ["id", "first_name", "middle_name", "last_name"],
              include: [
                {
                  model: EmployeeRole,
                  as: "role",
                  required: false,
                  attributes: ["id", "title"],
                },
                {
                  model: Organization,
                  as: "organization",
                  required: false,
                  attributes: ["id", "name", "type"],
                },
                {
                  model: Teacher,
                  as: "teacher",
                  required: false,
                  attributes: ["id"],
                  include: [
                    {
                      model: Department,
                      as: "department",
                      required: false,
                      attributes: ["id", "Name"],
                    }, {
                      model: Subject,
                      as: "subject",
                      required: false,
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Organization,
          as: "organization",
          required: true,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      files,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Open File
exports.openFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", filename);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).send("File not found");
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error serving file");
    }
  });
};

// Send File via Email
exports.sendFile = async (req, res) => {
  try {
    const { email, filename } = req.body;
    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Use environment variables for email credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Set this in your .env file
        pass: process.env.EMAIL_PASS, // Set this in your .env file
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Requested File",
      text: "Please find the attached file.",
      attachments: [{ filename, path: filePath }],
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
};

exports.viewCategories = async (req, res) => {
  try {
    const categories = await DocCategory.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: DocSubCategory,
          as: "subCategory",
          required: true,
          attributes: ["id", "name"],
        },
      ],
    });
    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
