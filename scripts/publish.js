const fs = require("fs");
const copydir = require("copy-dir");
const { exec } = require("child_process");

const dirBuildPath    = "./build";
const copyDirOptions  = {  mode: true,  cover: true };


console.log("Creating a build of only files needed to run app.")

// ========================================================================
// Let's start fresh by deleting the current build artifacts.
// ========================================================================
fs.rmSync(dirBuildPath, { recursive: true, force: true });

// ========================================================================
// Let's copy directories
// ========================================================================
if (!fs.existsSync(dirBuildPath)) {
  fs.mkdirSync(dirBuildPath);
}

copydir.sync('./migrations/', `${dirBuildPath}/migrations/`, copyDirOptions);
copydir.sync('./proxy/', `${dirBuildPath}/proxy/`, copyDirOptions);

if (!fs.existsSync(`${dirBuildPath}/scripts/`)) {
  fs.mkdirSync(`${dirBuildPath}/scripts/`);
}

// ========================================================================
// Individual files that are needed
// ========================================================================
fs.copyFile('./scripts/reports.sql', `${dirBuildPath}/scripts/reports.sql`, () => {});
fs.copyFile('./app.js', `${dirBuildPath}/app.js`, () => {});
fs.copyFile('./whitelist.txt', `${dirBuildPath}/whitelist.txt`, () => {});
fs.copyFile('./package.publish.json', `${dirBuildPath}/package.json`, () => {});

console.log("Done. Files to publish are in ./build");