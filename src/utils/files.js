import JSZip from "jszip";
import axios from 'axios'

export function GetZipFile() {
    axios({
      method: 'get',
      responseType: 'blob',
      url: '/static/glb/semantics.zip'  // 文件所在阿里云的链接地址
    }).then(res => {
      // 把blob格式文件转成FIle类型
      let files = new window.File([res.data], 'semantics', {type: 'zip'})
      // 读取zip压缩文件里面的文件内容
      JSZip.loadAsync(files).then((zip) => {
        for (let key in zip.files) {
          // 用blob的格式读取，方便后面下载到本地
            let base = zip.file(zip.files[key].name).async('blob')
            base.then(res => {
              //下载文件
              // doDownload(res, zip.files[key].name)
              //读取文件
              readTextAs(res, "utf-8", function (error, text) {
                console.log(JSON.parse(text));
              });
            })
          }
      })
    })

  function doDownload (data, name) {
    if (!data) {
      return
    }
    let url = window.URL.createObjectURL(new Blob([data]))
    let link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', name)

    document.body.appendChild(link)
    link.click()
  }

  function readTextAs(arrayBuffer, encoding, callback) {
    var reader = new FileReader();
    var blob = new Blob([arrayBuffer]);
    reader.onload = function (evt) {
      callback(null, evt.target.result);
    };
    reader.onerror = function (evt) {
      callback(evt.error, null);
    };
    reader.readAsText(blob, encoding);
  }


}
