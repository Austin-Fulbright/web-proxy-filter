const net = require("net");
const proxyServer = net.createServer();
const moment = require("moment");
//var dateStamp = moment().format('YYYY-MM-DD h:mm:ss A');


const HTTP_STATUS_200 = "HTTP/1.1 200 OK\r\n\n";
const HTTP_STATUS_401 = "HTTP/1.1 401 Unauthorized\r\n\nSite blocked.";
const HTTP_STATUS_503 = "HTTP/1.1 503 Service Unavailable";


function IsFound(text, regexp) {  
  var regexp = RegExp(regexp);  
  return text.search(regexp) >= 0;
}


/**
 * Blocks requests and terminates session. 
 *
 */
function BlockRequest(clientSocket, serverSocket) {
  
  // Do other stuff before hand.
  
  clientSocket.write(HTTP_STATUS_401);  
  clientSocket.pipe(proxyToServerSocket);
  proxyToServerSocket.pipe(clientToProxySocket);  
  clientSocket.end();
}



/**
 * Allows HTTPS requests - secure.
 *
 */
function AllowSecureRequest(clientSocket, serverSocket) {
  // Do other stuff before hand.
  
  clientSocket.write(HTTP_STATUS_200);
  clientSocket.pipe(proxyToServerSocket);
  serverSocket.pipe(clientToProxySocket);  
}


/**
 * Allows HTTP requests - unsecure.
 *
 */
function AllowUnsecureRequest(clientSocket, serverSocket) {
  // Do other stuff before hand.
  
  serverSocket.write(data);  
  clientSocket.pipe(proxyToServerSocket);
  serverSocket.pipe(clientToProxySocket);      
}


// https://medium.com/@nimit95/a-simple-http-https-proxy-in-node-js-4eb0444f38fc
proxyServer.on("connection", (clientToProxySocket) => {
  
  // console.log("Client Connected To Proxy");

  // We need only the data once, the starting packet
  clientToProxySocket.once("data", (buffer) => {

    let isTLSConnection = buffer.toString().indexOf("CONNECT") !== -1;

    // By Default port is 80
    let serverPort = 80;
    let serverAddress;    

    if (isTLSConnection) {
      // Port changed if connection is TLS
      serverPort = buffer
        .toString()
        .split("CONNECT ")[1]
        .split(" ")[0]
        .split(":")[1];
      serverAddress = buffer
        .toString()
        .split("CONNECT ")[1]
        .split(" ")[0]
        .split(":")[0];
    } else {
      serverAddress = buffer.toString().split("Host: ")[1].split("\r\n")[0];
    }

    console.log(serverAddress);




    let proxyToServerSocket = net.createConnection(
      {
        host: serverAddress,
        port: serverPort,
      },
      () => {

        var isOnWhiteList = IsFound(serverAddress, "shinylight");

        if (isOnWhiteList) {
          BlockRequest(clientToProxySocket, proxyToServerSocket);
        } else {
          if (isTLSConnection) {
            AllowSecureRequest(clientToProxySocket, proxyToServerSocket);
          } else {
            AllowUnsecureRequest(clientToProxySocket, proxyToServerSocket);
          }
        }
        
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
