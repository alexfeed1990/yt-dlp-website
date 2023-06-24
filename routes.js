const fs = require("fs");
const { exec, spawn } = require("child_process");
 
const session = require('express-session');
const shortid = require('shortid');
const express = require("express");
const bodyParser = require('body-parser');
const JSZip = require('jszip');
const path = require("path");

const port = 3000;
let execPath = "";

function getYTDLPLocation() {
    if(execPath === "") console.error("Internal error: execPath in routes.js hasn't been set by server.js");
    return path.join("ytdlp", execPath);
}

function convertFiles(folder, format) {
    const filenameRegex = /\.(mp4|mp3|m4a|ogg|wav|webm|mkv)$/g;
    if (!fs.existsSync(path.join(__dirname, "ytdlp", "downloads", folder))) return false;
    const folderContents = fs.readdirSync(path.join(__dirname, "ytdlp", "downloads", folder));

    //removes files which already have requested format (so ffmpeg doesnt get all mad)
    folderContents.forEach(file => {
        if(file.endsWith("." + format)) {
            const index = folderContents.indexOf(file);
            if (index > -1) { // only splice array when item is found
                folderContents.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    });

    let tasks = [];
    
    folderContents.forEach(file => {
        const filename = file.replace(filenameRegex, "");
        const arguments = ["-i", path.join(__dirname, "ytdlp", "downloads", folder, file), path.join(__dirname, "ytdlp", "downloads", folder, filename + "." + format)];
        
        tasks.push(new Promise(function (resolve, reject) {
            const ffmpegProcess = spawn("ffmpeg", arguments);

            ffmpegProcess.on('stderr', (stderr) => { reject(stderr) });
            ffmpegProcess.on('error', (error) => { reject(error) });
            ffmpegProcess.on('close', (code) => {
                if (code != 0) reject(code);

                // takes a shit ton of time idk why
                fs.unlink(path.join(__dirname, "ytdlp", "downloads", folder, file), (err) => {
                    if (err) console.error("File deletion error: " + err);
                });

                resolve();
            });
        }));
    });

    return Promise.all(tasks);
}

module.exports.setExecPath = function setExecPath(externalExecPath) {
    execPath = externalExecPath;
};

module.exports.main = function main() {
    const app = express();
    app.use(express.static('www'))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }))

    const oneDay = 1000 * 60 * 60 * 24; // 24 hours
    const downloadDeleteDelay = 1000 * 60 * 20; // 20 minutes

    app.use(session({
        secret: "cdKvpnrsjwDqGDdpgkYqISmLQFZJiddhanKBtPPJ",
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false
    }));

    // Routes //

    app.get('/', (req, res) => {
        res.sendFile('index.html');
    })

    app.get("/downloads/:userid/:jobid", async (req, res) => {
        if (!fs.existsSync(path.join("ytdlp", "downloads", req.params.userid, req.params.jobid))) res.sendStatus(404);

        const URLpath = path.join("ytdlp", "downloads", req.params.userid, req.params.jobid);
        const folderContents = fs.readdirSync(URLpath);
        if(folderContents.length === 1) {

            res.sendFile(path.join(__dirname, URLpath, folderContents[0]));
        } else {
            let zip = new JSZip();

            let tasks = folderContents.map(file => 
                fs.promises.readFile(path.join(__dirname, URLpath, file))
            );
            let results = await Promise.all(tasks);

            for (let i = 0; i < results.length; i++) {
                const data = results[i];
                const name = folderContents[i];
                zip.file(name, data);
            }

            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    res.type(content.type);
                    content.arrayBuffer().then((buf) => {
                        res.setHeader("Content-Disposition", `attachment; filename="download.zip"`)
                        res.send(Buffer.from(buf));
                    });
                });
        }
    });

    // API //

    app.post('/api/download/', (req, res) => {
        const data = req.body;
        let arguments = [];
        let url = data.url;
        const jobid = shortid.generate();
        const ytdlpExec = getYTDLPLocation();


        const audioArgs = ["-f", "ba", "-o", path.join("ytdlp", "downloads", req.sessionID, jobid, "%(title)s.%(ext)s"), "-U", url];
        const videoArgs = ["-f", "bv*+ba/b", "-o", path.join("ytdlp", "downloads", req.sessionID, jobid, "%(title)s.%(ext)s"), "-U", url];    

        switch (data.format) {
            case "mp3":
                arguments = audioArgs;
                break;
            case "mp4":
                arguments = videoArgs;
                break;
            case "m4a":
                arguments = audioArgs;
                break;
            case "wav":
                arguments = audioArgs;
                break;
            case "ogg":
                arguments = audioArgs;
                break;
            case "mkv":
                arguments = videoArgs;
                break;
            case "webm":
                arguments = videoArgs;
                break;
            default:
                res.send("Invalid format.")
                return;
        }

        const ytdlpProcess = spawn(ytdlpExec, arguments);

        let err = false;

        ytdlpProcess.stderr.on("data", data => { res.send(`YT-DLP stderr: ${data}`); err = true});

        ytdlpProcess.on('error', (error) => { res.send(`YT-DLP Error: ${error.message}`); err = true });

        ytdlpProcess.on('close', (code) => {
            if(code != 0) {
                if(!err) res.send("YT-DLP exited with code " + code);
                return;
            }

            convertFiles(path.join(req.sessionID, jobid), data.format)
                .then(() => {
                    res.send(req.baseUrl + "/downloads/" + req.sessionID + "/" + jobid);
                })
                .catch((err) => {
                    res.send("Handled error: " + err);
                });
        });

        // todo: delete downloads after 20 mins :)
    })

    app.listen(port, () => {
        console.log(`YT-DLP website listening on port ${port}`);
    })
}