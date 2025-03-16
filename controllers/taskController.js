const {
  TaskCategory,
  TaskSubCategory,
  Task,
  Employee,
} = require("../db/models");
const path = require("path");

exports.viewCategories = async (req, res) => {
  try {
    const categories = await TaskCategory.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: TaskSubCategory,
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

exports.assignTask = async (req, res) => {
  try {
    const {
      task,
      description,
      start_date,
      end_date,
      importance,
      sub_category,
      assignedBy_id,
      assignee_id,
    } = req.body;

    // Check for missing fields
    if (
      !task ||
      !description ||
      !start_date ||
      !end_date ||
      !importance ||
      !sub_category ||
      !assignedBy_id ||
      !assignee_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle file upload
    let file_path = null;
    console.log(req.body);
    if (req.file) {
      file_path = path.join("uploads", req.file.filename);
    }

    // Create task
    const addTask = await Task.create({
      task,
      description,
      start_date,
      end_date,
      status: "not started yet",
      importance,
      sub_category,
      assignedBy_id,
      assignee_id,
      file_path, // Will be null if no file is uploaded
    });

    res.status(201).json({
      message: "Task assigned successfully",
      task: addTask,
    });
  } catch (error) {
    console.error("Sequelize Validation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewTasks = async (req, res) => {
  try {
    const Tasks = await Task.findAll({
      attributes: [
        "id",
        "task",
        "description",
        "start_date",
        "end_date",
        "status",
        "importance",
        "file_path",
        "createdAt"
      ],
      include: [
        {
          model: TaskSubCategory,
          as: "taskSubCategory",
          required: true,
          attributes: ["id", "name"],
          include: [
            {
              model: TaskCategory,
              as: "taskCategory",
              required: true,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Employee,
          as: "assigner",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name"],
        },
        {
          model: Employee,
          as: "assignee",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name"],
        },
      ],
    });
    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let file_path = null;
    console.log(req.body);
    console.log(req.file);
    if (req.file) {
      file_path = path.join("uploads", req.file.filename);
    }

    const updatedStatus = await Task.update({ status, submit_file_path: file_path }, { where: { id } });

    if (updatedStatus[0] === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({
      status: "success",
      message: "status got updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
