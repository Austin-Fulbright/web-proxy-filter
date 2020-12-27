const HTTP_STATUS_200 = "HTTP/1.1 200 OK\r\n\n";
const HTTP_STATUS_401 = "HTTP/1.1 401 Unauthorized\r\n\nSite blocked.";
const HTTP_STATUS_503 = "HTTP/1.1 503 Service Unavailable";


// TODO: Put this in config.
const PROXY_PORT_NUMBER = 2600;

exports.Constants = {  
  HTTP_STATUS_200: HTTP_STATUS_200,
  HTTP_STATUS_401: HTTP_STATUS_401,
  HTTP_STATUS_503: HTTP_STATUS_503,
  PROXY_PORT_NUMBER: PROXY_PORT_NUMBER
};