const {Sequelize, DataTypes} = require('sequelize')

require('dotenv/config')

var cors = require('cors')

const db = new Sequelize("postgres", process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect: 'postgres',
    host: process.env.DB_HOSTNAME,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        socketPath: process.env.DB_HOSTNAME
    },
    logging: false,
    operatorsAliases: '0'
});

db.authenticate().then(() => {
    console.log('Connection established successfully.');
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  })

var express = require('express')
var app = express()

const Notes = db.define('Notes', {
    id: {
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uploader_uid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: ""
    }
  }, {
});

app.use(cors())

app.get('/', function (req,res) {
    res.status(200).send("service online")
})

// respond with "hello world" when a GET request is made to the homepage
app.get('/listEntry', async function (req, res) {
    if (req.query.requestor_uid == undefined) {
        res.status("400").send("Requester User ID Missing")
        return;
    }

    const results = await Notes.findAll({
        where: {
            uploader_uid: req.query.requestor_uid
        }
    }).then(
        (results) => {
            res.status(200).json(results)
        },
        (_) => {
            res.status(404).send("No records found for user")
        }
    );
})

app.put('/updateEntry', function (req, res) {
    if (req.query.requestor_uid == undefined) {
        res.status(400).send("Requester User ID Missing")
        return;
    }

    if (req.query.id == undefined) {
        res.status(400).send("No target entry ID specified")
        return;
    }

    Notes.findOne({
        where: {
            id: req.query.id
        }
    }).then(
        (target) => {
            if (target == null) {
                res.status(404).send("Target object not found")
            } else if (target.get('uploader_uid') != req.query.requestor_uid) {
                res.status(403).send("You must own the entry in order to update it")
            } else {
                target.update({
                    uploader_uid: req.query.requestor_uid,
                    title: req.query.title,
                    url: req.query.url,
                    description: req.query.description
                })
                res.status(200).json(target)
            }
        },
        (_) => {res.status(500).send("Unable to update target object")}
    )
    
})

app.post('/createEntry', function (req, res) {

    if (req.query.requestor_uid == undefined) {
        res.status(400).send("Requester User ID Missing")
        return;
    }

    if (req.query.title == undefined || req.query.url == undefined) {
        res.status(400).send("Note entries require title and url")
        return;
    }

    Notes.create({
        uploader_uid: req.query.requestor_uid,
        title: req.query.title,
        url: req.query.url,
        description: req.query.description
    }).then(
        (model) => {
            res.status(200).json(model)
        },
        (err) => {
            res.status(500).send("Failed to create new entry")
        }
    );
})

app.delete('/deleteEntry', function (req, res) {
    if (req.query.requestor_uid == undefined) {
        res.status(400).send("Requester User ID Missing")
        return;
    }

    if (req.query.id == undefined) {
        res.status(400).send("No target entry ID specified")
        return;
    }

    Notes.findOne({
        where: {
            id: req.query.id
        }
    }).then(
        (target) => {
            if (target == null) {
                res.status(404).send("Target object not found")
            } else if (target.get('uploader_uid') != req.query.requestor_uid) {
                res.status(403).send("You must own the entry in order to delete it")
            } else {
                target.destroy()
                res.status(200).send("Entry successfully deleted")   
            }
        },
        (_) => {res.status(500).send("Unable to delete target object")}
    )
})

const minimist = require('minimist');

async function resetDB() {
    await Notes.destroy({
        truncate: true,
        restartIdentity: true
    })
}

async function syncDB() {
    return db.sync()
}

let args = minimist(process.argv.slice(2), {
    alias: {
        p: 'port'
    }
});


db.sync().then((_) => {
    app.listen(args.port, () => {
        console.log(`App is online and listening at http://localhost:${args.port}`)
        app.emit("appStarted");
    })
})


module.exports = {
    app,
    resetDB,
    syncDB
};

process.on('SIGTERM', () => {
    db.close()
})