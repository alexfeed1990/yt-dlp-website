# YT-DLP Website

A simple website which uses [YT-DLP](https://github.com/yt-dlp/yt-dlp) (not yt-dl).

# Running

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

# Known issues

If you are running this project on linux, you might have some issues like these:

 - Error accessing pyinstaller from executable

Fix: Download yt-dlp from their official repository from the releases tab

 - EACCESS error with yt-dlp

Fix: Manually run ``chmod +x`` on the executable.
