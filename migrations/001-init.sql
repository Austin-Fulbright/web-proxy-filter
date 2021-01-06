-- Up  
CREATE TABLE LogEntry (
  isHttps INTEGER,
  domain TEXT,
  port TEXT,
  userAgent TEXT,
  dateStamp TEXT,
  blockedByList INTEGER,
  
  isError INTEGER,
  errorMessage TEXT  
);

-- Down 
DROP TABLE IF EXISTS `LogEntry`;