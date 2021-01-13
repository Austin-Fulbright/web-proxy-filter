-- Up  
CREATE TABLE LogEntry (
  isHttps INTEGER,
  domain TEXT,
  domainRoot TEXT,
  port TEXT,
  userAgent TEXT,
  dateStamp TEXT,
  blockedByList INTEGER,
  
  isError INTEGER,
  errorMessage TEXT  
);



CREATE VIEW vLogEntries 
AS
SELECT 
    isHttps,
    domain,
    domainRoot,
    port,
    userAgent,
    
    -- Date Stamp Raw
    -- dateStamp AS 'dateTime',          
    strftime('%Y-%m-%d %H:%M:%S', dateStamp) as 'dateTime',
    
    -- Date Stamp as 12-hour time format
    strftime('%Y-%m-%d', dateStamp) || ' ' || 
    CASE WHEN strftime('%H', dateStamp) % 12 = 0 THEN 
      12
    ELSE 
      strftime('%H', dateStamp) % 12 
    END || ':' || strftime('%M', dateStamp) 
        || ' ' || CASE WHEN
                    strftime('%H', dateStamp) > 12 THEN 'PM'
                  ELSE 
                    'AM' 
                  END AS 'dateTime12h',    
    
    -- Date Only
    strftime('%Y-%m-%d', dateStamp) AS 'date',
    
    -- Date Only
    strftime('%Y', dateStamp) AS 'year',
    
    -- Date Only
    strftime('%m', dateStamp) AS 'month',
    
    -- 3 letter representation of day of the week
    substr('SunMonTueWedThuFriSat', 1 + 3 * strftime('%w', dateStamp), 3) as 'dayOfWeek',    

    -- Is Today
    CASE WHEN strftime('%Y-%m-%d', dateStamp) = date('now') THEN 
      1
    ELSE 
      0 
    END AS 'isToday',
    
    -- Is Within This Week (SUNDAY = 0, MONDAY = 1, TUES = 2, etc.)
    CASE WHEN strftime('%W', dateStamp) = strftime('%W',date('now')) THEN 
      1
    ELSE 
      0 
    END AS 'isWithinThisWeek',

    blockedByList,
    isError,
    errorMessage
FROM LogEntry;


-- Down 
DROP TABLE IF EXISTS `LogEntry`;