var modelName = 'mailinguser',
    fieldSelection = ['_id', 'name', 'email', 'createdAt', 'updatedAt'],
    volatileFields = ['email'],
    requiredFields = ['name', 'email'];

var router = require('./../../../utils').createCrudRoute(modelName, fieldSelection, volatileFields, requiredFields);

module.exports = router;
