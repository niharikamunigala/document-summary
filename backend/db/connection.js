const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { setModels } = require('../models/index');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

// Define models
const models = {};

function defineModels() {
    // Document model
    models.Document = sequelize.define('Document', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        filename: { type: DataTypes.STRING, allowNull: false },
        originalName: { type: DataTypes.STRING, allowNull: false },
        fileSize: { type: DataTypes.INTEGER, allowNull: false },
        fileType: { type: DataTypes.ENUM('pdf', 'image'), allowNull: false },
        filePath: { type: DataTypes.STRING, allowNull: false },
        extractedText: { type: DataTypes.TEXT, allowNull: false },
        summary: { type: DataTypes.TEXT, allowNull: false }
    }, { timestamps: true, tableName: 'documents' });

    // ChatHistory model
    models.ChatHistory = sequelize.define('ChatHistory', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        documentId: { type: DataTypes.INTEGER, allowNull: false },
        question: { type: DataTypes.TEXT, allowNull: false },
        answer: { type: DataTypes.TEXT, allowNull: false }
    }, { timestamps: true, tableName: 'chat_history' });

    // Reminder model
    models.Reminder = sequelize.define('Reminder', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        billName: { type: DataTypes.STRING, allowNull: false },
        reminderDate: { type: DataTypes.DATE, allowNull: false },
        description: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), defaultValue: 'pending' }
    }, { timestamps: true, tableName: 'reminders' });

    // Set up associations
    models.ChatHistory.belongsTo(models.Document, { foreignKey: 'documentId' });
    models.Document.hasMany(models.ChatHistory, { foreignKey: 'documentId' });

    // Cache models globally
    setModels(models);

    return models;
}

async function connectDB() {
    try {
        console.log('Connecting to SQLite database...');
        await sequelize.authenticate();
        console.log('✓ SQLite database authenticated');
        
        defineModels();
        console.log('✓ Models defined');
        
        await sequelize.sync({ alter: true });
        console.log('✓ Database models synced');
        
        return sequelize;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        process.exit(1);
    }
}

module.exports = { sequelize, connectDB };
