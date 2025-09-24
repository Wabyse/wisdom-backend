const { Specialization, Authority, Organization, TraineeRegistrationData, Curriculum } = require("../db/models");
require("dotenv").config();

exports.specializations = async (req, res) => {
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

exports.authorities = async (req, res) => {
    try {
        const Authorities = await Authority.findAll({
            attributes: ["id", "name"],
            order: [["id", "ASC"]],
        });
        res.status(200).json({
            status: "success",
            message: "Authorities got fetched successfully",
            Authorities,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.projects = async (req, res) => {
    try {
        const projects = await Organization.findAll({
            attributes: ["id", "name", "authority_id"],
            order: [["id", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            projects,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchTraineesRegistrations = async (req, res) => {
    try {
        const registrations = await TraineeRegistrationData.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Organization,
                    as: "org",
                    attributes: ["name"], // only fetch the 'name' column
                },
                {
                    model: Curriculum,
                    as: "curriculum",
                    attributes: ["code"], // only fetch the 'code' column
                },
            ],
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            registrations,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};