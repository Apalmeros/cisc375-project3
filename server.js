// Built-in Node.js modules
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
let cors = require('cors');
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
app.use(express.json());
app.use(cors());


// REST API: GET /codes
// Respond with list of codes and their corresponding incident type
app.get('/codes', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    if(!req.query.code)
    {
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
    }
    else
    {
        let code_array = req.query.code;
        let code_array_split = code_array.split(',');
    
        let i;
        let question_mark_string = "";
        for(i = 0; i < code_array_split.length; i++)
        {
            if(i == code_array_split.length - 1)
            {
                question_mark_string = question_mark_string + '?';
            }
            else
            {
                question_mark_string = question_mark_string + '?,';
            }
            
        }
    
        db.all('SELECT code, incident_type FROM Codes WHERE code IN (' + question_mark_string + ') ', code_array_split, (err, data) => {
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
    }
});

// REST API: GET /neighborhoods
// Respond with list of neighborhood ids and their corresponding neighborhood name
app.get('/neighborhoods', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    if(!req.query.id)
    {
        db.all('SELECT neighborhood_number, neighborhood_name FROM Neighborhoods', (err, data) =>{
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
    }
    else
    {
        let code_array = req.query.id;
        let code_array_split = code_array.split(",");

        let i;
        let question_mark_string = "";
        for(i = 0; i < code_array_split.length; i++)
        {
            if(i == code_array_split.length - 1)
            {
                question_mark_string = question_mark_string + "?";
            }
            else
            {
                question_mark_string = question_mark_string + "?,";
            }
            
        }

        db.all('SELECT neighborhood_number, neighborhood_name FROM Neighborhoods WHERE neighborhood_number IN (' + question_mark_string + ') ', code_array_split, (err, data) => {
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
    }
});

// REST API: GET/incidents
// Respond with list of crime incidents
app.get('/incidents', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    
    if(!req.query)
    {
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
    }
    else
    {
        let sql = "SELECT * FROM Incidents WHERE "
        let andString = "";
        

        let params = [];
        if(req.query.start_date)
        {
            sql += "date_time >= ? AND ";
            params.push(req.query.start_date);
        }
        if(req.query.end_date)
        {
            sql += "date_time <= ? AND ";
            params.push(req.query.end_date);
        }
        if(req.query.code)
        {
            let code_array = req.query.code;
            let code_array_split = code_array.split(",");

            let i;
            let question_mark_string = "";
            for(i = 0; i < code_array_split.length; i++)
            {
                if(i == code_array_split.length - 1)
                {
                    question_mark_string = question_mark_string + "?";
                }
                else
                {
                    question_mark_string = question_mark_string + "?,";
                }
                params.push(code_array_split[i]);
            }
            sql += "code IN("+question_mark_string+") AND ";
            
        }
        if(req.query.grid)
        {
            let code_array = req.query.grid;
            let code_array_split = code_array.split(",");

            let i;
            let question_mark_string = "";
            for(i = 0; i < code_array_split.length; i++)
            {
                if(i == code_array_split.length - 1)
                {
                    question_mark_string = question_mark_string + "?";
                }
                else
                {
                    question_mark_string = question_mark_string + "?,";
                }
                params.push(code_array_split[i]);
            }
            sql += "police_grid IN("+question_mark_string+") AND ";
            
        }
        if(req.query.neighborhood)
        {
            let code_array = req.query.neighborhood;
            let code_array_split = code_array.split(",");

            let i;
            let question_mark_string = "";
            for(i = 0; i < code_array_split.length; i++)
            {
                if(i == code_array_split.length - 1)
                {
                    question_mark_string = question_mark_string + "?";
                }
                else
                {
                    question_mark_string = question_mark_string + "?,";
                }
                params.push(code_array_split[i]);
            }
            sql += "neighborhood_number IN("+question_mark_string+") AND ";
        }

        sql = sql.substring(0,sql.length-5);

        if(req.query.limit)
        {
            sql += "ORDER BY date_time DESC LIMIT ?";
            params.push(req.query.limit);
        }
        
        //console.log(sql);

        db.all(sql, params, (err,data) => {
            
            console.log(data);
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
                
                //console.log(codeData);
            }
            result += '[' + '\n' + codeData + ']';    
            res.status(200).type('json').send(result);
            
        });
        
        //console.log(params);
    }
});

// REST API: PUT /new-incident
// Respond with 'success' or 'error'
app.put('/new-incident', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    console.log(req.body);
    //make a query to the data base and then send that data
    db.get('SELECT * FROM Incidents WHERE case_number = ?', [req.body.case_number], (err, data) => {
        if(err || data !== undefined)
        {
            res.status(500).type('txt').send("Error: Could not insert into Incidents");
        }
        else
        {
            db.run('INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block) VALUES( ? , ? , ? , ? , ? , ? , ? )', [req.body.case_number, req.body.date + 'T' + req.body.time, req.body.code, req.body.incident, req.body.police_grid, req.body.neighborhood_number, req.body.block], (err) =>{
                
                let result = '';
                if(err)
                {
                    res.status(500).type('txt').send(err);
                }
                else
                {
                    req.body.date_time = req.body.date + 'T' + req.body.time;
                    result += req.body.case_number + ' , ' + req.body.date_time + ' , ' + req.body.code + ' , ' + req.body.incident + ' , ' + req.body.police_grid + ' , ' + req.body.neighborhood_number + ' , ' + req.body.block;
                    res.status(200).type('txt').send(result);
                }
                
            });
            
        }
    });
   
});

// REST API: DELETE /remove-incident
// Respond with 'success' or 'error'
app.delete('/remove-incident', (req, res) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    //make a query to the data base and then send that data
    db.get('SELECT * FROM Incidents WHERE case_number = ?', [req.body.case_number], (err, data) => {
        if(err || data === undefined)
        {
            res.status(500).type('txt').send("Error: Could not delete from Incidents");
        }
        else
        {
            db.run('DELETE FROM Incidents WHERE case_number = ?', [req.body.case_number], (err) =>{
                
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
