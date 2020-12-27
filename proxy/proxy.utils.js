exports.IsFound = IsFound;
exports.GetToken = GetToken;


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