const { Specialization } = require("../db/models");
require("dotenv").config();

const specializations = async (req, res) => {
    try {
        const Specializations = await Specialization.findAll({
            attributes: ["id", "name", "createdAt"],
        });
        res.status(200).json({
            status: "success",
            message: "Specializations got fetched successfully",
            Specializations,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

module.exports = { specializations };