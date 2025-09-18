module.exports = (sequelize, DataTypes) => {
    const PublishedNews = sequelize.define('PublishedNews', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'published_news',
        timestamps: true,
        paranoid: true
    });

    PublishedNews.associate = function (models) {
        PublishedNews.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    };

    return PublishedNews;
};