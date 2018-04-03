/* 
 * Copyright (C) Bitnobi Inc. - All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by   , March 2018.
 * Each line should be prefixed with  * 
 */


var writeRowsEvent1 = {
    rows: [
        {
            id: '1',
            column1: 'c2',
            column2: 'c3', 
            column3: 'c4',
            column4: 'c5'
        },{
            id: '2',
            column1: 'c6',
            column2: 'c7', 
            column3: 'c8',
            column4: 'c9'
        }, {
            id: '3',
            column1: 'c10',
            column2: 'c11', 
            column3: 'c12',
            column4: 'c13'
        }
    ]
};


function getSurrogateHighDate() {return new Date(9999, 5, 24, 11, 33, 30, 0);};


function formatDWAttr (rows) {
    var output = [];
    if ((!rows) || rows.length === 0) return (output);  

    rows.forEach(function(row) {
        var rowOutput = { data: {} };
        rowOutput.data = row;        
        rowOutput.startDate = new Date();
        rowOutput.endDate = getSurrogateHighDate();
        
        output.push (rowOutput);               
    });    
    return (output);
};


 
function formatResultAttr (rows) {
    var output = [];
    if ((!rows) || rows.length === 0) return (output);  

    rows.forEach(function(row) { 
        var rowOutput = {
            'ownerId': 'MC',
            'dateAdded': new Date(),
            'data': row,
            'sourceExportable': true,
            'exportable': true
        };
        
        output.push (rowOutput);               
    });    
    return (output);
};



var rows = writeRowsEvent1.rows;
console.log ('rows: ');
console.log (rows);

console.log ('formatDWL: ');
console.log (formatDWAttr(rows));

console.log ('formatResultAttr: ');
console.log (formatResultAttr(rows));


