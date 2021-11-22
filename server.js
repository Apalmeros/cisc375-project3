// Built-in Node.js modules
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { stringify } = require('querystring');


let app = express();
let port = 8000;

let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

// open stpaul_crime.sqlite3 database
// data source: https://information.stpaul.gov/Public-Safety/Crime-Incident-Report-Dataset/gppb-g9cg
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

app.use(express.static(public_dir));


// REST API: GET /codes
// Respond with list of codes and their corresponding incident type
app.get('/codes', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    db.all('SELECT code, incident_type FROM Codes ORDER BY code', (err, data) => {
        let codeData = '';
        let result = '';
        if(data.length == 0)
        {
            res.status(404).send('ERROR: ');
            return 0;
        }
        else
        {
            
            let i;
            for(i = 0; i < data.length; i++)
            {
                codeData +=  '{' +'"code": ' + data[i].code + ',' + '"type": ' + data[i].incident_type + '}'+ ',' + '\n';
            }
            console.log(codeData);
        }
        result += '['+ '\n' + codeData + ']';
        res.status(200).type('json').send(result);
    });
    
});

// REST API: GET /neighborhoods
// Respond with list of neighborhood ids and their corresponding neighborhood name
app.get('/neighborhoods', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    db.all('SELECT neighborhood_number, neighborhood_name FROM Neighborhoods ORDER BY neighborhood_number', (err, data) => {
        let codeData ='';
        let result = '';
        if(data.length == 0)
        {
             res.status(404).send('ERROR: ');
            return 0;
        }
        else
        {
                
             let i;
            for(i = 0; i < data.length; i++)
            {
                codeData +=  '{' +'"id": ' + data[i].neighborhood_number + ',' + '"name": ' + data[i].neighborhood_name + '}'+ ',' + '\n';
            }
            console.log(codeData);
        }
        result += '[' + '\n' + codeData + ']';
        res.status(200).type('json').send(result);
    });
});

// REST API: GET/incidents
// Respond with list of crime incidents
app.get('/incidents', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    db.all('SELECT case_number, date_time, code, incident, police_grid, neighborhood_number, block  FROM Incidents ORDER BY date_time', (err, data) => {
        let codeData ='';
        let result = '';
        if(data.length == 0)
        {
             res.status(404).send('ERROR: ');
            return 0;
        }
        else
        {
                
             let i;
             let date = '';
             let time = '';
             let date_time_split ='';
            for(i = 0; i < data.length; i++)
            {
                date_time_split = data[i].date_time.split('T');
                date = date_time_split[0];
                time = date_time_split[1];
                codeData +=  '{' +'"case_number": ' + data[i].case_number + ',' + '\n' + '"date": ' + date + ',' + '\n' + '"time": ' + time +
                ',' + '\n' + '"code": ' + data[i].code + ',' + '\n' +'"incident": ' + data[i].incident + ',' + '\n' + '"police_grid": ' + data[i].police_grid +
                ',' + '\n' + '"neighborhood_number": ' + data[i].neighborhood_number + ',' + '\n' + '"block": ' + data[i].block + '\n' + '}'+ ',' + '\n';
            }
            
            console.log(codeData);
        }
        result += '[' + '\n' + codeData + ']';    
        res.status(200).type('json').send(result);
    });
});

// REST API: PUT /new-incident
// Respond with 'success' or 'error'
app.put('/new-incident', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    db.get('SELECT * FROM Incidents', (err, data) => {
        if(err || data !== undefined)
        {
            res.status(500).type('txt').send("Error: Could not insert into Incidents");
        }
        else
        {
            db.run('INSERT INTO Incidents (case_number, date, time, code, incident, police_grid, neighborhood_number, block) VALUES( ? , ? , ? , ? , ? , ? , ? , ? )', [req.body.case_number, req.body.date, req.body.time, req.body.code, req.body.incident, req.body.police_grid, req.body.neighborhood_number, req.body.block], (err) =>{
                res.status(200).type('txt').send('success');
            });
        }
    });
   
});

// REST API: DELETE /remove-incident
// Respond with 'success' or 'error'
app.delete('/remove-incident', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    db.get('SELECT * FROM Incidents', (err, data) => {
        if(err || data !== undefined)
        {
            res.status(500).type('txt').send("Error: Could not insert into Incidents");
        }
        else
        {
            db.run('DELETE FROM Incidents WHERE case_number = ?', [req.params.case_number], (err) =>{
                // is it body or params
                res.status(200).type('txt').send('success');
            });
        }
    });
    
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        })
    })
}

// Create Promise for SQLite3 database INSERT query
function databaseInsert(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    })
}


// Start server
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
