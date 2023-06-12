// 验证图片链接是否有效
export function ValidateImage(url) {
  var xmlHttp;
  if (window.ActiveXObject) {
    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
  } else if (window.XMLHttpRequest) {
    xmlHttp = new XMLHttpRequest();
  }
  xmlHttp.open("Get", url, false);
  xmlHttp.send();
  if (xmlHttp.status == 404) return false;
  else return true;
}

// 获取2个数组不同的部分
export function getArrDifference(arr1, arr2) {
  return arr1.concat(arr2).filter(function (v, i, arr) {
    return arr.indexOf(v) === arr.lastIndexOf(v);
  });
}

// 获取2个数组相同的部分
export function getArrSame(arr1, arr2) {
  return arr1.filter(item => {
    return arr2.some(i => item == i);
  });
}

// 取arr1不在arr2里面的元素
export function getArrNotIn(arr1, arr2) {
  return [...new Set(arr1)].filter(item => !arr2.includes(item));
}

// 数组去重
export function ListDuplicate(list, key) {
  // 根据key字段重复去重
  let backList,
    obj = {};
  backList = list.reduce(function (item, next) {
    obj[next[key]] ? "" : (obj[next[key]] = true && item.push(next));
    return item;
  }, []);
  return backList;
}

//正则截取第一个和最后一个相同字符之间的内容
export function MatchCenterStringByCharacter(str, character) {
  let regular;
  switch (character) {
    case "$":
      regular = /\$(\S*)\$/;
      break;
    case "(":
      regular = /\((\S*)\(/;
      break;
    case ")":
      regular = /\)(\S*)\)/;
      break;
    case "*":
      regular = /\*(\S*)\*/;
      break;
    case ".":
      regular = /\.(\S*)\./;
      break;
    case "[":
      regular = /\[(\S*)\[/;
      break;
    case "]":
      regular = /\](\S*)\]/;
      break;
    case "?":
      regular = /\?(\S*)\?/;
      break;
    case "\\":
      regular = /\\(\S*)\\/;
      break;
    case "/":
      regular = /\/(\S*)\//;
      break;
    case "^":
      regular = /\^(\S*)\^/;
      break;
    case "{":
      regular = /\{(\S*)\{/;
      break;
    case "}":
      regular = /\}(\S*)\}/;
      break;
    default:
      regular = `/${character}(\S*)${character}/`;
      break;
  }
  console.log(str.match(regular));
  return str.match(regular)[1];
}

//正则截取第一个和最后一个相同字符之间的内容
export function GetArrEqual(arr1, arr2) {
  let newArr = [];
  for (let i = 0; i < arr2.length; i++) {
    for (let j = 0; j < arr1.length; j++) {
      if (arr1[j] === arr2[i]) {
        newArr.push(arr1[j]);
      }
    }
  }
  return newArr;
}

/**
 * 字符串分割
 * @param {*} str 被分割的字符串
 * @param {*} len 切割长度
 */
export function CutString(str, len) {
  let strArr = [];
  for (let i = 0; i < str.length; i += len) strArr.push(str.slice(i, i + len));
  return strArr;
}

export function StringSort(initList) {
  if (!initList || initList.length === 0) {
    return [];
  }
  initList.forEach(item => {
    let uidList = item.name.split("");
    item.loadIndex = "";
    uidList.map(i => {
      //通过正则进行数据分类
      if (/[a-zA-Z]/.test(i)) {
        item.loadIndex += i.charCodeAt(0);
      } else if (/[\d]/.test(i)) {
        item.loadIndex += i;
      } else {
        item.loadIndex += 0;
      }
    });
    item.loadIndex = Number(item.loadIndex);
    return item;
  });
  //按照要求的方式进行数据排序重组
  const newList = initList.sort((a, b) => a.loadIndex - b.loadIndex);
  return newList;
}
