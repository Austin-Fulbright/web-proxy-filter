const fs = require("fs");
const copydir = require("copy-dir");
const { exec } = require("child_process");

// ==================================================================---
// Run by hitting F5 from this file. You'll have to comment the next
// set of comments. 
//
// pkg command:
// ==================================================================---
// const cmdPkg            = "pkg ../ --targets node14-win-x64 --out-path ../build/release";
// const dirNodeModules    = "./release/node_modules";
// const dirNodeAddonsFrom = "../node_modules/sqlite3/";
// const dirNodeAddonsTo   = "../build/release/node_modules/sqlite3";
// ==================================================================---


// runs from npm run prod
const cmdPkg            = "pkg ./ --targets node14-win-x64 --out-path ./build/release";
//const cmdPkg            = `pkg ${process.cwd()} --targets node14-win-x64`;
const dirNodeModules    = "./build/release/node_modules";
const dirNodeAddonsFrom = "./node_modules/sqlite3/";
const dirNodeAddonsTo   = "./build/release/node_modules/sqlite3";


console.log("Starting packaging to exe (pkg)...");

exec(cmdPkg,
  (error, stdout, stderr) => {
    
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    
    // console.log(`stdout: ${stdout}`);    
    console.log("Done creating executable (pkg).");  
    
    // Make the empty directories
    let dir = dirNodeModules;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    dir = `${dirNodeModules}/sqlite3`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    console.log("Done creating empty directories for compiled node addons.");

    // Copy the compiled Node addons (.node)
    copydir.sync(dirNodeAddonsFrom, dirNodeAddonsTo, {
      utimes: true, // keep add time and modify time
      mode: true, // keep file mode
      cover: true, // cover file when exists, default is true
    });
    
    console.log("Done copying compiled node addons.");
    
    console.log("\n");
    console.log("Publish/Release complete.");

  }
);