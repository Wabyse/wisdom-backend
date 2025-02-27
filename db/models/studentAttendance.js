module.exports = (sequelize, DataTypes) => {
    const studentAttendance = sequelize.define('studentAttendance', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        reason: {
            type: DataTypes.TEXT,
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('absent', 'attend', 'late', 'left with parent'),
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'students_attendance',
        timestamps: true,
    });

    studentAttendance.associate = (models) => {
        studentAttendance.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    };

    return studentAttendance;
}