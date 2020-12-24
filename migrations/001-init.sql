-- Up  
CREATE TABLE LogEntry (
  isHttps INTEGER,
  domain TEXT,
  port TEXT,
  userAgent TEXT,
  dateStamp TEXT,
  blockedByList INTEGER
);

-- Down 
DROP TABLE IF EXISTS `LogEntry`;