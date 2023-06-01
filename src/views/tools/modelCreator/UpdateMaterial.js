/**
 * 更新材质
 * @param {*} material 材质对象
 * @param {*} param //材质属性
 */
export function UpdateMaterialAttribute(material, param) {
  // console.log(param)
  material.transparent = param.transparent; //是否透明
  material.opacity = param.opacity; //透明度
  material.side = THREE[param.side]; //渲染面
  material.color = new THREE.Color(param.color); //颜色
  material.emissive = new THREE.Color(param.emissive); //自发光
  material.emissiveIntensity = param.emissiveIntensity; //自发光

  material.roughness = param.roughness; //粗糙度
  material.metalness = param.metalness; //金属度
  material.normalScale = new THREE.Vector2(param.normalScale, param.normalScale); //视差

  (material.map = param.map.url
    ? new THREE.TextureLoader().load(param.map.url, texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        //表示在x、y上的重复次数
        texture.repeat.set(param.map.repeat.u, param.map.repeat.v);
        //表示在x、y上的偏移
        texture.offset.set(param.map.offset.u, param.map.offset.v);
      })
    : null), //纹理贴图
    (material.normalMap = param.normalMap.url
      ? new THREE.TextureLoader().load(param.normalMap.url, texture => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          //表示在x、y上的重复次数
          texture.repeat.set(param.normalMap.repeat.u, param.normalMap.repeat.v);
          //表示在x、y上的偏移
          texture.offset.set(param.normalMap.offset.u, param.normalMap.offset.v);
        })
      : null), //法线贴图
    (material.roughnessMap = param.roughnessMap.url
      ? new THREE.TextureLoader().load(param.roughnessMap.url, texture => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          //表示在x、y上的重复次数
          texture.repeat.set(param.roughnessMap.repeat.u, param.roughnessMap.repeat.v);
          //表示在x、y上的偏移
          texture.offset.set(param.roughnessMap.offset.u, param.roughnessMap.offset.v);
        })
      : null); //粗糙贴图
}
