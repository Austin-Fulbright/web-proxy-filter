const moment = require("moment");



//var buffer = 'CONNECT server.example.com:443 HTTP/1.1\r\nHost: server.example.com:443\r\nProxy-Authorization: basic aGVsbG86d29ybGQ=\r\nUser-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41';

/*

CONNECT server.example.com:443 HTTP/1.1
Host: server.example.com:443
Proxy-Authorization: basic aGVsbG86d29ybGQ=
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41

*/


var buffer = 'GET server.example.com:80 HTTP/1.1\r\nHost: apache.org\r\nProxy-Connection: keep-alive\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36\r\n';




// function GetDetailsFromBuffer(buffer) {
//   const defaultPort = "80";
//   const isHttps = buffer.toString().indexOf("CONNECT") !== -1;
//   const dateStamp = moment().format("YYYY-MM-DD h:mm:ss A");

//   buffer = buffer.split("\n");
//   let fullLine = buffer[1].split("Host: ")[1];
//   const domain = fullLine.split(":")[0];
//   let port = fullLine.split(":")[1] || defaultPort;  
//   fullLine = buffer[3].split("User-Agent: ")[1];  
//   let userAgent = fullLine;  
  
//   return { 
//     domain: domain,
//     port: port,
//     userAgent: userAgent,
//     dateStamp: dateStamp
//   }    
// }


function GetDetailsFromBuffer(buffer) {
  let bufferString = buffer.toString();
  
  const defaultPort = "80";
  const dateStamp = moment().format("YYYY-MM-DD h:mm:ss A");    
  
  bufferLines = bufferString.split("\r\n");   
  
  const isHttps = GetToken(bufferLines[0], " ", 0) === "CONNECT";  
  const domain = GetToken(bufferLines[1], ":", 1).trim();
  const port = GetToken(bufferLines[1], ":", 2).trim() || defaultPort;
  const userAgent = GetToken(bufferLines[3], ":", 1).trim();  
  
  return {
    isHttps: isHttps,
    domain: domain,
    port: port,
    userAgent: userAgent,
    dateStamp: dateStamp    
  };    
}


console.log(GetDetailsFromBuffer(buffer));



/**
 * Returns empty string if nothing was found or index out of range.
 *
 * @param {*} string
 * @param {*} separator
 * @param {*} index
 * @returns
 */
function GetToken(string, separator, index) {  
  var returnValue = "";  
  if(string !== null && string !== undefined) 
  {
    returnValue = string.split(separator)[index];
  }
  return returnValue || "";
}


//console.log(GetToken("UserAgent: 100", ":", 55)); // undefined
//console.log(GetToken("UserAgent", ":", 55)); // undefined
//console.log(GetToken("UserAgent", ":asdfasdf", 55)); // undefined
//console.log(GetToken("UserAgent", null, -1)); // undefined
//console.log(GetToken("UserAgent", null, null)); // undefined
//console.log(GetToken("", null, 345)); // undefined

// console.log(GetToken(null, 3, 345)); // ""
// console.log(GetToken(undefined, 3, 345)); // ""
// console.log(GetToken(null, null, 345)); // ""

// console.log(GetToken("UserAgent: 100", 1, 345)); // ""
// console.log(GetToken("UserAgent: 100", 1, null)); // ""

//console.log(GetToken("UserAgent: 100", ":", 2)); // ""


// console.log(GetToken("UserAgent: 100", ":", 1).trim()); // "100""
// console.log(GetToken("UserAgent: 100", ":", 1)); // " 100" 

// notice space after :
//console.log(GetToken("UserAgent: 100", ": ", 1)); // " 100" 


