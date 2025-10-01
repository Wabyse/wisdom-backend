const {
  RewardsAndPunishments,
  UsersPoints,
  PointsHistory,
  AdminsUsers,
  User,
  Student,
  Employee,
} = require("../db/models");
const { fn, col, literal } = require("sequelize");
const moment = require("moment");

exports.viewSchoolPoints = async (req, res) => {
  try {
    const Points = await RewardsAndPunishments.findAll({
      attributes: ["id", "name", "type", "points"],
      where: {
        type: ["school_reward", "school_punishment"],
      },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Points,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.viewVtcPoints = async (req, res) => {
  try {
    const Points = await RewardsAndPunishments.findAll({
      attributes: ["id", "name", "type", "points"],
      where: {
        type: ["vtc_reward", "vtc_punishment"],
      },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Points,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updatePoints = async (req, res) => {
  try {
    const { admin_id, user_id, point } = req.body;

    if (!admin_id || !user_id || point === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await UsersPoints.sequelize.transaction(
      async (transaction) => {
        const userPoints = await UsersPoints.findOne({
          where: { user_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!userPoints) {
          throw new Error("This user does not have points system");
        }

        const adminRole = await AdminsUsers.findOne({
          where: { id: admin_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!adminRole) {
          throw new Error("Admin user not found");
        }

        let status;
        if (adminRole.role === "admin" || adminRole.role === "super_admin") {
          status = "pending";
        } else if (adminRole.role === "ceo") {
          const pointDetails = await RewardsAndPunishments.findOne({
            where: { id: point },
            transaction,
          });
          status = "accepted";
          await userPoints.increment(
            { points: pointDetails.points },
            { transaction }
          );
        } else {
          throw new Error("Unauthorized admin role");
        }

        const history = await PointsHistory.create(
          {
            admin_id,
            user_id: userPoints.id,
            point_id: point,
            status,
          },
          { transaction }
        );

        return { userPoints, history, status };
      }
    );

    res.status(200).json({
      status: "success",
      message: `Points ${result.status === "accepted" ? "updated" : "pending approval"
        } and history recorded successfully.`,
      result,
    });
  } catch (error) {
    console.error("Update Points Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewPointsPermissions = async (req, res) => {
  try {
    const PointsPermissions = await PointsHistory.findAll({
      attributes: ["id", "admin_id", "user_id", "point_id", "status"],
      include: [
        {
          model: AdminsUsers,
          as: "admin",
          required: true,
          attributes: ["username"],
        },
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,
          attributes: ["points", "user_id"],
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: ["id"],
              include: [
                {
                  model: Student,
                  as: "student",
                  required: false,
                  attributes: ["first_name", "middle_name", "last_name"],
                },
                {
                  model: Employee,
                  as: "employee",
                  required: false,
                  attributes: ["first_name", "middle_name", "last_name"],
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true,
          attributes: ["name", "points", "type"],
        },
      ],
      where: { status: "pending" },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      PointsPermissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.PointRequestStatus = async (req, res) => {
  try {
    const { adminId, id, status } = req.body;

    if (!id || !status || !adminId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await PointsHistory.sequelize.transaction(
      async (transaction) => {
        const pointRequest = await PointsHistory.findOne({
          where: { id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!pointRequest) {
          throw new Error("There is no point request with this id");
        }

        if (status === "denied") {
          pointRequest.status = "denied";
          await pointRequest.save({ transaction });

          return {
            message: "Request has been denied.",
            userPoints: null,
          };
        }

        if (status === "accepted") {
          const adminRole = await AdminsUsers.findOne({
            where: { id: adminId },
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (!adminRole) {
            throw new Error("Admin user not found");
          }
          if (adminRole.role === "super_admin") {
            pointRequest.status = "accepted";
            await pointRequest.save({ transaction });

            await PointsHistory.create(
              {
                admin_id: adminId,
                user_id: pointRequest.user_id,
                point_id: pointRequest.point_id,
                status: "pending",
              },
              { transaction }
            );

            return {
              message: "A request has been sent to the CEO.",
            };
          }

          if (adminRole.role === "ceo") {
            pointRequest.status = "accepted";
            await pointRequest.save({ transaction });

            const userPoints = await UsersPoints.findOne({
              where: { id: pointRequest.user_id },
              transaction,
              lock: transaction.LOCK.UPDATE,
            });

            if (!userPoints) {
              throw new Error("This user is not part of the points system");
            }

            const pointDetails = await RewardsAndPunishments.findOne({
              where: { id: pointRequest.point_id },
              transaction,
            });

            if (!pointDetails) {
              throw new Error("Point details not found");
            }

            userPoints.points += pointDetails.points;
            await userPoints.save({ transaction });

            return {
              message: "Points accepted and added to user account.",
              userPoints: userPoints.points,
            };
          }

          throw new Error("Unauthorized admin role");
        }
      }
    );

    res.status(200).json({
      status: "success",
      message: result.message,
      ...(result.userPoints !== undefined && { userPoints: result.userPoints }),
    });
  } catch (error) {
    console.error("Update Points Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.viewUserPoints = async (req, res) => {
  try {
    const { user_id } = req.body;
    const Points = await UsersPoints.findOne({
      attributes: ["points"],
      where: { user_id },
    });

    res.status(200).json({
      status: "success",
      message: "data got fetched successfully",
      Points,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.watomsMonthlyPerformance = async (req, res) => {
  try {
    const orgs = [4, 5, 7, 8, 9];

    const currentMonth = new Date().getMonth() + 1;
    const startMonth = 4;

    const monthsArray = [];
    for (let m = startMonth; m <= currentMonth; m++) {
      monthsArray.push({
        monthNumber: m,
        month: new Date(0, m - 1).toLocaleString("ar", { month: "long" }),
      });
    }

    const results = await PointsHistory.findAll({
      attributes: [
        [fn("DATE_PART", "month", col("PointsHistory.updatedAt")), "monthNumber"],
        [fn("SUM", col("point.points")), "totalPoints"],
      ],
      include: [
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,   // force inner join
          attributes: [],
          include: [
            {
              model: User,
              as: "user",
              required: true, // force inner join
              attributes: [],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: true, // force inner join
                  attributes: [],
                  where: { organization_id: orgs },
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true, // force inner join
          attributes: [],
        },
      ],
      where: { status: "accepted" },
      group: [fn("DATE_PART", "month", col("PointsHistory.updatedAt"))],
      raw: true,
    });

    const months = monthsArray.map((m) => {
      const found = results.find(
        (r) => Number(r.monthNumber) === m.monthNumber
      );
      return {
        monthNumber: m.monthNumber,
        month: m.month,
        performance: found ? Number(found.totalPoints) : 0,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Aggregated performance across selected orgs per month",
      data: months,
    });
  } catch (error) {
    console.error("Error in monthlyPerformance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.employeeMonthlyPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const currentMonth = new Date().getMonth() + 1; // 1–12
    const startMonth = 4; // April

    const monthsArray = [];
    for (let m = startMonth; m <= currentMonth; m++) {
      monthsArray.push({
        monthNumber: m,
        month: new Date(0, m - 1).toLocaleString("ar", { month: "long" }),
      });
    }

    const employeePoints = await PointsHistory.findAll({
      include: [
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,
          attributes: [],
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: [],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: true,
                  attributes: [],
                  where: { user_id: id },
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true, // force inner join
          attributes: ['name', 'points', 'type'],
        },
      ],
      where: { status: "accepted" },
      raw: true,
    })

    const results = await PointsHistory.findAll({
      attributes: [
        [fn("DATE_PART", "month", col("PointsHistory.updatedAt")), "monthNumber"],
        [fn("SUM", col("point.points")), "totalPoints"],
      ],
      include: [
        {
          model: UsersPoints,
          as: "userPoints",
          required: true,
          attributes: [],
          include: [
            {
              model: User,
              as: "user",
              required: true,
              attributes: [],
              include: [
                {
                  model: Employee,
                  as: "employee",
                  required: true,
                  attributes: [],
                  where: { user_id: id },
                },
              ],
            },
          ],
        },
        {
          model: RewardsAndPunishments,
          as: "point",
          required: true, // force inner join
          attributes: [],
        },
      ],
      where: { status: "accepted" },
      group: [fn("DATE_PART", "month", col("PointsHistory.updatedAt"))],
      raw: true,
    });

    const months = monthsArray.map((m) => {
      const found = results.find(
        (r) => Number(r.monthNumber) === m.monthNumber
      );
      return {
        monthNumber: m.monthNumber,
        month: m.month,
        performance: found ? Number(found.totalPoints) : 0,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Aggregated performance across selected orgs per month",
      data: {
        employeePoints,
        months
      },
    });
  } catch (error) {
    console.error("Error in monthlyPerformance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};