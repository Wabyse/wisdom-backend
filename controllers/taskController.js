const {
  TaskCategory,
  TaskSubCategory,
  Task,
  Employee,
  sequelize,
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
        "submit_file_path",
        "task_size",
        "assigned_by_evaluation",
        "manager_evaluation",
        "createdAt",
        "updatedAt"
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
          attributes: ["id", "first_name", "middle_name", "last_name", "organization_id"],
        },
        {
          model: Employee,
          as: "assignee",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name", "organization_id"],
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

exports.generalInfo = async (req, res) => {
  try {
    const ORG_IDS = [4, 5, 7, 8, 9];

    const includeAssigneeWithOrgFilter = {
      model: Employee,
      as: 'assignee',
      where: {
        organization_id: ORG_IDS
      }
    };

    const countTotalTasks = await Task.count({
      include: [includeAssigneeWithOrgFilter]
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal' },
      include: [includeAssigneeWithOrgFilter]
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important' },
      include: [includeAssigneeWithOrgFilter]
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent' },
      include: [includeAssigneeWithOrgFilter]
    });

    let avgManagerEvaluation = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_evaluation')), 'averageManager']
      ], raw: true,
    }, {
      include: [includeAssigneeWithOrgFilter]
    });

    let avgAssignedByEvaluation = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assigned_by_evaluation')), 'averageAssignedBy']
      ], raw: true,
    }, {
      include: [includeAssigneeWithOrgFilter]
    });

    const avgManager = avgManagerEvaluation.averageMarks ? avgManagerEvaluation.averageMarks : 0;
    const avgAssignedBy = avgAssignedByEvaluation.averageAssignedBy ? avgAssignedByEvaluation.averageAssignedBy : 0;

    let allStatus = await Task.findAll({
      attributes: ["status"]
    }, {
      include: [includeAssigneeWithOrgFilter]
    })

    let sumStatus = 0;

    for(let i = 0; i < allStatus.length; i++) {
      console.log(allStatus[i].dataValues.status);
      if (allStatus[i].dataValues.status === "not started yet" || allStatus[i].dataValues.status === "in progress" || allStatus[i].dataValues.status === "on hold" || allStatus[i].dataValues.status === "past the due date") {
        sumStatus += 0;
      } else if (allStatus[i].dataValues.status === "finished" || allStatus[i].dataValues.status === "submitted" || allStatus[i].dataValues.status === "under review") {
        sumStatus += 100;
      } else {
        sumStatus += Number(allStatus[i].dataValues.status)
      }
    }

    const avgStatus = (sumStatus / allStatus.length) * 0.2

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgAssignedBy * 0.5) + Math.round(avgStatus * 100) / 100
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
