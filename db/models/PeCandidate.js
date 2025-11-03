'use strict';

module.exports = (sequelize, DataTypes) => {
  const PeCandidate = sequelize.define('PeCandidate', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    id_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passport_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    candidate_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recommended_country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theory_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    practical_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fc_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    theory_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    practical_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fc_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    theory_test_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    practical_test_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    fc_test_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'pe_candidates',
    timestamps: true,
  });

  PeCandidate.associate = (models) => {
    PeCandidate.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });
    PeCandidate.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    PeCandidate.hasMany(models.CandidatesRateScaleExam, {
      foreignKey: 'candidate_id',
      as: 'exams'
    });
  };

  return PeCandidate;
};