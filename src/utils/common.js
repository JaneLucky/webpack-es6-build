// 数组去重
export function ListDuplicate(list, key){
  // 根据key字段重复去重
  let backList, obj = {};
  backList = list.reduce(function(item, next) {
    obj[next[key]] ? '' : obj[next[key]] = true && item.push(next)
    return item
  }, [])
  return backList
}

//正则截取第一个和最后一个相同字符之间的内容
export function MatchCenterStringByCharacter(str, character){
  let regular
  switch (character) {
    case "$":
      regular = /\$(\S*)\$/
      break;
    case "(":
      regular = /\((\S*)\(/
      break;
    case ")":
      regular = /\)(\S*)\)/
      break;
    case "*":
      regular = /\*(\S*)\*/
      break;
    case ".":
      regular = /\.(\S*)\./
      break;
    case "[":
      regular = /\[(\S*)\[/
      break;
    case "]":
      regular = /\](\S*)\]/
    break;
    case "?":
      regular = /\?(\S*)\?/
      break;
    case "\\":
      regular = /\\(\S*)\\/
      break;
    case "/":
      regular = /\/(\S*)\//
      break;
    case "^":
      regular = /\^(\S*)\^/
      break;
    case "{":
      regular = /\{(\S*)\{/
      break;
    case "}":
      regular = /\}(\S*)\}/
      break;
    default:
      regular = `/${character}(\S*)${character}/`
      break;
  }
  console.log(str.match(regular))
  return str.match(regular)[1]
}


//正则截取第一个和最后一个相同字符之间的内容
export function GetArrEqual(arr1, arr2){
  let newArr = [];
  for (let i = 0; i < arr2.length; i++) {
    for (let j = 0; j < arr1.length; j++) {
      if(arr1[j] === arr2[i]){
        newArr.push(arr1[j]);
      }
    }
  }
  return newArr;
}



