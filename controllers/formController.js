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
    const { userId, curriculumId, questionsResult } = req.body;
    if (!userId || !curriculumId || !questionsResult) {
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
    const { userId, questionsResult } = req.body;
    if (!userId || !questionsResult) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const result = await User.sequelize.transaction(async (transaction) => {
      const form = await EnvironmentReports.create(
        {
          user_id: userId,
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

module.exports = {
  insertForm,
  fetchForm,
  fetchAllForms,
  insertCurriculumForm,
  fetchAllCurriculums,
  fetchAllDepartments,
  fetchAllUsers,
  fetchAllOrgs,
  insertEnvForm
};
