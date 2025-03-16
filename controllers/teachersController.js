const { TeacherEvaluation } = require("../db/models");

exports.submitEvaluation = async (req, res) => {
  try {
    const {
      type,
      teacher_id,
      employee_id,
      first_result,
      second_result,
      third_result,
      fourth_result,
      fifth_result,
      sixth_result,
    } = req.body;

    if (
      !type ||
      !teacher_id ||
      !employee_id ||
      !first_result ||
      !second_result ||
      !third_result ||
      !fourth_result ||
      !fifth_result ||
      !sixth_result
    ) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    const addEvaluation = await TeacherEvaluation.create({
      type,
      teacher_id,
      employee_id,
      first_result,
      second_result,
      third_result,
      fourth_result,
      fifth_result,
      sixth_result,
    });

    res.status(200).json({
      status: "success",
      message: "evaluation added successfully",
      data: addEvaluation,
    });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
