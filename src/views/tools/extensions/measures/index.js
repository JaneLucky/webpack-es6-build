/**
 * 获得/创建指定className的dom节点
 * @param {*} _container 父元素
 * @param {*} domName className
 * @param {*} create 不存在是否创建， 默认为true
 * @returns 
 */
export function getRootDom(_container, domName, create=true) {
  var root = _container.getElementsByClassName(domName)[0];
  if (root == null && create) {
    root = document.createElement("div");
    root.className = domName;
    _container.appendChild(root);
  }
  return root
}

/**
 * 生成随机字符串id
 * @returns 
 */
export function guidId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
