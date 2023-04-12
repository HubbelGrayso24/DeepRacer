const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 3000;

const dbConfig = {
    host: "db",
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

db.connect()
    .then((obj) => {
        console.log("Database connection successful");
        obj.done();
    })
    .catch((error) => {
        console.log("ERROR:", error.message || error);
});

app.set("view engine", "ejs");
app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get("/", (req, res) => {
    const counter = 0;
    const track1FastestTimes = [];
    const track2FastestTimes = [];
    const track1MostLaps = [];
    const track2MostLaps = [];
    const dataHold = [];

    db.any('SELECT * FROM teams')
        .then((data) => {
            for (let i = 0; i < data.length; i++) {
                db.any('SELECT * FROM results WHERE team_id = $1 AND track_id = 1 ORDER BY time ASC LIMIT 1', [data[i].team_id])
                    .then((results) => {
                        track1FastestTimes[counter] = results[0].time;
                    });
                db.any('SELECT * FROM results WHERE team_id = $1 AND track_id = 2 ORDER BY time ASC LIMIT 1', [data[i].team_id])
                    .then((results) => {
                        track2FastestTimes[counter] = results[0].time;
                    });
                db.any('SELECT * FROM results WHERE team_id = $1 AND track_id = 1 ORDER BY laps DESC LIMIT 1', [data[i].team_id])
                    .then((results) => {
                        track1MostLaps[counter] = results[0].laps;
                    });
                db.any('SELECT * FROM results WHERE team_id = $1 AND track_id = 2 ORDER BY laps DESC LIMIT 1', [data[i].team_id])
                    .then((results) => {
                        track2MostLaps[counter] = results[0].laps;
                    });
            }
            const dataHold = data;
        })
        .then(() => {
            res.render("pages/index", {
                teams: dataHold,
                track1FastestTimes: track1FastestTimes,
                track2FastestTimes: track2FastestTimes,
                track1MostLaps: track1MostLaps,
                track2MostLaps: track2MostLaps,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/teams", (req, res) => {
    db.any("SELECT * FROM teams")
        .then((data) => {
            res.render("pages/teams", {
                teams: data,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/teams/add", (req, res) => {
    res.render("pages/addTeam");
});

app.post("/teams/add", (req, res) => {
    db.oneOrNone("SELECT * FROM teams WHERE team_name = $1", [req.body.name])
        .then((data) => {
            if (data) {
                res.render("pages/addTeam", {
                    error: "Team already exists",
                });
            }
            else {
                db.none("INSERT INTO teams (team_name, student1, student2, student3, car_number) VALUES ($1, $2, $3, $4, $5)", [req.body.name, req.body.student1, req.body.student2, req.body.student3, req.body.carid])
                    .then(() => {
                        res.redirect("/teams");
                    })
                    .catch((error) => {
                        console.log("ERROR:", error.message || error);
                    });
            }
        })
});

app.get("/teams/:id", (req, res) => {
    db.one("SELECT * FROM teams WHERE team_id = $1", [req.params.id])
        .then((data) => {
            res.render("pages/editTeam", {
                team: data,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

// Need to update this to not create null values in database
app.post("/teams/:id", (req, res) => {
    db.none("UPDATE teams SET team_name = $1, student1 = $2, student2 = $3, student3 = $4, car_number = $5 WHERE team_id = $6", [req.body.teamName, req.body.student1, req.body.student2, req.body.student3, req.body.carid, req.params.id])
        .then(() => {
            res.redirect("/teams");
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/teams/:id/delete", (req, res) => {
    db.one("SELECT * FROM teams WHERE team_id = $1", [req.params.id])
        .then((data) => {
            res.render("pages/deleteTeam", {
                team: data,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.post("/teams/:id/delete", (req, res) => {
    db.none("DELETE FROM teams WHERE team_id = $1", [req.params.id])
        .then(() => {
            res.redirect("/teams");
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/results", (req, res) => {
    db.any("SELECT * FROM results_table")
        .then((data) => {
            res.render("pages/results", {
                results: data,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/results/add", (req, res) => {
    db.any("SELECT * FROM teams")
        .then((data) => {
            const teams = data;
            db.any("SELECT * FROM tracks")
                .then((data) => {
                    const tracks = data;
                    res.render("pages/addResult", {
                        teams: teams,
                        tracks: tracks,
                    });
                });
                
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.post("/results/add", (req, res) => {
    db.none("INSERT INTO results (team_id, track_id, time, laps) VALUES ($1, $2, $3, $4)", [req.body.team, req.body.track, req.body.time, req.body.laps])
        .then(() => {
            res.redirect("/results");
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/results/:id", (req, res) => {
    db.one("SELECT * FROM teams")
        .then((data) => {
            const teams = data;
            db.one("SELECT * FROM tracks")
                .then((data) => {
                    const tracks = data;
                });
        });

    db.one("SELECT * FROM results_table WHERE id = $1", [req.params.id])
        .then((data) => {
            res.render("pages/result", {
                result: data,
                teams: teams,
                tracks: tracks,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.post("/results/:id", (req, res) => {
    db.none("UPDATE results SET team_id = $1, track_id = $2, time = $3, laps = $4 WHERE id = $5", [req.body.team, req.body.track, req.body.time, req.body.laps, req.params.id])
        .then(() => {
            res.redirect("/results");
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/results/:id/delete", (req, res) => {
    db.one("SELECT * FROM results_table WHERE id = $1", [req.params.id])
        .then((data) => {
            res.render("pages/deleteResult", {
                result: data,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.post("/results/:id/delete", (req, res) => {
    db.none("DELETE FROM results WHERE id = $1", [req.params.id])
        .then(() => {
            res.redirect("/results");
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/tracks", (req, res) => {
    db.any("SELECT * FROM tracks")
        .then((data) => {
            res.render("pages/tracks", {
                tracks: data,
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.get("/reset", (req, res) => {
    res.render("reset");
});

app.post("/reset/teams", (req, res) => {
    db.none("DELETE FROM teams")
        .then(() => {
            db.none("DELETE FROM results")
                .then(() => {
                    res.redirect("/teams");
                })
                .catch((error) => {
                    console.log("ERROR:", error.message || error);
                }
            );
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});

app.post("/reset/results", (req, res) => {
    db.none("DELETE FROM results")
        .then(() => {
            res.redirect("/results");
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        });
});



app.listen(3000);
console.log('Server is listening on port 3000');