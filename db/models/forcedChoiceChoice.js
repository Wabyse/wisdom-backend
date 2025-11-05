module.exports = (sequelize, DataTypes) => {
    const ForcedChoiceChoice = sequelize.define('ForcedChoiceChoice', {
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
        answer: {
            type: DataTypes.ENUM('me', 'le', 'wrong'),
            allowNull: false
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'forced_choice_questions',
                key: 'id'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'forced_choice_choices',
        timestamps: false
    });

    ForcedChoiceChoice.associate = (models) => {
        ForcedChoiceChoice.belongsTo(models.ForcedChoiceQuestion, {
            foreignKey: 'question_id',
            as: 'question'
        });
        ForcedChoiceChoice.hasMany(models.CandidatesForcedChoiceAnswer, {
            foreignKey: 'choice_id',
            as: 'answers'
        });
    };

    return ForcedChoiceChoice;
};