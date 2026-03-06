const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');
const Document = require('./Document');

const ChatHistory = sequelize.define('ChatHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Document,
            key: 'id'
        }
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'chat_history'
});

ChatHistory.belongsTo(Document, { foreignKey: 'documentId' });

module.exports = ChatHistory;
