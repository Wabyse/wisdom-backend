const jwt = require("jsonwebtoken");
const {
  User,
  IndividualReport,
  QuestionResult,
  Question,
  Field,
  Form,
  CurriculumReport,
  CurriculumResult,
  Curriculum,
  SubField,
  Department,
  Employee,
  Teacher,
  Organization,
  EnvironmentReports,
  EnvironmentResults,
  TraineeRegistrationData
} = require("../db/models");
require("dotenv").config();

const insertForm = async (req, res) => {
  try {
    const { assessor, assessee, questionsResult } = req.body;
    if (!assessor || !assessee || !questionsResult) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const result = await User.sequelize.transaction(async (transaction) => {
      const form = await IndividualReport.create(
        {
          Assessor_id: assessor,
          Assessee_id: assessee,
        },
        { transaction }
      );
      const answers = questionsResult.map((question) => ({
        score: question.result,
        question_id: question.question_id,
        report_id: form.id,
      }));
      await QuestionResult.bulkCreate(answers, { validate: true, transaction });
      return { form, answers };
    });
    res
      .status(201)
      .json({ message: "form inserted successfully", result, questionsResult });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const insertCurriculumForm = async (req, res) => {
  try {
    const { userId, curriculumId, organization_id, questionsResult } = req.body;
    if (!userId || !curriculumId || !questionsResult || !organization_id) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const result = await User.sequelize.transaction(async (transaction) => {
      const form = await CurriculumReport.create(
        {
          Assessor_id: userId,
          curriculum_id: curriculumId,
          organization_id
        },
        { transaction }
      );
      const answers = questionsResult.map((question) => ({
        score: question.result,
        question_id: question.question_id,
        report_id: form.id,
      }));
      await CurriculumResult.bulkCreate(answers, {
        validate: true,
        transaction,
      });
      return { form, answers };
    });
    res
      .status(201)
      .json({ message: "form inserted successfully", result, questionsResult });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const insertEnvForm = async (req, res) => {
  try {
    const { userId, organization_id, questionsResult } = req.body;
    if (!userId || !questionsResult || !organization_id) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const result = await User.sequelize.transaction(async (transaction) => {
      const form = await EnvironmentReports.create(
        {
          user_id: userId,
          organization_id
        },
        { transaction }
      );
      const answers = questionsResult.map((question) => ({
        score: question.result,
        question_id: question.question_id,
        report_id: form.id,
      }));
      await EnvironmentResults.bulkCreate(answers, {
        validate: true,
        transaction,
      });
      return { form, answers };
    });
    res
      .status(201)
      .json({ message: "form inserted successfully", result, questionsResult });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const fetchForm = async (req, res) => {
  try {
    const { formId } = req.body;

    if (!formId || isNaN(formId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid formId is required",
      });
    }

    const data = await Question.findAll({
      attributes: [
        ["id", "question_id"],
        ["en_name", "question_en_name"],
        ["ar_name", "question_ar_name"],
        ["weight", "question_weight"],
        ["max_score", "question_max_score"],
      ],
      include: [
        {
          model: SubField,
          as: "sub_field",
          required: true,
          attributes: [
            ["id", "sub_field_id"],
            ["en_name", "sub_field_en_name"],
            ["ar_name", "sub_field_ar_name"],
            ["weight", "sub_field_weight"],
            "field_id",
          ],
          include: [
            {
              model: Field,
              as: "field",
              required: true,
              attributes: [
                ["id", "field_id"],
                ["en_name", "field_en_name"],
                ["ar_name", "field_ar_name"],
                ["weight", "field_weight"],
                "form_id",
              ],
              include: [
                {
                  model: Form,
                  as: "form",
                  required: true,
                  attributes: [
                    ["weight", "form_weight"],
                    ["type", "form_type"],
                    ["code", "form_code"]
                  ],
                  where: { id: formId },
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const fetchAllForms = async (req, res) => {
  try {
    const data = await Form.findAll({
      attributes: ["id", "en_name", "ar_name", "code", "type"],
    });
    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const fetchAllCurriculums = async (req, res) => {
  try {
    const data = await Curriculum.findAll({
      attributes: ["id", "code"],
    });
    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const fetchAllDepartments = async (req, res) => {
  try {
    const data = await Department.findAll({
      attributes: ["id", "Name"],
    });
    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    const { userId, departmentId } = req.query;

    const data = await User.findAll({
      where: userId ? { id: userId } : {},
      attributes: ["id", "code"],
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: [
            ["id", "employee_id"],
            ["first_name", "employee_first_name"],
            ["middle_name", "employee_middle_name"],
            ["last_name", "employee_last_name"],
            "organization_id",
          ],
          include: [
            {
              model: Teacher,
              as: "teacher",
              attributes: ["department_id"],
              include: [
                {
                  model: Department,
                  as: "department",
                  required: true,
                  attributes: [["Name", "department_name"]],
                  where: departmentId ? { id: departmentId } : {},
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const fetchAllOrgs = async (req, res) => {
  try {
    const data = await Organization.findAll({
      attributes: ["id", "name", "type"],
    });

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const insertBulkStudentsFormsTeacher = async (req, res) => {
  try {
    const forms = req.body;

    if (!Array.isArray(forms) || forms.length === 0) {
      return res.status(400).json({ message: "students array is required" });
    }

    const createdResults = [];

    for (const formData of forms) {
      const {
        student_user_id,
        teacher_user_id,
        form_results
      } = formData;

      // Create Individual Report
      const formReport = await IndividualReport.create({
        Assessor_id: student_user_id,
        Assessee_id: teacher_user_id
      });

      // Create all Question Results
      for (const questionResult of form_results) {
        await QuestionResult.create({
          report_id: formReport.id,
          score: questionResult.score,
          question_id: questionResult.id,
        });
      }

      // Add to response array
      createdResults.push({
        student_user_id,
        teacher_user_id,
        report_id: formReport.id
      });
    }

    // Final response
    res.status(201).json({
      message: "data inserted successfully",
      created: createdResults.length,
      users: createdResults,
    });
  } catch (error) {
    console.error("Bulk Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const insertBulkCurriculumForms = async (req, res) => {
  const transaction = await User.sequelize.transaction();

  try {
    const forms = req.body;

    if (!Array.isArray(forms) || forms.length === 0) {
      await transaction.rollback(); // Rollback if bad input
      return res.status(400).json({ message: "students array is required" });
    }

    const createdResults = [];

    for (const formData of forms) {
      const {
        assessor_id,
        curriculum_id,
        organization_id,
        form_results,
      } = formData;

      // Create Report
      const formReport = await CurriculumReport.create({
        Assessor_id: assessor_id,
        curriculum_id,
        organization_id
      }, { transaction });

      // Create Question Results
      for (const questionResult of form_results) {
        await CurriculumResult.create({
          report_id: formReport.id,
          score: questionResult.score,
          question_id: questionResult.id,
        }, { transaction });
      }

      createdResults.push({
        student_user_id,
        teacher_user_id,
        report_id: formReport.id
      });
    }

    await transaction.commit(); // Commit everything
    res.status(201).json({
      message: "data inserted successfully",
      created: createdResults.length,
      users: createdResults,
    });

  } catch (error) {
    await transaction.rollback(); // Rollback everything on error
    console.error("Bulk Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const insertBulkEnvironmentForms = async (req, res) => {
  const transaction = await User.sequelize.transaction();

  try {
    const forms = req.body;

    if (!Array.isArray(forms) || forms.length === 0) {
      await transaction.rollback(); // Rollback if bad input
      return res.status(400).json({ message: "students array is required" });
    }

    const createdResults = [];

    for (const formData of forms) {
      const {
        assessor_id,
        organization_id,
        form_results,
      } = formData;

      // Create Report
      const formReport = await EnvironmentReports.create({
        user_id: assessor_id,
        organization_id
      }, { transaction });

      // Create Question Results
      for (const questionResult of form_results) {
        await EnvironmentResults.create({
          report_id: formReport.id,
          score: questionResult.score,
          question_id: questionResult.id,
        }, { transaction });
      }

      createdResults.push({
        assessor_id,
        organization_id,
        report_id: formReport.id
      });
    }

    await transaction.commit(); // Commit everything
    res.status(201).json({
      message: "data inserted successfully",
      created: createdResults.length,
      users: createdResults,
    });

  } catch (error) {
    await transaction.rollback(); // Rollback everything on error
    console.error("Bulk Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const insertTraineeForm = async (req, res) => {
  try {
    const {
      first_name,
      second_name,
      third_name,   // ✅ correct spelling
      fourth_name,
      birth_date,
      vtc,
      gov,
      course,
      email,
      certification,
      school,
      known_us,
      phone,
      whatsapp,
      notes
    } = req.body;

    // required fields check
    const required = {
      first_name,
      second_name,
      third_name,   // ✅ make sure this is required if your schema requires it
      fourth_name,
      birth_date,
      vtc,
      gov,
      course,
      certification,
      school,
      known_us,
      phone,
      whatsapp,
    };

    for (const [key, value] of Object.entries(required)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ status: "fail", message: `Field "${key}" is required` });
      }
    }

    const traineeEmail = email || "test@test.com";

    const form = await TraineeRegistrationData.create({
      first_name,
      second_name,
      third_name,   // ✅ same spelling here
      fourth_name,
      birth_date,
      vtc,
      gov,
      course,
      email: traineeEmail,
      certification,
      school,
      known_us,
      phone,
      whatsapp,
      notes
    });

    return res.status(201).json({
      status: "success",
      message: "Form inserted successfully",
      form
    });
  } catch (error) {
    // Make validation & duplicate errors visible to the client
    // Mongoose:
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "fail", message: error.message, details: error.errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ status: "fail", message: "Duplicate key", keyValue: error.keyValue });
    }
    // Sequelize (if you use it):
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ status: "fail", message: error.message, errors: error.errors });
    }

    console.error("Insert trainee error:", error); // helpful in dev
    return res.status(500).json({ status: "error", message: "Server error", error: error.message });
  }
};

module.exports = {
  insertForm,
  fetchForm,
  fetchAllForms,
  insertCurriculumForm,
  fetchAllCurriculums,
  fetchAllDepartments,
  fetchAllUsers,
  fetchAllOrgs,
  insertEnvForm,
  insertBulkStudentsFormsTeacher,
  insertBulkCurriculumForms,
  insertBulkEnvironmentForms,
  insertTraineeForm
};
