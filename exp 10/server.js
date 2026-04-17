const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve HTML files

const url = 'mongodb://localhost:27017';
const dbName = 'eventdb';
let db;

// Connect to MongoDB
MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName);
        console.log("Connected to MongoDB");
    }).catch(err => console.error(err));

// Part 2: Registration Logic
app.post('/register', async (req, res) => {
    const { regno, name, events } = req.body;
    const eventList = Array.isArray(events) ? events : [events];

    // Validation
    if (eventList.length > 3) return res.send("Error: Max 3 events allowed.");

    try {
        const collection = db.collection('registrations');
        
        // Check for duplicate Reg No
        const existing = await collection.findOne({ regno: regno });
        if (existing) return res.send("Error: Register Number already exists!");

        await collection.insertOne({ regno, name, events: eventList });
        res.send(<h2>Registration Successful!</h2><a href="/">Back</a>);
    } catch (err) {
        res.status(500).send("Database Error");
    }
});

// Part 4: Admin Search Logic
app.get('/search', async (req, res) => {
    const regno = req.query.regno;
    try {
        const result = await db.collection('registrations').findOne({ regno: regno });
        if (result) {
            res.send(`
                <h3>Record Found</h3>
                <p>Reg No: ${result.regno}</p>
                <p>Name: ${result.name}</p>
                <p>Events: ${result.events.join(", ")}</p>
                <a href="/search.html">New Search</a>
            `);
        } else {
            res.send("No record found. <a href='/search.html'>Try again</a>");
        }
    } catch (err) {
        res.status(500).send("Search Error");
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));