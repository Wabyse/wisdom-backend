const { Task, TaskDetail, User, Employee, Organization, Program, Project, Authority, sequelize } = require("../db/models");
const path = require("path");
const monthsArabic = require('../utils/months');

exports.ebdaeduViewTasks = async (req, res) => {
  try {
    const Tasks = await Task.findAll({
      attributes: [
        "id", "title", "description", "note",
        "start_date", "end_date", "importance",
        "size", "file_path", "assignee_status",
        "manager_status", "manager_quality",
        "manager_speed", "reviewer_status",
        "reviewer_quality", "reviewer_speed",
        "system", "createdAt", "updatedAt",
      ],
      where: { system: "ebdaedu" },
      include: [
        ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
          model: User,
          as: role,
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ],
        })),
        ...[
          { model: Organization, as: "organization" },
          { model: Program, as: "program" },
          { model: Project, as: "project" },
          { model: Authority, as: "authority" },
        ].map(({ model, as }) => ({
          model,
          as,
          required: true,
          attributes: ["id", "name"],
        })),
        {
          model: TaskDetail,
          as: "details",
          attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Tasks,
    });
  } catch (error) {
    console.error("❌ viewTasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.wisdomViewTasks = async (req, res) => {
  try {
    const Tasks = await Task.findAll({
      attributes: [
        "id", "title", "description", "note",
        "start_date", "end_date", "importance",
        "size", "file_path", "assignee_status",
        "manager_status", "manager_quality",
        "manager_speed", "reviewer_status",
        "reviewer_quality", "reviewer_speed",
        "system", "createdAt", "updatedAt",
      ],
      where: { system: "wisdom" },
      include: [
        ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
          model: User,
          as: role,
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ],
        })),
        ...[
          { model: Organization, as: "organization" },
          { model: Program, as: "program" },
          { model: Project, as: "project" },
          { model: Authority, as: "authority" },
        ].map(({ model, as }) => ({
          model,
          as,
          required: true,
          attributes: ["id", "name"],
        })),
        {
          model: TaskDetail,
          as: "details",
          attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Tasks,
    });
  } catch (error) {
    console.error("❌ viewTasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.watomsViewTasks = async (req, res) => {
  try {
    const Tasks = await Task.findAll({
      attributes: [
        "id", "title", "description", "note",
        "start_date", "end_date", "importance",
        "size", "file_path", "assignee_status",
        "manager_status", "manager_quality",
        "manager_speed", "reviewer_status",
        "reviewer_quality", "reviewer_speed",
        "system", "createdAt", "updatedAt",
      ],
      where: { system: "watoms" },
      include: [
        ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
          model: User,
          as: role,
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ],
        })),
        ...[
          { model: Organization, as: "organization" },
          { model: Program, as: "program" },
          { model: Project, as: "project" },
          { model: Authority, as: "authority" },
        ].map(({ model, as }) => ({
          model,
          as,
          required: true,
          attributes: ["id", "name"],
        })),
        {
          model: TaskDetail,
          as: "details",
          attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Tasks,
    });
  } catch (error) {
    console.error("❌ viewTasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.assignTask = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      task_details,
      title,
      description,
      note,
      start_date,
      end_date,
      importance,
      size,
      assigner_id,
      assignee_id,
      reviewer_id,
      manager_id,
      organization_id,
      project_id,
      program_id,
      authority_id,
      system,
    } = req.body;

    // Parse and validate task_details
    let parsedTaskDetails;
    try {
      parsedTaskDetails = JSON.parse(task_details);
      if (!Array.isArray(parsedTaskDetails) || parsedTaskDetails.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: "task_details must be a non-empty array" });
      }
    } catch {
      await t.rollback();
      return res.status(400).json({ message: "Invalid JSON in task_details" });
    }

    // Validate required fields
    const requiredFields = {
      title, description, start_date, end_date, importance, size,
      assigner_id, assignee_id, reviewer_id, manager_id,
      organization_id, project_id, program_id, authority_id, system,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        await t.rollback();
        return res.status(400).json({ message: `Missing field: ${key}` });
      }
    }

    // Handle file upload
    const file_path = req.file ? path.join("uploads", req.file.filename) : null;

    // Create Task inside transaction
    const task = await Task.create(
      {
        title,
        description,
        note,
        start_date,
        end_date,
        importance,
        size,
        assigner_id: Number(assigner_id),
        assignee_id: Number(assignee_id),
        reviewer_id: Number(reviewer_id),
        manager_id: Number(manager_id),
        file_path,
        organization_id: Number(organization_id),
        program_id: Number(program_id),
        project_id: Number(project_id),
        authority_id: Number(authority_id),
        system,
      },
      { transaction: t }
    );

    // Create Task Details
    const taskDetailsToInsert = parsedTaskDetails.map((detail, index) => ({
      task_id: task.id,
      order: index + 1,
      title: detail.title?.trim(),
      description: detail.description || null,
      note: detail.note || null,
      end_date: detail.end_date,
    }));

    await TaskDetail.bulkCreate(taskDetailsToInsert, { transaction: t });

    // Commit if all succeeded
    await t.commit();

    res.status(201).json({
      message: "Task assigned successfully",
      task,
      task_details: taskDetailsToInsert,
    });
  } catch (error) {
    //Rollback on failure
    await t.rollback();
    console.error("❌ assignTask Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.watomsViewTasks = async (req, res) => {
  try {
    const Tasks = await Task.findAll({
      attributes: [
        "id",
        "start_date",
        "end_date",
        "importance",
        "size",
        "file_path",
        "assignee_status",
        "manager_status",
        "manager_quality",
        "manager_speed",
        "reviewer_status",
        "reviewer_quality",
        "reviewer_speed",
        "system",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          as: "assigner",
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ]
        },
        {
          model: User,
          as: "assignee",
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ]
        },
        {
          model: User,
          as: "reviewer",
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ]
        },
        {
          model: User,
          as: "manager",
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ]
        },
        {
          model: Organization,
          as: "organization",
          required: true,
          attributes: ["id", "name"],
        },
        {
          model: Program,
          as: "program",
          required: true,
          attributes: ["id", "name"],
        },
        {
          model: Project,
          as: "project",
          required: true,
          attributes: ["id", "name"],
        },
        {
          model: Authority,
          as: "authority",
          required: true,
          attributes: ["id", "name"],
        },
        {
          model: TaskDetail,
          as: "details",
          attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
        }

      ],
      where: { system: "watoms" },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Tasks,
    });
  } catch (error) {
    console.error("❌ viewTasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

exports.ebdaeduGeneralInfo = async (req, res) => {
  try {

    const countTotalTasks = await Task.count({
      where: { system: "ebdaedu" }
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal', system: "ebdaedu" }
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important', system: "ebdaedu" }
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent', system: "ebdaedu" }
    });

    let avgAssigneeStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assignee_status')), 'averageAssigneeStatus']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgManagerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_quality')), 'averageManagerQuality']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgManagerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_speed')), 'averageManagerSpeed']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgManagerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_status')), 'averageManagerStatus']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgReviewerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_quality')), 'averageReviewerQuality']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgReviewerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_speed')), 'averageReviewerSpeed']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgReviewerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_status')), 'averageReviewerStatus']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    const avgAssignee = avgAssigneeStatus?.averageAssigneeStatus;
    const avgReviewer = (avgReviewerSpeed?.averageReviewerSpeed * 0.3) + (avgReviewerQuality?.averageReviewerQuality * 0.3) + (avgReviewerStatus?.averageReviewerStatus * 0.4);
    const avgManager = (avgManagerSpeed?.averageManagerSpeed * 0.3) + (avgManagerQuality?.averageManagerQuality * 0.3) + (avgManagerStatus?.averageManagerStatus * 0.4);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgReviewer * 0.5) + (avgAssignee * 0.3)
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.wisdomGeneralInfo = async (req, res) => {
  try {

    const countTotalTasks = await Task.count({
      where: { system: "wisdom" }
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal', system: "wisdom" }
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important', system: "wisdom" }
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent', system: "wisdom" }
    });

    let avgAssigneeStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assignee_status')), 'averageAssigneeStatus']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgManagerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_quality')), 'averageManagerQuality']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgManagerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_speed')), 'averageManagerSpeed']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgManagerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_status')), 'averageManagerStatus']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgReviewerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_quality')), 'averageReviewerQuality']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgReviewerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_speed')), 'averageReviewerSpeed']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgReviewerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_status')), 'averageReviewerStatus']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    const avgAssignee = avgAssigneeStatus?.averageAssigneeStatus;
    const avgReviewer = (avgReviewerSpeed?.averageReviewerSpeed * 0.3) + (avgReviewerQuality?.averageReviewerQuality * 0.3) + (avgReviewerStatus?.averageReviewerStatus * 0.4);
    const avgManager = (avgManagerSpeed?.averageManagerSpeed * 0.3) + (avgManagerQuality?.averageManagerQuality * 0.3) + (avgManagerStatus?.averageManagerStatus * 0.4);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgReviewer * 0.5) + (avgAssignee * 0.3)
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.watomsGeneralInfo = async (req, res) => {
  try {

    const countTotalTasks = await Task.count({
      where: { system: "watoms" }
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal', system: "watoms" }
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important', system: "watoms" }
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent', system: "watoms" }
    });

    let avgAssigneeStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assignee_status')), 'averageAssigneeStatus']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgManagerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_quality')), 'averageManagerQuality']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgManagerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_speed')), 'averageManagerSpeed']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgManagerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_status')), 'averageManagerStatus']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgReviewerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_quality')), 'averageReviewerQuality']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgReviewerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_speed')), 'averageReviewerSpeed']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgReviewerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_status')), 'averageReviewerStatus']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    const avgAssignee = avgAssigneeStatus?.averageAssigneeStatus;
    const avgReviewer = (avgReviewerSpeed?.averageReviewerSpeed * 0.3) + (avgReviewerQuality?.averageReviewerQuality * 0.3) + (avgReviewerStatus?.averageReviewerStatus * 0.4);
    const avgManager = (avgManagerSpeed?.averageManagerSpeed * 0.3) + (avgManagerQuality?.averageManagerQuality * 0.3) + (avgManagerStatus?.averageManagerStatus * 0.4);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgReviewer * 0.5) + (avgAssignee * 0.3)
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.ebdaEduTasksSummary = async (req, res) => {
  try {

    const countTotalTasks = await Task.count({
      where: { system: "ebdaedu" }
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal', system: "ebdaedu" }
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important', system: "ebdaedu" }
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent', system: "ebdaedu" }
    });

    let avgAssigneeStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assignee_status')), 'averageAssigneeStatus']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgManagerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_quality')), 'averageManagerQuality']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgManagerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_speed')), 'averageManagerSpeed']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgManagerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_status')), 'averageManagerStatus']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgReviewerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_quality')), 'averageReviewerQuality']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgReviewerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_speed')), 'averageReviewerSpeed']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    let avgReviewerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_status')), 'averageReviewerStatus']
      ], raw: true,
    }, {
      where: { system: "ebdaedu" }
    });

    const avgAssignee = avgAssigneeStatus?.averageAssigneeStatus;
    const avgReviewer = (avgReviewerSpeed?.averageReviewerSpeed * 0.3) + (avgReviewerQuality?.averageReviewerQuality * 0.3) + (avgReviewerStatus?.averageReviewerStatus * 0.4);
    const avgManager = (avgManagerSpeed?.averageManagerSpeed * 0.3) + (avgManagerQuality?.averageManagerQuality * 0.3) + (avgManagerStatus?.averageManagerStatus * 0.4);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgReviewer * 0.5) + (avgAssignee * 0.2)
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.wisdomTasksSummary = async (req, res) => {
  try {

    const countTotalTasks = await Task.count({
      where: { system: "wisdom" }
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal', system: "wisdom" }
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important', system: "wisdom" }
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent', system: "wisdom" }
    });

    let avgAssigneeStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assignee_status')), 'averageAssigneeStatus']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgManagerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_quality')), 'averageManagerQuality']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgManagerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_speed')), 'averageManagerSpeed']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgManagerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_status')), 'averageManagerStatus']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgReviewerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_quality')), 'averageReviewerQuality']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgReviewerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_speed')), 'averageReviewerSpeed']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    let avgReviewerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_status')), 'averageReviewerStatus']
      ], raw: true,
    }, {
      where: { system: "wisdom" }
    });

    const avgAssignee = avgAssigneeStatus?.averageAssigneeStatus;
    const avgReviewer = (avgReviewerSpeed?.averageReviewerSpeed * 0.3) + (avgReviewerQuality?.averageReviewerQuality * 0.3) + (avgReviewerStatus?.averageReviewerStatus * 0.4);
    const avgManager = (avgManagerSpeed?.averageManagerSpeed * 0.3) + (avgManagerQuality?.averageManagerQuality * 0.3) + (avgManagerStatus?.averageManagerStatus * 0.4);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgReviewer * 0.5) + (avgAssignee * 0.2)
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.watomsTasksSummary = async (req, res) => {
  try {

    const countTotalTasks = await Task.count({
      where: { system: "watoms" }
    });

    const countNormalTasks = await Task.count({
      where: { importance: 'normal', system: "watoms" }
    });

    const countImportantTasks = await Task.count({
      where: { importance: 'important', system: "watoms" }
    });

    const countUrgentTasks = await Task.count({
      where: { importance: 'urgent', system: "watoms" }
    });

    let avgAssigneeStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('assignee_status')), 'averageAssigneeStatus']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgManagerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_quality')), 'averageManagerQuality']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgManagerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_speed')), 'averageManagerSpeed']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgManagerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('manager_status')), 'averageManagerStatus']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgReviewerQuality = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_quality')), 'averageReviewerQuality']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgReviewerSpeed = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_speed')), 'averageReviewerSpeed']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    let avgReviewerStatus = await Task.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('reviewer_status')), 'averageReviewerStatus']
      ], raw: true,
    }, {
      where: { system: "watoms" }
    });

    const avgAssignee = avgAssigneeStatus?.averageAssigneeStatus;
    const avgReviewer = (avgReviewerSpeed?.averageReviewerSpeed * 0.3) + (avgReviewerQuality?.averageReviewerQuality * 0.3) + (avgReviewerStatus?.averageReviewerStatus * 0.4);
    const avgManager = (avgManagerSpeed?.averageManagerSpeed * 0.3) + (avgManagerQuality?.averageManagerQuality * 0.3) + (avgManagerStatus?.averageManagerStatus * 0.4);

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      generalData: {
        totalTasks: countTotalTasks,
        totalNormalTasks: countNormalTasks,
        totalImportantTasks: countImportantTasks,
        totalUrgentTasks: countUrgentTasks,
        totalEvaluationTasks: (avgManager * 0.3) + (avgReviewer * 0.5) + (avgAssignee * 0.2)
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.myTasks = async (req, res) => {
  try {
    const { id, system } = req.params;
    const numericId = Number(id);

    // Validate inputs
    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID provided",
      });
    }

    // User's tasks
    const tasks = await Task.findAll({
      attributes: [
        "id", "title", "description", "note",
        "start_date", "end_date", "importance",
        "size", "file_path", "assignee_status",
        "manager_status", "manager_quality",
        "manager_speed", "reviewer_status",
        "reviewer_quality", "reviewer_speed",
        "system", "createdAt", "updatedAt",
      ],
      where: { system, assignee_id: numericId },
      order: [["createdAt", "DESC"]],
      include: [
        ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
          model: User,
          as: role,
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ],
        })),
        ...[
          { model: Organization, as: "organization" },
          { model: Program, as: "program" },
          { model: Project, as: "project" },
          { model: Authority, as: "authority" },
        ].map(({ model, as }) => ({
          model,
          as,
          required: true,
          attributes: ["id", "name"],
        })),
        {
          model: TaskDetail,
          as: "details",
          attributes: ["id", "order", "title", "description", "note", "status", "end_date"],
        },
      ],
    });

    // Group tasks by month
    const groupedTasks = Object.values(
      tasks.reduce((acc, task) => {
        const month = new Date(task.start_date).getMonth();
        const monthNumber = month + 1;
        const monthName = monthsArabic.monthsArabic[month];
        if (!acc[monthNumber]) {
          acc[monthNumber] = {
            month: monthName,
            monthNumber,
            tasks: [],
          };
        }
        acc[monthNumber].tasks.push(task);
        return acc;
      }, {})
    ).sort((a, b) => a.monthNumber - b.monthNumber);

    // Respond
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      Tasks: groupedTasks,
    });
  } catch (error) {
    console.error("❌ myTasks Error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

exports.fetchTask = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    // Validate Task ID
    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID provided",
      });
    }

    // Fetch Task
    const task = await Task.findOne({
      attributes: [
        "id", "title", "description", "note",
        "start_date", "end_date", "importance",
        "size", "file_path", "assignee_status",
        "manager_status", "manager_quality",
        "manager_speed", "reviewer_status",
        "reviewer_quality", "reviewer_speed",
        "system", "createdAt", "updatedAt",
      ],
      where: { id: numericId },
      order: [["createdAt", "DESC"]],
      include: [
        ...["assigner", "assignee", "reviewer", "manager"].map((role) => ({
          model: User,
          as: role,
          required: true,
          include: [
            {
              model: Employee,
              as: "employee",
              required: true,
              attributes: ["id", "first_name", "middle_name", "last_name"],
            },
          ],
        })),
        ...[
          { model: Organization, as: "organization" },
          { model: Program, as: "program" },
          { model: Project, as: "project" },
          { model: Authority, as: "authority" },
        ].map(({ model, as }) => ({
          model,
          as,
          required: true,
          attributes: ["id", "name"],
        })),
        {
          model: TaskDetail,
          as: "details",
          attributes: [
            "id",
            "order",
            "title",
            "description",
            "note",
            "status",
            "end_date",
          ],
        },
      ],
    });

    // Handle Not Found
    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    // Success Response
    res.status(200).json({
      status: "success",
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    console.error("❌ fetchTask Error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee_status, task_details } = req.body;

    await Task.update({ assignee_status }, { where: { id } });

    let parsedTaskDetails;

    try {
      parsedTaskDetails = JSON.parse(task_details);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON in task_details" });
    }

    const taskDetailsToInsert = parsedTaskDetails.map(detail => ({
      task_id: id,
      title: detail.title,
      description: detail.description || null,
      note: detail.note || null
    }));

    await TaskDetail.bulkCreate(taskDetailsToInsert);

    res.status(200).json({
      status: "success",
      message: "task got updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};