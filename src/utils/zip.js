import pako from "pako"
import {Base64} from "js-base64"

// Pako压缩
export function PakoZip(data){
  if (!data) return data
  // 判断数据是否需要转为JSON
  const dataJson = typeof data !== 'string' && typeof data !== 'number' ? JSON.stringify(data) : data

  // 使用处理字符编码，兼容中文
  const str = Base64.encode(dataJson)
  let binaryString = pako.gzip(str);
  let arr = Array.from(binaryString);
  let s = "";
  arr.forEach((item, index) => {
    s += String.fromCharCode(item)
  })
  return btoa(s)
}

// Pako解压
export function PakoUnZip(b64Data){
  let strData = atob(b64Data);
  let charData = strData.split('').map(function (x) {
    return x.charCodeAt(0);
  });
  let binData = new Uint8Array(charData);
  let data = pako.ungzip(binData);

  // ↓切片处理数据，防止内存溢出报错↓
  let str = '';
  const chunk = 8 * 1024
  let i;
  for (i = 0; i < data.length / chunk; i++) {
    str += String.fromCharCode.apply(null, data.slice(i * chunk, (i + 1) * chunk));
  }
  str += String.fromCharCode.apply(null, data.slice(i * chunk));
  // ↑切片处理数据，防止内存溢出报错↑
        
  const unzipStr = Base64.decode(str);
  let result = ''

  // 对象或数组进行JSON转换
  try {
    result = JSON.parse(unzipStr)
  } catch (error) {
    if (/Unexpected token o in JSON at position 0/.test(error)) {
      // 如果没有转换成功，代表值为基本数据，直接赋值
      result = unzipStr
     }
   }
   console.log(new Date().getMinutes() + ":"+ new Date().getSeconds(), "边线计算开始")
   return result
}