const express = require("express"); 
const mysql = require("mysql2"); 
const bodyParser = require("body-parser"); 
const app = express(); 
app.use(bodyParser.urlencoded({ extended: true })); 
// MySQL connection 
const db = mysql.createConnection({ 
host: "localhost", 
user: "root", 
password: "", 
database: "eventdb" 
}); 
db.connect((err)=>{ 
if(err) throw err; 
console.log("Connected to MySQL"); 
}); 
// Registration page 
app.get("/", (req,res)=>{ 
res.sendFile(__dirname + "/registration.html"); 
});
// Admin page 
app.get("/admin",(req,res)=>{ 
res.sendFile(__dirname + "/admin.html"); 
}); 
// Register event 
app.post("/register",(req,res)=>{ 
let regno = req.body.regno; 
let name = req.body.name; 
let events = req.body.events; 
if(!events) 
return res.send("Please select at least one event"); 
if(!Array.isArray(events)) 
events = [events]; 
if(events.length > 3) 
return res.send("Maximum 3 events allowed"); 
let eventList = events.join(","); 
let sql = "INSERT INTO registrations (regno,name,events) VALUES (?,?,?)"; 
db.query(sql,[regno,name,eventList],(err,result)=>{ 
if(err) 
{ 
if(err.code === "ER_DUP_ENTRY") 
return res.send("Register Number already exists"); 
throw err; 
} 
res.send("Registration Successful"); 
}); 
}); 
// Search 
app.get("/search",(req,res)=>{ 
let regno = req.query.regno; 
let sql = "SELECT * FROM registrations WHERE regno=?"; 
db.query(sql,[regno],(err,result)=>{ 
if(result.length === 0) 
return res.send("Register Number not found"); 
let r = result[0]; 
res.send(` 
<h2>Registration Details</h2> 
Register Number : ${r.regno} <br> 
Name : ${r.name} <br> 
Events : ${r.events} 
`); 
}); 
}); 
app.listen(3000,()=>{ 
console.log("Server running at http://localhost:3000"); 
}); 