const {
  User,
  Employee,
  Teacher,
  Session,
  Class,
  Substitute,
  TeacherLatness,
  Student,
  studentAttendance,
  Stage,
  Organization,
  Incident,
  IncidentCategories,
  IncidentSubCategory,
  studentBehaviorType,
  studentBehaviorCategory,
  studentBehavior,
  EmployeeCheckInOut,
  WaitingList
} = require("../db/models");
const path = require("path");

exports.viewSchoolEmployees = async (req, res) => {
  try {
    const Users = await User.findAll({
      attributes: ["id", "code"],
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name", "organization_id"],
          where: {
            organization_id: [1, 2],
          },
          include: [
            {
              model: Teacher,
              as: "teacher",
              required: false, // allow null = LEFT OUTER JOIN
              attributes: ["id"],
            },
          ],
        },
      ],
      where: {
        '$employee.teacher.id$': null, // only users where employee has no teacher
      },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewVtcEmployees = async (req, res) => {
  try {
    const Users = await User.findAll({
      attributes: ["id", "code"],
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name", "organization_id", "role_id"],
          where: {
            organization_id: [4, 5, 7, 8, 9],
          },
          include: [
            {
              model: Teacher,
              as: "teacher",
              required: false, // allow null = LEFT OUTER JOIN
              attributes: ["id"],
            },
          ],
        },
      ],
      where: {
        '$employee.teacher.id$': null, // only users where employee has no teacher
      },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewTeacher = async (req, res) => {
  try {
    const { id } = req.body;

    const Users = await User.findAll({
      attributes: ["id", "code"],
      where: { id },
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name", "organization_id"],
          include: [
            {
              model: Teacher,
              as: "teacher",
              attributes: ["id"],
              include: [
                {
                  model: Session,
                  as: "sessions",
                  attributes: ["id"],
                  include: [
                    {
                      model: Class,
                      as: "class",
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewTeachers = async (req, res) => {
  try {
    const Users = await User.findAll({
      attributes: ["id", "code"],
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: ["id", "first_name", "middle_name", "last_name", "organization_id"],
          include: [
            {
              model: Teacher,
              as: "teacher",
              required: true,
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.submitSubstitutions = async (req, res) => {
  try {
    const substitutionsData = req.body;

    if (!Array.isArray(substitutionsData) || substitutionsData.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data array." });
    }

    const addSubstitutions = await Substitute.bulkCreate(substitutionsData, {
      validate: true,
      returning: true,
    });

    res.status(200).json({
      status: "success",
      message: "Substitutions created successfully",
      data: addSubstitutions,
    });
  } catch (error) {
    console.error("Error creating substitutions:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.submitTeacherLatness = async (req, res) => {
  try {
    const LatnessData = req.body;

    if (!Array.isArray(LatnessData) || LatnessData.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data array." });
    }

    const addLatness = await TeacherLatness.bulkCreate(LatnessData, {
      validate: true,
      returning: true,
    });

    res.status(200).json({
      status: "success",
      message: "Teacher latness data created successfully",
      data: addLatness,
    });
  } catch (error) {
    console.error("Error creating latness data:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: [
        "id",
        "first_name",
        "middle_name",
        "last_name",
        "user_id",
        "class_id",
        "school_id",
      ],
      include: [
        {
          model: Class,
          as: "class",
          required: true,
          attributes: ["name"],
        },
        {
          model: Organization,
          as: "school",
          required: true,
          attributes: ["name"],
        }
      ],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.submitStudentAbsence = async (req, res) => {
  try {
    const AbsenceData = req.body;

    if (!Array.isArray(AbsenceData) || AbsenceData.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data array." });
    }

    const addAttendance = await studentAttendance.bulkCreate(AbsenceData, {
      validate: true,
      returning: true,
    });

    res.status(200).json({
      status: "success",
      message: "Student Absence data created successfully",
      data: addAttendance,
    });
  } catch (error) {
    console.error("Error creating latness data:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewClasses = async (req, res) => {
  try {
    const students = await Class.findAll({
      attributes: ["id", "name", "stage_id", "classRoom_id"],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewStages = async (req, res) => {
  try {
    const students = await Stage.findAll({
      attributes: ["id", "name"],
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewSchools = async (req, res) => {
  try {
    const schools = await Organization.findAll({
      attributes: ["id", "name", "authority_id"],
      where: { type: "school" },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      schools,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.submitIncident = async (req, res) => {
  try {
    const { comment, location, school_id, sub_category, incident_date } =
      req.body;

    // Check for missing fields
    if (!school_id || !incident_date || !sub_category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle file upload
    let file_path = null;
    if (req.file) {
      file_path = path.join("uploads", req.file.filename);
    }

    // Create task
    const addIncident = await Incident.create({
      comment,
      location,
      file_path, // Will be null if no file is uploaded
      school_id,
      sub_category,
      incident_date,
    });

    res.status(201).json({
      message: "Incident assigned successfully",
      incident: addIncident,
    });
  } catch (error) {
    console.error("Sequelize Validation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewIncidentsCategories = async (req, res) => {
  try {
    const categories = await IncidentCategories.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: IncidentSubCategory,
          as: "incidentSubCategories",
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

exports.submitBehavior = async (req, res) => {
  try {
    const { comment, offender_id, social_worker_id, type, behavior_date } =
      req.body;

    // Check for missing fields
    if (!offender_id || !social_worker_id || !type || !behavior_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const addBehavior = await studentBehavior.create({
      comment,
      offender_id,
      social_worker_id,
      type,
      behavior_date,
    });

    res.status(201).json({
      message: "behavior assigned successfully",
      incident: addBehavior,
    });
  } catch (error) {
    console.error("Sequelize Validation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewBehaviorCategories = async (req, res) => {
  try {
    const categories = await studentBehaviorCategory.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: studentBehaviorType,
          as: "behaviorType",
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

exports.checkInOut = async (req, res) => {
  try {
    const { latitude, longitude, user_id } = req.body;

    if (!latitude || !longitude || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkInOut = await EmployeeCheckInOut.create({
      latitude,
      longitude,
      user_id
    });

    res.status(201).json({
      message: "checked In / Out successfully",
      incident: checkInOut,
    });
  } catch (error) {
    console.error("Sequelize Validation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.viewCheckInOut = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const checkInOuts = await EmployeeCheckInOut.findAll({
      attributes: ["id", "latitude", "longitude", "createdAt"],
      where: { user_id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: "Checked In / Out fetched successfully",
      checkInOuts,
    });
  } catch (error) {
    console.error("Sequelize Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addWaitingListUser = async (req, res) => {
  try {
    const waiter = await WaitingList.create();

    res.status(200).json({
      message: "User added to waiting list successfully",
      waiter,
    });
  } catch (error) {
    console.error("Sequelize Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};