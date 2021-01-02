const fs = require("fs");
const utils = require('../proxy/proxy.utils');

test('GetToken', () => {    
  // Checking for empty strings returned.
  expect(utils.GetToken("UserAgent: 100", ":", 55)).toBe("");
  expect(utils.GetToken("UserAgent", ":asdfasdf", 55)).toBe("");
  expect(utils.GetToken("UserAgent", null, -1)).toBe("");
  expect(utils.GetToken("UserAgent", null, null)).toBe("");
  expect(utils.GetToken("", null, 345)).toBe("");
  expect(utils.GetToken(null, 3, 345)).toBe("");
  expect(utils.GetToken(undefined, 3, 345)).toBe("");
  expect(utils.GetToken(null, null, 345)).toBe("");
  expect(utils.GetToken("UserAgent: 100", 1, 345)).toBe("");
  expect(utils.GetToken("UserAgent: 100", 1, null)).toBe("");
  expect(utils.GetToken("UserAgent: 100", ":", 2)).toBe(""); 
    
  expect(utils.GetToken("UserAgent: 100", ":", 1).trim()).toBe("100"); 
  
  // The following is a test that has a space before the 100. 
  expect(utils.GetToken("UserAgent: 100", ":", 1)).toBe(" 100"); 
    
  expect(utils.GetToken("UserAgent: 100", ": ", 1)).toBe("100"); 
});




test('IsFoundWithWildcard', () => {    
  expect(utils.IsFoundWithWildcard("", "")).toBe(true);
  expect(utils.IsFoundWithWildcard(".", "*")).toBe(true);  
  expect(utils.IsFoundWithWildcard("..", ".*.")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "*")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "**")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com/bing", "*bing*")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com/bing", "*bing")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com/bing", "*.com*")  ).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "*")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "google******com")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "*google.com*")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "g*")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "g*com")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "google.com")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "g*gle.com")).toBe(true);
  expect(utils.IsFoundWithWildcard("google.com", "g*e.com")  ).toBe(true);  
  
  expect(utils.IsFoundWithWildcard("\t", "")).toBe(false);
  expect(utils.IsFoundWithWildcard("..", ".")  ).toBe(false);
  expect(utils.IsFoundWithWildcard("google.com/bing", "bing*")).toBe(false);
  expect(utils.IsFoundWithWildcard("google.com", "bing.com")).toBe(false);
  expect(utils.IsFoundWithWildcard("google.com", "gogle.com")).toBe(false);
  expect(utils.IsFoundWithWildcard("google.com", "g[o]ogle.com")).toBe(false);
  expect(utils.IsFoundWithWildcard("google.com", "*.google.com")).toBe(false);
  expect(utils.IsFoundWithWildcard("www.google.com", "google.com") ).toBe(false);
  
  // Nulls
  expect(utils.IsFoundWithWildcard(".", null)).toBe(false);
  expect(utils.IsFoundWithWildcard(".", undefined)).toBe(false);
  expect(utils.IsFoundWithWildcard(null, "")).toBe(true);
  expect(utils.IsFoundWithWildcard(null, null)).toBe(true);
  
  expect(utils.IsFoundWithWildcard(undefined, undefined)).toBe(true);
  expect(utils.IsFoundWithWildcard(null, null)).toBe(true);
});


test('IsFoundInWildCardEntries', () => {    
  let whiteList = [      
    // Google
    "google.com",    
    
    // Yahoo
    "yahoo.com",
    
    // Bing
    "bing*com",
    "bing.com"
  ];  
  
  expect(utils.IsFoundInWildCardEntries(whiteList, "google.com")).toBe(true);  
  expect(utils.IsFoundInWildCardEntries(whiteList, "bing.com")).toBe(true);  
  expect(utils.IsFoundInWildCardEntries(whiteList, "bingo.com")).toBe(true);
  
  expect(utils.IsFoundInWildCardEntries("", "")).toBe(false);  
  // Is empty value in the list... should not. 
  expect(utils.IsFoundInWildCardEntries(null, null)).toBe(false);  
  expect(utils.IsFoundInWildCardEntries(whiteList, "bingo.comx")).toBe(false);  
  expect(utils.IsFoundInWildCardEntries(whiteList, "")).toBe(false);
  expect(utils.IsFoundInWildCardEntries(whiteList, "bing.comx")).toBe(false);
  expect(utils.IsFoundInWildCardEntries(whiteList, "xbing.comx")).toBe(false);
  expect(utils.IsFoundInWildCardEntries(whiteList, "bingo.com*")).toBe(false);
});


test('GetDomainListFromFile', () => {      
  let fileLocation = "./whitelist.txt";
  
  let whiteList = [
    "www.bing.com",
    "google.com",
    "ask.com",
    "yahoo.com",
    "microsoft.com",
  ];  

  expect(utils.GetDomainListFromFile(fileLocation)).toStrictEqual(whiteList);  
});