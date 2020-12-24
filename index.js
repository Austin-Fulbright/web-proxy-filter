const net = require("net");
const DB = require('better-sqlite3-helper');
const proxyServer = net.createServer();
const moment = require("moment");

const HTTP_STATUS_200 = "HTTP/1.1 200 OK\r\n\n";
const HTTP_STATUS_401 = "HTTP/1.1 401 Unauthorized\r\n\nSite blocked.";
const HTTP_STATUS_503 = "HTTP/1.1 503 Service Unavailable";


/**
 * Searches text based on regular expresion.
 *
 * @param {*} text
 * @param {*} regexp
 * @returns
 */
function IsFound(text, regexp) {  
  regexp = RegExp(regexp);  
  return text.search(regexp) >= 0;
}


/**
 * Returns empty string if nothing was found or index out of range.
 *
 * @param {*} string
 * @param {*} separator
 * @param {*} index
 * @returns
 */
function GetToken(string, separator, index) {  
  let returnValue = "";  
  if(string !== null && string !== undefined) 
  {
    returnValue = string.split(separator)[index];
  }
  return returnValue || "";
}



/**
 * Parses buffer data into Json object. 
 *
 * @param {*} buffer
 * @returns
 */
function GetDetailsFromBuffer(buffer, isOnBlackList) {
  let bufferString = buffer.toString();
  
  const defaultPort = "80";
  const dateStamp = moment().format("YYYY-MM-DD h:mm:ss A");    
  
  bufferLines = bufferString.split("\r\n");   
  
  // filter bufferLines to get only lines that 
  // ALWAYS INCLUDE INDEX 0
  // ON INDEX 1 and above, loop through all lines until you
  // only have User-Agent and Host
  
  const isHttps = GetToken(bufferLines[0], " ", 0) === "CONNECT";  
  const domain = GetToken(bufferLines[1], ":", 1).trim();
  const port = GetToken(bufferLines[1], ":", 2).trim() || defaultPort;
  const userAgent = GetToken(bufferLines[3], ":", 1).trim();    
  
  return {
    isHttps: isHttps ? 1 : 0,
    domain: domain,
    port: port,
    userAgent: userAgent,
    dateStamp: dateStamp,
    blockedByList: isOnBlackList ? 1 : 0,
  };      
}

/**
 * Blocks requests and terminates session. 
 *
 */
function BlockRequest(clientSocket, serverSocket) {
  //console.log("BLOCKED")
  // Do other stuff before hand.
  
  clientSocket.write(HTTP_STATUS_401);  
  clientSocket.pipe(serverSocket);
  serverSocket.pipe(clientSocket);  
  clientSocket.end();
}

/**
 * Allows HTTPS requests - secure.
 *
 */
function AllowSecureRequest(clientSocket, serverSocket) {
  //console.log("SECURE");
  
  // Do other stuff before hand.
  
  clientSocket.write(HTTP_STATUS_200);
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
 */
function RunForEachConnection(clientToProxySocket) {
  
  clientToProxySocket.once("data", (buffer) => {    
    let buff = GetDetailsFromBuffer(buffer);      

    let proxyToServerSocket = net.createConnection(
      {
        host: buff.domain,
        port: buff.port,
      },
      () => {

        let isOnBlackList = IsFound(buff.domain, "shinylight");

        if (isOnBlackList) {
          BlockRequest(clientToProxySocket, proxyToServerSocket);
        } else {
          if (buff.isHttps) {
            AllowSecureRequest(clientToProxySocket, proxyToServerSocket);
          } else {
            AllowUnsecureRequest(clientToProxySocket, proxyToServerSocket, buffer);
          }
        }
        
        //console.log(GetDetailsFromBuffer(buffer, isOnBlackList));
        let logEntry = GetDetailsFromBuffer(buffer, isOnBlackList);
        
        DB().insert('LogEntry', logEntry);        
      }
    );

    // If there was an oopsie.
    proxyToServerSocket.on("error", (error) => {
      clientToProxySocket.write(
        [HTTP_STATUS_503, "connection: close"].join("\n") + "\n\n"
      );
      clientToProxySocket.end();
    });

    clientToProxySocket.on("error", (error) => {
      console.log("CLIENT TO PROXY ERROR");
      console.log(error);
    });
  });
}


proxyServer.on("connection", (clientToProxySocket) => {  
  // Client Connected To Proxy
  RunForEachConnection(clientToProxySocket);
});

proxyServer.on("error", (error) => {
  console.log("SERVER ERROR");
  console.log(error);  
});

proxyServer.on("close", () => {
  console.log("Client Disconnected");
});

proxyServer.listen(8124, () => {
  console.log("Server running at http://localhost:" + 8124);
});

process.on("uncaughtException", (error) => {
  console.error("There was an uncaught error", error);
  process.exit(1);
});