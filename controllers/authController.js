const validator = require("validator");
const jwt = require("jsonwebtoken");
const {
  User,
  Employee,
  Teacher,
  UserRole,
  Organization,
  Student,
  EmployeeRole,
  Department,
  AdminsUsers,
  Class,
  Specialization
} = require("../db/models");
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

    const userRole = await UserRole.findOne({ where: { id: user.role_id } });

    let organization = null;
    let department = null; // Declare organization outside the if block
    let employeeRole = null;
    let employee = null;

    if (userRole.title !== "Student") {
      employee = await Employee.findOne({ where: { user_id: user.id } });
      if (employee) {
        organization = await Organization.findOne({
          where: { id: employee.organization_id },
        });
      }
      employeeRole = await EmployeeRole.findOne({
        where: { id: employee.role_id },
      });
      if (employeeRole && (employeeRole.title === "Teacher" || employeeRole.title === "HOD")) {
        const teacher = await Teacher.findOne({
          where: { employee_id: employee.id },
        });
        department = await Department.findOne({
          where: { id: teacher.department_id },
        });
      }
    } else {
      const student = await Student.findOne({ where: { user_id: user.id } });
      if (student) {
        organization = await Organization.findOne({
          where: { id: student.school_id },
        });
      }
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid code or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      id: user.id,
      code: user.code,
      organization_id: organization ? organization.id : null,
      department_id: department ? department.id : null,
      user_role: userRole.title,
      employee_id: employee ? employee.id : null,
      employee_role: employeeRole ? employeeRole.title : null,
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
      class_id,
      specialization_id,
    } = req.body;

    // Normalize and validate email
    const normalizedEmail = email?.toLowerCase().trim();
    if (
      !first_name ||
      !last_name ||
      !normalizedEmail ||
      !user_role_id ||
      !organization_id ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const Role = await UserRole.findOne({
      attributes: ["title"],
      where: { id: user_role_id },
    });

    if (!Role) {
      return res.status(400).json({ message: "Invalid user role ID" });
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

      if (Role.title === "Student") {
        if (!class_id || !specialization_id) {
          throw new Error("Missing class or specialization");
        }

        const student = await Student.create(
          {
            first_name,
            middle_name,
            last_name,
            email: normalizedEmail,
            user_id: user.id,
            class_id,
            specialization_id,
            school_id: organization_id,
          },
          { transaction }
        );

        return { user, student };
      } else {
        if (!emp_role_id) {
          throw new Error("Missing employee role ID");
        }

        const employee = await Employee.create(
          {
            first_name,
            middle_name,
            last_name,
            email: normalizedEmail,
            organization_id,
            role_id: emp_role_id,
            user_id: user.id,
          },
          { transaction }
        );

        let teacher = null;
        if (
          Role.title === "Teacher" ||
          Role.title === "Head of Department (HOD)"
        ) {
          if (!planned_sessions || !subject_id || !department_id) {
            throw new Error("Missing teacher details");
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
      }
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ id: result.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      code: result.user.code,
      token,
      result,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const signupBulk = async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" });
    }

    const createdResults = [];

    await User.sequelize.transaction(async (transaction) => {
      const lastUser = await User.findOne({
        attributes: ["code"],
        order: [["code", "DESC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      let newCode = lastUser?.code ? lastUser.code + 1 : 1000;

      for (const userData of users) {
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
          class_id,
          specialization_id,
        } = userData;

        const normalizedEmail = email?.toLowerCase().trim();

        if (
          !first_name ||
          !last_name ||
          !normalizedEmail ||
          !user_role_id ||
          !organization_id ||
          !password
        ) {
          throw new Error(`Missing required fields for email: ${email}`);
        }

        if (!validator.isEmail(normalizedEmail)) {
          throw new Error(`Invalid email format: ${email}`);
        }

        const Role = await UserRole.findOne({
          attributes: ["title"],
          where: { id: user_role_id },
          transaction,
        });

        if (!Role) {
          throw new Error(`Invalid user role ID for email: ${email}`);
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create(
          {
            code: newCode++,
            password: hashedPassword,
            role_id: user_role_id,
          },
          { transaction }
        );

        // Get organization name
        const organization = await Organization.findByPk(organization_id, {
          attributes: ['name'],
          transaction,
        });

        let outputData = {
          first_name,
          middle_name,
          last_name,
          email: normalizedEmail,
          code: user.code,
          password,
          organization: organization?.name || null,
          class: null,
          specialization: null,
        };

        if (Role.title === "Student") {
          if (!class_id || !specialization_id) {
            throw new Error(`Missing class/specialization for student: ${email}`);
          }

          await Student.create(
            {
              first_name,
              middle_name,
              last_name,
              email: normalizedEmail,
              user_id: user.id,
              class_id,
              specialization_id,
              school_id: organization_id,
            },
            { transaction }
          );

          // Get class and specialization names
          const classObj = await Class.findByPk(class_id, {
            attributes: ['name'],
            transaction,
          });

          const specialization = await Specialization.findByPk(specialization_id, {
            attributes: ['name'],
            transaction,
          });

          outputData.class = classObj?.name || null;
          outputData.specialization = specialization?.name || null;
        } else {
          if (!emp_role_id) {
            throw new Error(`Missing employee role ID for: ${email}`);
          }

          const employee = await Employee.create(
            {
              first_name,
              middle_name,
              last_name,
              email: normalizedEmail,
              organization_id,
              role_id: emp_role_id,
              user_id: user.id,
            },
            { transaction }
          );

          if (
            Role.title === "Teacher" ||
            Role.title === "Head of Department (HOD)"
          ) {
            if (!planned_sessions || !subject_id || !department_id) {
              throw new Error(`Missing teacher details for: ${email}`);
            }

            await Teacher.create(
              {
                planned_sessions,
                employee_id: employee.id,
                subject_id,
                department_id,
              },
              { transaction }
            );
          }
        }

        createdResults.push(outputData);
      }
    });

    res.status(201).json({
      message: "Users created successfully",
      created: createdResults.length,
      users: createdResults,
    });
  } catch (error) {
    console.error("Bulk Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const adminSignup = async (req, res) => {
  try {
    const {
      username,
      password,
      user_id,
      role
    } = req.body;

    if (
      !username ||
      !user_id ||
      !role ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userCheck = await User.findOne({
      where: { id: user_id },
    });

    if (!userCheck) {
      return res.status(400).json({ message: "Invalid User Id" });
    }

    const hashedPassword = await hashPassword(password);

    const existingAdmin = await AdminsUsers.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const adminUser = await AdminsUsers.create(
      {
        username,
        password: hashedPassword,
        user_id,
        role
      }
    );

    if (!process.env.JWT_SECRET_POINTS) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET_POINTS, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Admin created successfully",
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const Admin = await AdminsUsers.findOne({ where: { username } });
    if (!Admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await comparePassword(password, Admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: Admin.id }, process.env.JWT_SECRET_POINTS, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      id: Admin.id,
      username: Admin.username,
      user_role: Admin.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { signup, login, adminSignup, adminLogin, signupBulk };