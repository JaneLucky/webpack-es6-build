import JSZip from "jszip";
import axios from 'axios'
//加载json文件
export function LoadJSON(_path, callback) {  
	var test;
	if (window.XMLHttpRequest) {
		test = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		test = new window.ActiveXObject();
	} else {
		alert("请升级至最新版本的浏览器");
	}
	if (test != null) {
		// test.open("GET", "info.json", true);
		let url = _path + '?timestamp=' + new Date().getTime()
		test.open("GET", url, true);
		test.send(null)
		test.onreadystatechange = function() {
				if (test.readyState == 4 && test.status == 200) {
					if (test.responseText.includes('</html>', 0) && test.responseText.includes('</body>', 0) && test
						.responseText.includes('</head>', 0)) {
						callback(null);
					} else {
						callback(test.responseText);
					}
				}
			},
			test.onloadend = function() { 
				if (test.readyState == 4 && test.status == 404 && test.status == 502) {
					callback(null);
				}
			}
	}
}


export function LoadZipJson(_path, callback) {
	axios({
		method: 'get',
		responseType: 'blob',
		url: _path+'?timestamp=' + new Date().getTime() // 文件所在阿里云的链接地址
	}).then(res => {
		// 把blob格式文件转成FIle类型
		let files = new window.File([res.data], 'semantics', {
			type: 'zip'
		})
		// 读取zip压缩文件里面的文件内容
		JSZip.loadAsync(files).then((zip) => {
			for (let key in zip.files) {
				// 用blob的格式读取，方便后面下载到本地
				let base = zip.file(zip.files[key].name).async('blob')
				base.then(res => {
					//下载文件
					// doDownload(res, zip.files[key].name)
					//读取文件
					readTextAs(res, "utf-8", function(error, text) {
						callback(text);
					});
				})
			}
		})
	})
	//读取内容
	function readTextAs(arrayBuffer, encoding, callback) {
		var reader = new FileReader();
		var blob = new Blob([arrayBuffer]);
		reader.onload = function(evt) {
			callback(null, evt.target.result);
		};
		reader.onerror = function(evt) {
			callback(evt.error, null);
		};
		reader.readAsText(blob, encoding);
	}
}
