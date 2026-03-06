const { DataTypes } = require('sequelize');

let Document = null;

function initDocument(sequelize) {
    Document = sequelize.define('Document', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        originalName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileType: {
            type: DataTypes.ENUM('pdf', 'image'),
            allowNull: false
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        extractedText: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'documents'
    });
    return Document;
}

module.exports = { initDocument };
