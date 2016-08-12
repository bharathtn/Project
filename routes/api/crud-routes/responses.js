var modelName = 'response',
    fieldSelection = ['_id', 'user_id', 'qsnr_id', 'answers'],
    volatileFields = ['answers'],
    requiredFields = ['user_id', 'qsnr_id', 'answers'];

var router = require('./../../../utils').createCrudRoute(modelName, fieldSelection, volatileFields, requiredFields);

module.exports = router;
