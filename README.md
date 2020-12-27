# Web Proxy Filter

Intended to be used as a web proxy for web browsers to block websites. Logs to a SQLite database.



# Running from Console


Install Packages
```
npm i
```

To start the server, run:

```
npm start
```
Which should run app.js. If you use Windows 10, set the Proxy settings like so:


![picture 1](images/62b23c233b8e4adef3ccea090b4443a43abd5b59a1893d3b5ebad08ac123e16f.png)  




```
Settings > Network & Internet > Proxy
```

You may need to do the following as well (on the same settings page):

![picture 2](images/f7b48e171c0e2688511a996fce274d5ee94ab379bfd1db7e7b6d394e1c30109e.png)  



# What Gets Logged
Schema for this is in the .sql  migration file:

```sql
CREATE TABLE LogEntry (
  isHttps INTEGER,
  domain TEXT,
  port TEXT,
  userAgent TEXT,
  dateStamp TEXT,
  blockedByList INTEGER
);
```


What it looks like:

![picture 3](images/34c48edc2df54262d4b5130283c8ed257edc68e5eea4e45d687991689e7660e4.png)  


# Recommended Tool Kit

- [Visual Studio Code](https://code.visualstudio.com/)
- [SQLiteStudio](https://code.visualstudio.com/)