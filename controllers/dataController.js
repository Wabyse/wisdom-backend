const { Specialization, Authority, Organization, TraineeRegistrationData, Curriculum, EmployeeRole, Project, Program } = require("../db/models");
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

exports.fetchEmployeesRoles = async (req, res) => {
    try {
        const roles = await EmployeeRole.findAll({
            attributes: ['id', 'title']
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            roles,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            attributes: ['id', 'name', 'authority_id']
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

exports.fetchPrograms = async (req, res) => {
    try {
        const programs = await Program.findAll({
            attributes: ['id', 'name', 'project_id']
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            programs,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchOrgs = async (req, res) => {
    try {
        const orgs = await Organization.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Program,
                    as: 'programs',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
            order: [['id', 'ASC']],
        });

        res.status(200).json({
            status: 'success',
            message: 'Data fetched successfully',
            orgs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};