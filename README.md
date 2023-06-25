# YT-DLP Website

A simple video downloader website which uses [YT-DLP](https://github.com/yt-dlp/yt-dlp) (not yt-dl).

You can use a live demo at [yt-dlp-website.xfi.repl.co](https://yt-dlp-website.xfi.repl.co/)!

# Setup

To run the website, clone this repository:
```
git clone https://github.com/alexfeed1990/yt-dlp-website
```
Then, cd into the repository and run ``npm i``
```
cd yt-dlp-website
npm i
```
There are two ways to run the website, one for development and one for production:
```
npm run start # production
npm run dev # development (nodemon)
```

You can also configure some stuff about the website in ``./config.json``.

# Known issues

 - Error accessing pyinstaller from executable

Fix: Download yt-dlp from their official repository from the releases tab

 - EACCESS error with yt-dlp

Fix: Manually run ``chmod +x`` on the executable.

 - FFMPEG killed with error SIGKILL

Fix: There is no general fix here. FFMPEG ran out of ram and it got killed.
