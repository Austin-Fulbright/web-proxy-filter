const net = require("net");
const proxyServer = net.createServer();

const constants = require('./proxy/constants').Constants;
const proxyHandler = require('./proxy/proxy.handlers');


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
  proxyHandler.RunForEachConnection(clientToProxySocket);  
});


// =============================================
// Close connection.
// =============================================
proxyServer.on("close", () => {
  console.log("Client Disconnected");
});


// =============================================
// Problems with proxy server.
// =============================================
proxyServer.on("error", (error) => {
  console.log("\n");  
  console.log("SERVER ERROR");
  console.log(error);  
  console.log("\n");  
});


// =============================================
// Problems with this process.
// =============================================
process.on("uncaughtException", (error) => {
  console.error("There was an uncaught error", error);
  process.exit(1);
});