const getConfig = require("./config");

const encryptString = async (content) => {
  content = JSON.stringify(content);
  let passcode = await getConfig("stringEncryptDecrypt");
  let result = [];
  let passLen = passcode.length;
  for (let i = 0; i < content.length; i++) {
    let passOffset = i % passLen;
    let calAscii = content.charCodeAt(i) + passcode.charCodeAt(passOffset);
    result.push(calAscii);
  }
  return JSON.stringify(result);
};
const decryptString = async (content) => {
  let passcode = await getConfig("stringEncryptDecrypt");
  let result = [];
  let str = "";
  let codesArr = JSON.parse(content);
  let passLen = passcode.length;
  for (let i = 0; i < codesArr.length; i++) {
    let passOffset = i % passLen;
    let calAscii = codesArr[i] - passcode.charCodeAt(passOffset);
    result.push(calAscii);
  }
  for (let i = 0; i < result.length; i++) {
    let ch = String.fromCharCode(result[i]);
    str += ch;
  }
  return JSON.parse(str);
};

module.exports = { encryptString, decryptString };
