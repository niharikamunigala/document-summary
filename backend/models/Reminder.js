const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');

const Reminder = sequelize.define('Reminder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    billName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reminderDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    tableName: 'reminders'
});

module.exports = Reminder;
