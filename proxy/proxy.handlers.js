const net = require("net");
const moment = require("moment");
const DB = require('sqlite3-helper');
//const DB = require('better-sqlite3-helper');

const Utils = require('./proxy.utils');
const constants = require('./constants').Constants;

exports.GetDetailsFromBuffer = GetDetailsFromBuffer;
exports.BlockRequest = BlockRequest;
exports.AllowSecureRequest = AllowSecureRequest;
exports.AllowUnsecureRequest = AllowUnsecureRequest;
exports.RunForEachConnection = RunForEachConnection;

/**
 * Parses buffer data into Json object. 
 *
 * @param {*} buffer
 * @returns
 */
function GetDetailsFromBuffer(buffer, isOnWhiteList) {
  let bufferString = buffer.toString();
  
  const defaultPort = "80";
  const dateStamp = moment().format("YYYY-MM-DD h:mm:ss A");    
  
  bufferLines = bufferString.split("\r\n");   
  
  // filter bufferLines to get only lines that 
  // ALWAYS INCLUDE INDEX 0
  // ON INDEX 1 and above, loop through all lines until you
  // only have User-Agent and Host
  
  const isHttps = Utils.GetToken(bufferLines[0], " ", 0) === "CONNECT";  
  const domain = Utils.GetToken(bufferLines[1], ":", 1).trim();
  const port = Utils.GetToken(bufferLines[1], ":", 2).trim() || defaultPort;
  const userAgent = Utils.GetToken(bufferLines[3], ":", 1).trim();    
  
  return {
    isHttps: isHttps ? 1 : 0,
    domain: domain,
    port: port,
    userAgent: userAgent,
    dateStamp: dateStamp,
    blockedByList: isOnWhiteList ? 1 : 0,
    isError: 0,
    errorMessage: ''
  };      
}


/**
 * Blocks requests and terminates session. 
 *
 */
function BlockRequest(clientSocket, serverSocket) {
  // console.log("BLOCKED")
  // Do other stuff before hand.
  
  clientSocket.write(constants.HTTP_STATUS_401);  
  clientSocket.pipe(serverSocket);
  serverSocket.pipe(clientSocket);  
  clientSocket.end();
}


/**
 * Allows HTTPS requests - secure.
 *
 */
function AllowSecureRequest(clientSocket, serverSocket) {  
  clientSocket.write(constants.HTTP_STATUS_200);
  clientSocket.pipe(serverSocket);
  serverSocket.pipe(clientSocket);  
}


/**
 * Allows HTTP requests - unsecure.
 *
 */
function AllowUnsecureRequest(clientSocket, serverSocket, buffer) {
  //console.log("UNSECURE");
  
  // Do other stuff before hand.
  
  serverSocket.write(buffer);  // We can't do this in https.
  clientSocket.pipe(serverSocket);
  serverSocket.pipe(clientSocket);      
}



/**
 * Executes for each unique connection. 
 *
 * @param {*} clientToProxySocket
 * @param {*} whiteListDomains
 */
function RunForEachConnection(clientToProxySocket, whiteListDomains) {     
  
  clientToProxySocket.once("data", (buffer) => {    
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

    // If there was an oopsie.
    proxyToServerSocket.on("error", (error) => {      
      buff.isError = 1;
      buff.errorMessage = error;
      DB().insert("LogEntry", buff);   
      
      clientToProxySocket.write(
        [constants.HTTP_STATUS_503, "connection: close"].join("\n") + "\n\n"
      );
      clientToProxySocket.end();
    });

    clientToProxySocket.on("error", (error) => {      
      buff.isError = 1;
      buff.errorMessage = error;
      DB().insert("LogEntry", buff);         
      
      console.log("=======================================================");
      console.log("CLIENT TO PROXY ERROR");      
      console.log(error);
      console.log(buff);
    });
  });
}