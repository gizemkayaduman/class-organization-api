const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const db = require('./src/connection')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/get-user', (req, res) => {
    db.query('SELECT * FROM administrator', function (err, records, field) {
        const response = []
        records.forEach(record => {
            const element = {
                id: record.admin_id,
                userName: record.user_name,
                fullName: record.name + ' ' + record.surname,
            }
            response.push(element)
        });

        res.send(response)
    })
})

app.get('/get-user/:id', (req, res) => {
    db.query('SELECT * FROM administrator WHERE admin_id = ?', [req.params.id], function (err, records, field) {
        const response = []
        records.forEach(record => {
            const element = {
                id: record.admin_id,
                userName: record.user_name,
                fullName: record.name + ' ' + record.surname,
            }
            response.push(element)
        });

        res.send(response)
    })
})

app.post('/login', (req, res) => {

    db.query('SELECT * FROM administrator WHERE user_name = ? AND password = ?', [req.body.userName, req.body.password], function (err, records, field) {
        const response = {}
        records.forEach(record => {
            response.id = record.admin_id,
                response.schoolID = record.school_id,
                response.status = true
        });

        res.send(response)
    })
})

app.post('/classes', (req, res) => {
    db.query("SELECT c.class_id, c.name class_name, a.admin_id, a.name admin_name, a.surname admin_surname, c.date  FROM class c " +
        "LEFT JOIN administrator a ON a.admin_id = c.admin_id " +
        "WHERE c.school_id = ?", [req.body.schoolID], function (err, records, field) {
            const result = []
            records.forEach(element => {
                const record = {
                    adminID: element.admin_id,
                    classID: element.class_id,
                    className: element.class_name,
                    adminName: element.admin_name,
                    adminSurname: element.admin_surname,
                    date: element.date,
                    active: 12,
                    deactive: 3
                }
                result.push(record)
            })
            res.json({
                data: result,
                status: true
            })
        });
})

app.post('/class', (req, res) => {
    const className = req.body.class_name;
    const adminID = req.body.admin_id;
    const schoolID = req.body.school_id;
    db.query("INSERT INTO class(name, admin_id, school_id) VALUES(?, ?, ?)", [className, adminID, schoolID], function (err, record, field) {
        console.log(err)
        res.send({
            status: true
        })
    })
})

app.post('/students', (req, res) => {
    db.query('SELECT activity.student_id, student.name, student.surname,activity.status FROM activity ' +
        'LEFT JOIN student ON activity.student_id=student.student_id ' +
        'LEFT JOIN class ON  activity.class_id=class.class_id WHERE class.class_id=?', [req.body.classId], function (err, records, field) {
            const result = [];
            records.forEach(element => {
                const record = {
                    activeStudentName: element.name,
                    activeStudentSurname: element.surname,
                    status: element.status
                }
                result.push(record);
            })
            res.send({
                data: result,
                status: true
            })
        })
})

app.post('/student', (req, res) => {
    const students = req.body.students;
    students.forEach(student => {
        db.query("INSERT INTO activity(class_id, admin_id, student_id, school_id) VALUES(?, ?, ?, ?)",
            [
                student.class_id,
                student.admin_id,
                student.student_id,
                student.school_id
            ])
    })
    res.send({
        status: true
    })
})

app.post('/deactive',(req,res) => {
    const description = req.body.description;
    const studentID = req.body.studentID;
    const classID = req.body.classID;
    db.query("UPDATE activity SET STATUS=2, description=? WHERE student_id=? AND class_id=?",[description,studentID,classID],function(err,record,fiels){
        console.log(err)
    })
    res.send({
        status:true
    })
    
})

app.listen(8080, () => console.log('sunucu çalıştı'))
