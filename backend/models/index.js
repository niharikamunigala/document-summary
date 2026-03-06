// This file provides global access to database models
// Models are initialized in db/connection.js

let modelsCache = null;

function getModels() {
    if (!modelsCache) {
        throw new Error('Models not initialized. Database connection required.');
    }
    return modelsCache;
}

function setModels(models) {
    modelsCache = models;
}

module.exports = { getModels, setModels };
