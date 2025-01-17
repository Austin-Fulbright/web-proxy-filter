const net = require("net");
const proxyServer = net.createServer();

const constants = require('./proxy/constants').Constants;
const proxyHandler = require('./proxy/proxy.handlers');
const utils = require('./proxy/proxy.utils');
const dirPath = __dirname;

const whiteListDomains = utils.GetWhitelistDomains(dirPath);
const { spawn } = require('child_process');

//learning model for predicting sites that are not on the whitelist
function predictUsingMLModel(domain) {
  const process = spawn('python3', ['ml/model_prediction.py', domain]);

  process.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    console.log(data.toString());
  });
}


// =============================================
// Let's open port and run server.
// =============================================
proxyServer.listen(constants.PROXY_PORT_NUMBER, () => {
  console.log("Server running at http://localhost:" + constants.PROXY_PORT_NUMBER);
  console.log("\n");
});


// =============================================
// For each connection.
// =============================================
proxyServer.on("connection", (clientToProxySocket) => {    
  clientToProxySocket.once("data", (buffer) => {
    const details = proxyHandler.GetDetailsFromBuffer(buffer);
    const domain = details.domain;
    predictUsingMLModel(domain);
    proxyHandler.RunForEachConnection(clientToProxySocket, buffer, whiteListDomains);
  }); 
});

function RunForEachConnection(clientToProxySocket, buffer, whiteListDomains) {     
  let buff = GetDetailsFromBuffer(buffer);      
  
  let proxyToServerSocket = net.createConnection(
    {
      host: buff.domain,
      port: buff.port,
    },
    () => {        
      
      let isOnWhiteList = Utils.IsFoundInWildCardEntries(whiteListDomains, buff.domain);
              
      if (isOnWhiteList) {
        if (buff.isHttps) {
          AllowSecureRequest(clientToProxySocket, proxyToServerSocket);
        } 
        else {
          AllowUnsecureRequest(clientToProxySocket,proxyToServerSocket,buffer);
        }
      } 
      else {
        BlockRequest(clientToProxySocket, proxyToServerSocket);
      }        
  
      let logEntry = GetDetailsFromBuffer(buffer, isOnWhiteList);
      
      DB().insert("LogEntry", logEntry);        
    }
  );
  
  // Rest of the code...
}

// =============================================
// Problems with proxy server.
// =============================================
proxyServer.on("error", exitHandler.bind(null, { 
  exit: true, cleanup: true 
}));


// =============================================
// Close connection.
// =============================================
proxyServer.on("close", () => {
  console.log("Client Disconnected");
});


// =============================================
// Problems with this process.
// =============================================
process.on("uncaughtException", exitHandler.bind(null, { 
  exit: true, cleanup: true }
));


// So the program will not close instantly.
process.stdin.resume(); 

function exitHandler(options, exitCode) {
  
  // Cleaning up.
  if (options.cleanup) { 
    proxyServer.close();
    
    // CLEAN UP HERE!! kill port?
    // console.log("CLEANUP");    
  }
  
  if (exitCode || exitCode === 0) { 
    console.log(exitCode);    
    // console.log("EXITCODE");    
  }
  
  // Exiting... 
  if (options.exit) { 
    process.exit();        
  }
}


// https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
// do something when app is closing

process.on("exit", exitHandler.bind(null, { 
  cleanup: true 
}));

// catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { 
  exit: true, cleanup: true 
}));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { 
  exit: true 
}));

process.on("SIGUSR2", exitHandler.bind(null, { 
  exit: true 
}));


