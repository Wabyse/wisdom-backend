'use strict';

module.exports = (sequelize, DataTypes) => {
  const PeCandidate = sequelize.define('PeCandidate', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    id_number: DataTypes.STRING,
    passport_number: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
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
    category: DataTypes.STRING,
    candidate_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone_number: DataTypes.STRING,
    recommended_country: DataTypes.STRING,
    self_test_date: DataTypes.DATE,
    personal_test_date: DataTypes.DATE,
    theory_test_date: DataTypes.DATE,
  }, {
    tableName: 'pe_candidates',
    timestamps: true,
  });

  PeCandidate.associate = (models) => {
    PeCandidate.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    PeCandidate.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return PeCandidate;
};