const jwt = require("jsonwebtoken");
const { User, Employee, Teacher } = require("../db/models");
const { comparePassword, hashPassword } = require("../utils/hashPassword");
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { code, password } = req.body;
    if (!code || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ where: { code } });
    if (!user) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({
        message: "Login successful",
        id: user.id,
        code: user.code,
        token,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const signup = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      user_role_id,
      organization_id,
      emp_role_id,
      password,
      planned_sessions,
      subject_id,
      department_id,
    } = req.body;

    if (
      !first_name ||
      !middle_name ||
      !last_name ||
      !email ||
      !user_role_id ||
      !organization_id ||
      !emp_role_id ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await hashPassword(password);

    const result = await User.sequelize.transaction(async (transaction) => {
      const lastUser = await User.findOne({
        attributes: ["code"],
        order: [["code", "DESC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const newCode = lastUser?.code ? lastUser.code + 1 : 1000;

      const user = await User.create(
        {
          code: newCode,
          password: hashedPassword,
          role_id: user_role_id,
        },
        { transaction }
      );

      const employee = await Employee.create(
        {
          first_name,
          middle_name,
          last_name,
          email,
          organization_id,
          role_id: emp_role_id,
          user_id: user.id,
        },
        { transaction }
      );

      let teacher = null;
      if (emp_role_id === 1 || emp_role_id === 2) {
        if (!planned_sessions || !subject_id || !department_id) {
          return res.status(400).json({ message: "All fields are required" });
        }
        teacher = await Teacher.create(
          {
            planned_sessions,
            employee_id: employee.id,
            subject_id,
            department_id,
          },
          { transaction }
        );
      }

      return { user, employee, teacher: teacher || null };
    });

    const token = jwt.sign({ id: result.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({
        message: "User created successfully",
        code: result.user.code,
        token,
        result,
      });
  } catch (error) {
    console.error("Sequelize Validation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login };
