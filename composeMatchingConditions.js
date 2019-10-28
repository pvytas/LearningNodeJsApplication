


const MATCHING_OPERATORS = {
    'eq': '$eq',
    'gt': '$gt',
    'gte': '$gte',
    'lt': '$lt',
    'lte': '$lte',
    'ne': '$ne',
    'regex': '$regex'
};

function composeMatchConditions (source) {
    if (!source.version) {
        return source.where;
    } else if (source.version === 2) {
        let matchConditions = { ownerId: source.sourceCellId};
        for (const columnName of Object.keys(source.where)) {
            const conditionObj = source.where[columnName];
            let matchCondition = {};
            for (const condition of Object.keys(conditionObj)) {
                const translatedCondition = MATCHING_OPERATORS[condition];
                if (!translatedCondition) {
                    throw `${condition} is an invalid matching condition`;
                }
                matchCondition[translatedCondition] = conditionObj[condition];
            }
            matchConditions['data.' + columnName] = matchCondition;
        }

        return matchConditions;
    }
}


const selectReqBody = {
    type: 'select',
        version: 2,
    sourceCellId: '342da842-09f8-47fa-b831-a19483a809a7',  // becomes ownerId:
    select: ['userName', 'ipAddress', 'action', 'timestamp' ],
    where: {
    'id': {'gt': 0, 'lte': 5},
    'userName': { 'eq': 'admin' },
    'action': { 'regex': 's'}
}
};

const translatedConditions = composeMatchConditions (selectReqBody);

console.log ('input req body=', selectReqBody);
console.log ('output conditions=', translatedConditions);


const badSelectReqBody = {
    type: 'select',
    version: 2,
    sourceCellId: '342da842-09f8-47fa-b831-a19483a809a7',  // becomes ownerId:
    select: ['userName', 'ipAddress', 'action', 'timestamp' ],
    where: {
        'id': {'gt': 0, 'lessThanEquals': 5},
        'userName': { 'eq': 'admin' },
        'action': { 'regex': 's'}
    }
};

try {
    console.log ('bad input req body=', badSelectReqBody);
    const badTranslatedConditions = composeMatchConditions (badSelectReqBody);
    console.log ('output conditions=', badTranslatedConditions);
} catch (e) {
    console.log ('error=', e);
}

