DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams(
    team_id SERIAL PRIMARY KEY,
    team_name TEXT NOT NULL,
    student1 TEXT NOT NULL,
    student2 TEXT,
    student3 TEXT,
    car_number NUMERIC(3)
);

DROP TABLE IF EXISTS tracks CASCADE;
CREATE TABLE tracks(
    track_id SERIAL PRIMARY KEY,
    track_name TEXT NOT NULL
);

DROP TABLE IF EXISTS results CASCADE;
CREATE TABLE results(
    result_id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    time NUMERIC(5,2) NOT NULL,
    laps NUMERIC(3) NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (track_id) REFERENCES tracks(track_id)
);

CREATE OR REPLACE VIEW results_table AS
SELECT teams.team_name, tracks.track_name, results.time, results.laps
FROM teams
JOIN results ON teams.team_id = results.team_id
JOIN tracks ON tracks.track_id = results.track_id;