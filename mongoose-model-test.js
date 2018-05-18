
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');


// enumerated types for target objects of audit events.
const Targets = Object.freeze({
    USER: 'user',
    USERADMIN: 'userAdmin',
    POLICY: 'policy',
    WORKFLOW: 'workflow',
    DATASOURCE_IMPORTER: 'importer-datasource',
    DATASOURCE_SQL: 'sql-datasource',
    DATASOURCE_STREAMER: 'streamer-datasource',
    DATASOURCE_WORKFLOW: 'workflow-datasource',
    REPORT: 'report',
    WATSON: 'watson'
});

// enumerated types for actions performed on a target object that triggers an audit event
const Actions = Object.freeze({
    ACCESS: 'access',
    CREATE: 'create',
    DEACTIVATE: 'deactivate',
    DELETE: 'delete',
    END_EXECUTION: 'end_execution',
    MODIFY: 'modify',
    REACTIVATE: 'reactivate',
    REGISTER: 'register',
    SIGNIN: 'signin',
    SIGNOUT: 'signout',
    SIGNUP: 'signup',
    START_EXECUTION: 'start_execution',
    UPLOAD: 'upload'
});

var Schema = mongoose.Schema;

var AuditSchema2 = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    userid: {
        type: String,
        required: 'userid is required.'
    },
    ipAddress: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(v);

            },
            message: '{VALUE} is not a valid IPv4 address.'
        },
        required: [true, 'IP address required.']
    },
    target: {
        type: String,
        enum: Object.keys(Targets).map(k => Targets[k]),
    },
    action: {
        type: String,
        enum: Object.keys(Actions).map(k => Actions[k]),
    },
});

Object.assign(AuditSchema2.statics, {Targets, Actions});

console.log('Targets.USER=\'%s\'', Targets.USER);
console.log('Actions.ACCESS=\'%s\'', Actions.ACCESS);

mongoose.model('Audit', AuditSchema2);

console.log('fetching Audit model from mongoose.');

var Audit = mongoose.model('Audit');

console.log('Audit.Targets.USER=\'%s\'', Audit.Targets.USER);

var audit = new Audit({
    userid: 'TestUser',
    ipAddress: '192.168.0.1',
    target: 'junk',
    action: 'signin'
});

console.log('audit=\n%s', JSON.stringify(audit));

console.log('validating.');
audit.validate(function (err) {
    if (err)
        console.log(err.errors.target.message);
    else
        console.log('audit object validated.');
});

audit = new Audit({
    userid: 'TestUser',
   // ipAddress: '192.168.0.',
    target: 'user',
    action: 'signin'
});
console.log('audit=\n%s', JSON.stringify(audit));
console.log('validating.');
audit.validate(function (err) {
    if (err)
        console.log(err.errors);
    else
        console.log('audit object validated.');
});




