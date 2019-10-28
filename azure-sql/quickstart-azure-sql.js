const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

// Create connection to database

// const config =
//     {
//         userName: 'pvytas-admin', // update me
//         password: 'bitnobi2017!', // update me
//         server: 'pvytas.database.windows.net', // update me
//         options:
//             {
//                 database: 'test1', //update me
//                 encrypt: true
//             }
//     }


const config =
    {
        userName: 'bitnobi', // update me
        password: 'bitnobi2017!', // update me
        server: '192.168.86.20', // update me
        options:
            {
                database: 'test', //update me
                encrypt: true
            }
    };

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err)
    {
        if (err)
        {
            console.log(err)
        }
        else
        {
            queryDatabase()
        }
    }
);

function queryDatabase()
{
    console.log('Reading rows from the Table...');

    // const query = "SELECT TOP 20 pc.Name as CategoryName, p.name as ProductName FROM [SalesLT].[ProductCategory] pc "
    //     + "JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid";

    const query = "SELECT TOP (1000) * FROM [test].[dbo].[out100]";

    // Read all rows from table
    request = new Request(query,
        function(err, rowCount, rows)
        {
            console.log(rowCount + ' row(s) returned');
            process.exit();
        }
    );

    request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
        });
    });
    connection.execSql(request);
}

