var modelName = 'mailinglist',
    fieldSelection = ['_id', 'name', 'user_id', 'people'],
    volatileFields = ['name', 'people'],
    requiredFields = ['name', 'user_id', 'people'];

var router = require('./../../../utils').createCrudRoute(modelName, fieldSelection, volatileFields, requiredFields);

module.exports = router;
