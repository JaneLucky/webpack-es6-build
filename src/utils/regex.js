//获得2个字符中间的字符串
/**
 *
 * @param {*} str 被截取的字符串
 * @param {*} start 开头字符
 * @param {*} end 结尾字符
 * @param {*} hasStart 是否包含开头字符
 * @param {*} hasEnd 是否包含结尾字符
 */
export function GetTwoCharCenterStr(str, hasStart = false, hasEnd = false) {
  // if(str==null){
  // 	return "";
  // }
  // let matchReg  = /(?<=\]\[).*?(?=\])/g
  // if(hasStart && hasEnd){
  //   matchReg = /\]\[.*?\]/g
  // }else if(hasStart && !hasEnd){
  //   matchReg = /\]\[.*?(?=\])/g
  // }else if(!hasStart && hasEnd){
  //   matchReg = /(?<=\]\[).*?\]/g
  // }
  // return str.match(matchReg)
  return str.split("][")[1].split("]")[0];
}

/**
 * 按照字符pink截取字符串str
 * @param {*} str
 * @param {*} pink
 * @param {*} containPink 截取出来的子串是否包含字符pink
 * @param {*} lastPink  true:按照最后一个字符pink截取，返回前面的内容 / false:按照第一个字符pink截取，返回前面的内容
 * @param {*} preStr  true: 返回前面的内容 / false: 返回后面的内容
 * @returns
 */
export function GetSubStringSplitBy(str, pink, containPink = true, lastPink = false, preStr = true) {
  let firstIndex, lastIndex, index;
  index = lastPink ? str.lastIndexOf(pink) : str.indexOf(pink);
  firstIndex = preStr ? 0 : containPink ? index : index + 1;
  lastIndex = preStr ? (containPink ? index + 1 : index) : str.length;
  return str.substring(firstIndex, lastIndex);
}

// 提取rgba的颜色值分分量
export function GetRgbaColorNum(rgba) {
  var rgx = /(\d(\.\d+)?)+/g;
  let str = rgba.match(rgx);
  return str;
}
