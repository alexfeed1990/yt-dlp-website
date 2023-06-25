/*
    Admin panel:
        Should store if user is logged in in cookies or whatever you know how to do it
        If user is logged into admin panel, run a command to check for yt-dlp updates at website visit and warn user if there is an update.
        Admin panel has options to just run the update command.
*/

const fs = require("fs");
const { DownloaderHelper } = require('node-downloader-helper');
const commandExists = require('command-exists');
const path = require("path");
const fastFolderSizeSync = require('fast-folder-size/sync')

// Local files //

const { setExecPath, main } = require("./routes.js");

// Variables //

let execPath = "";

// Init stuff //

// This is for knowing what version of yt-dlp to download and which one to run
switch(process.platform) {
    case "win32":
        execPath = "yt-dlp.exe";
        break;
    case "linux":
        // fuck you nested switch
        switch(process.arch) {
            case "arm":
                execPath = "yt-dlp_linux_armv7l";
                break;
            case "arm64":
                execPath = "yt-dlp_linux_aarch64";
                break;
            default:
                execPath = "yt-dlp_linux";
                break;
        }
        break;
    case "darwin":
        if(process.arch != "x64") {
            console.error("The CPU Architecture you're running this app on is not supported officially by YT-DLP. (M1/M2 Macintosh)");
            process.exit();
        }
        execPath = "yt-dlp_macos";
        break;
    default:
        console.error("The OS you're running this app on is not supported officially by YT-DLP. (" + process.process.platform + ")");
        process.exit();
}

if(!commandExists.sync('ffmpeg')) {
    // You need ffmpeg installed for file conversion.
    // Don't try to remove this, just install ffmpeg.
    // Otherwise, the website is gonna crash every time you try to download something.

    // Trust me, I would install ffmpeg for you if I could, but I can't find any universal way to do it, so we're stuck with this.
    console.error("FFMPEG is not installed. There is no universal way to install it.");
    console.log("Thus, you're required to install FFMPEG on your own to run this website.");
    console.log("This is due to the need of file conversion.");
    process.exit();
}

const kilobyte = 1024;
const megabyte = 1024 * kilobyte;
const gigabyte = 1024 * megabyte;
const limit = gigabyte * 2;

if(!fs.existsSync("ytdlp")) fs.mkdirSync("ytdlp");
if (!fs.existsSync(path.join("ytdlp", "downloads"))) fs.mkdirSync(path.join("ytdlp", "downloads"));
if(fastFolderSizeSync(path.join("ytdlp", "downloads")) >= limit) console.warn("Your downloads folder is above 2GB in size. It would be the best to delete it.");

if(!fs.existsSync(path.join("ytdlp", execPath))) {
    console.log("YT-DLP does not exist.");

    // Download YT-DLP //
    const dl = new DownloaderHelper('https://github.com/yt-dlp/yt-dlp/releases/latest/download/' + execPath, "./ytdlp");
    dl.on('start', () => console.log("Downloading YT-DLP."));
    dl.on('end', () => {
        console.log('Download Finished.');
        fs.chmodSync(path.join(__dirname, "ytdlp", execPath), 755, (err) => {
            if(err) console.error("Chmod YT-DLP Error: " + err);
        });

        setExecPath(execPath);
        main();
    });
    dl.on('error', (err) => console.log('Download Failed: ' + err));
    dl.start().catch(err => console.error(err));
} else {
    // For people who are looking through the code,
    // you can find this function in routes.js
    // I split the codebase up in multiple files for organization's sake.
    
    setExecPath(execPath);
    main();
}

