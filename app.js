require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors"); //to let a front end uses the apis
const authRoutes = require("./routes/authRoutes");
const formRoutes = require("./routes/formRoutes");
const filesRoutes = require("./routes/filesRoutes");
const tasksRoutes = require("./routes/tasksRoutes");
const usersRoutes = require("./routes/usersRoutes");
const teachersRoutes = require("./routes/teachersRoutes");
const neqatyRoutes = require("./routes/neqatyRoutes");
const dataRoutes = require("./routes/dataRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const watomsRoutes = require("./routes/watomsRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const { sequelize } = require("./db/models");

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_BASEURL || "http://localhost:3000",
  })
);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve news images from the news directory
app.use('/news', express.static(path.join(__dirname, 'news')));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/forms", formRoutes);
// app.use("/api/v1/users", formRoutes);
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/teachers", teachersRoutes);
app.use("/api/v1/neqaty", neqatyRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/watoms", watomsRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "invalid endpoint",
  });
});

app.use(errorHandler);

const syncDatabase = async () => {
  try {
    await sequelize.authenticate(); //checking the connection
    console.log("Database connected successfully.");
    await sequelize.sync({ alter: false }); //syncronize the database with the model and alter any required alteration (true for dev, false for production)
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};
syncDatabase();

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
