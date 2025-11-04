module.exports = (sequelize, DataTypes) => {
    const McqChoice = sequelize.define('McqChoice', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'mcq_questions',
                key: 'id'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'mcq_choices',
        timestamps: false
    });

    McqChoice.associate = (models) => {
        McqChoice.belongsTo(models.McqQuestion, {
            foreignKey: 'question_id',
            as: 'question'
        });
        McqChoice.hasMany(models.CandidatesMcqAnswer, {
            foreignKey: 'choice_id',
            as: 'answers'
        });
    };

    return McqChoice;
};