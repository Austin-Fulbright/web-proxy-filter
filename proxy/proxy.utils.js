const fs = require("fs");
const fileLocationForWhitelist = "whitelist.txt";

exports.IsFound = IsFound;
exports.GetToken = GetToken;
exports.IsFoundWithWildcard = IsFoundWithWildcard;
exports.IsFoundInWildCardEntries = IsFoundInWildCardEntries;
exports.GetDomainListFromFile = GetDomainListFromFile;
exports.CreateFile = CreateFile;
exports.GetWhitelistDomains = GetWhitelistDomains;

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
 * Searches for a string inside a string using * wildcards. Check out
 * unit test to see what it matches. Defaults params to "" if undefined || null.
 * @param {*} str
 * @param {*} rule
 * @returns
 */
function IsFoundWithWildcard(str, rule) {
  // Explanation code
  // Based on https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
  // function IsFoundWithWildcard(str, rule) {
  //   // for this solution to work on any string, no matter what characters it has
  //   let escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");

  //   // "."  => Find a single character, except newline or line terminator
  //   // ".*" => Matches any string that contains zero or more characters
  //   rule = rule.split("*").map(escapeRegex).join(".*");

  //   // "^"  => Matches any string with the following at the beginning of it
  //   // "$"  => Matches any string with that in front at the end of it
  //   rule = "^" + rule + "$"

  //   //Create a regular expression object for matching string
  //   let regex = new RegExp(rule);

  //   //Returns true if it finds a match, otherwise it returns false
  //   return regex.test(str);
  // }

  
  str = str || "";
  rule = rule || "";
  
  let escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  
  return new RegExp(
    "^" + rule.split("*").map(escapeRegex).join(".*") + "$"
  ).test(str);    
}



/**
 * Searches for the entry inside the whitelist of domain entries.
 *
 * @param {*} wildCardDomainEntries
 * @param {*} domain
 * @returns
 */
function IsFoundInWildCardEntries(wildCardDomainEntries, domain) {  
  // TODO: can be optimized.
  
  let returnValue = false;
  domain = domain || "";
  wildCardDomainEntries = wildCardDomainEntries || [];
  
  if(wildCardDomainEntries.constructor === Array) {
    returnValue = wildCardDomainEntries.findIndex((entry) => IsFoundWithWildcard(domain, entry) ) != -1;  
  }  
  
  return returnValue;
}



/**
 * Returns sanitized array, removing empty lines and # comments.
 *
 * @param {*} fileLocation
 * @returns
 */
function GetDomainListFromFile(fileLocation) {
  const rawList = fs.readFileSync(fileLocation).toString().split("\n");
  let filteredList = [];
  
  rawList.forEach((item) => {    
    let containsCRChars = (item === '\r' || item === '\n' || item === '\r\n');
    let isCommentHash = item[0] == '#';  
        
    if(!containsCRChars && !isCommentHash) {
      filteredList.push(item.trim());
    }    
  });  
  
  return filteredList;
}


/**
 * Creates a new whitelist.txt if the file doesn't exist. 
 *
 * @param {*} fileLocation
 */
function CreateFile(fileLocation) {
  fs.open(fileLocation, "r", function (err, fd) {
    if (err) {
      fs.writeFile(fileLocation, "", function (err) {
        // Problem, so show error message. 
        if (err) {
          console.log(err);
        }
        // Empty file created.
      });
    } else {
      // File already exists; don't do anything.
    }
  });
}


/**
 * Loads whitelist file and returns an array sanitized. 
 *
 * @returns
 */
function GetWhitelistDomains(dirPath) {  
  let fileLocation = `${dirPath}\\${fileLocationForWhitelist}`;
  //process.exit(1);  
  CreateFile(fileLocation);    
  return GetDomainListFromFile(fileLocation);
}