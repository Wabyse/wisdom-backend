const {
    RewardsAndPunishments,
    UsersPoints,
    PointsHistory,
    AdminsUsers,
    User,
    Student,
    Employee
} = require("../db/models");

exports.viewSchoolPoints = async (req, res) => {
    try {
        const Points = await RewardsAndPunishments.findAll({
            attributes: ["id", "name", "type", "points"],
            where: {
                type: ['school_reward', 'school_punishment'],
            }
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
                type: ['vtc_reward', 'vtc_punishment'],
            }
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

        const result = await UsersPoints.sequelize.transaction(async (transaction) => {
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
                status = "accepted";
                await userPoints.increment({ points: point }, { transaction });
            } else {
                throw new Error("Unauthorized admin role");
            }

            const history = await PointsHistory.create({
                admin_id,
                user_id: userPoints.id,
                point_id: point,
                status,
            }, { transaction });

            return { userPoints, history, status };
        });

        res.status(200).json({
            status: "success",
            message: `Points ${result.status === "accepted" ? "updated" : "pending approval"} and history recorded successfully.`,
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
                        }
                    ]
                },
                {
                    model: RewardsAndPunishments,
                    as: "point",
                    required: true,
                    attributes: ["name", "points", "type"],
                },
            ],
            where: { status: "pending" }
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