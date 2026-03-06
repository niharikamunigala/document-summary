const express = require('express');
const { getModels } = require('../models/index');
const { Op } = require('sequelize');

const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
    try {
        const { Reminder } = getModels();
        const reminders = await Reminder.findAll({
            where: { 
                status: { [Op.in]: ['pending', 'cancelled'] }
            },
            order: [['reminderDate', 'ASC']]
        });
        res.json(reminders);
    } catch (error) {
        console.error('Get reminders error:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// Create a new reminder
router.post('/', async (req, res) => {
    try {
        const { billName, reminderDate, description } = req.body;

        if (!billName || !reminderDate) {
            return res.status(400).json({ error: 'Missing billName or reminderDate' });
        }

        const { Reminder } = getModels();
        const reminder = await Reminder.create({
            billName,
            reminderDate: new Date(reminderDate),
            description: description || ''
        });

        console.log('Reminder created with ID:', reminder.id);
        res.json(reminder);
    } catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({ error: 'Failed to create reminder' });
    }
});

// Update reminder status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { Reminder } = getModels();
        const reminder = await Reminder.findByPk(req.params.id);
        
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        await reminder.update({ status });
        res.json(reminder);
    } catch (error) {
        console.error('Update reminder error:', error);
        res.status(500).json({ error: 'Failed to update reminder' });
    }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
    try {
        const { Reminder } = getModels();
        const reminder = await Reminder.findByPk(req.params.id);

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        await reminder.destroy();
        res.json({ message: 'Reminder deleted', reminder });
    } catch (error) {
        console.error('Delete reminder error:', error);
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});

module.exports = router;
