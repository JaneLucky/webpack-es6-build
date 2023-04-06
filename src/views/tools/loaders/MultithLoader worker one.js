const THREE = require('@/three/three.js')
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js"

//批量加载glb模型，json - 大量相同模型合并
export function MultithLoadGlbJsonList(Scene, rootPath, relativePath, type, option) {
  console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
  //计算边线-并存储，用于测量捕捉
  var worker = new Worker('static/js/load.worker.js');
  worker.postMessage({
    rootPath,
    relativePath, 
    type, 
    option
  });//将复杂计算交给子线程,可以理解为给参数让子线程去操作。
  worker.onmessage = function(e){
    let postMsg = e.data
    switch (postMsg.flag) {
      case 'modelLoad':
        // console.log(e.data)
        // debugger
        if(postMsg.meshList && postMsg.meshList.length){
          let allMeshs = []
          for (let model of postMsg.meshList) {
            let geometry = new THREE.BufferGeometry()
            let verticesP = new Float32Array(model.geometry.attributes.position.array);
            geometry.setAttribute( 'position', new THREE.BufferAttribute( verticesP, model.geometry.attributes.position.itemSize ) );
            let verticesN = new Float32Array(model.geometry.attributes.normal.array);
            geometry.setAttribute( 'normal', new THREE.BufferAttribute( verticesN, model.geometry.attributes.normal.itemSize ) );
            let verticesU = new Float32Array(model.geometry.attributes.uv.array);
            geometry.setAttribute( 'uv', new THREE.BufferAttribute( verticesU, model.geometry.attributes.uv.itemSize ) );
            
            let verticesI = new Float32Array(model.geometry.index.array);
            geometry.setIndex(new THREE.BufferAttribute( verticesI, model.geometry.index.itemSize ))
            geometry.computeBoundingBox() 
            const material = new THREE.MeshStandardMaterial();
            const mesh = new THREE.Mesh( geometry, material );
            setMaterialAttribute(mesh.material, model.material);
            let matrix = new THREE.Matrix4();
            matrix.elements = model.matrix.elements
            mesh.matrix = matrix
            mesh.name = model.name;
            mesh.userData = model.userData;
            allMeshs.push(mesh)
          }
          mergeBufferModel(Scene, allMeshs, postMsg.fullPath);
        }
        break;
      case 'oneModelLoad':
        
        break;
      case 'allModelLoad':
        // 待所有模型处理完成，销毁线程
        window.bimEngine.ViewCube.cameraGoHome();
        worker.terminate()
        break;
    }
  }
  worker.onerror = function (event) {	 
    worker.terminate() 
  }


  
	//合并模型 
	function mergeBufferModel(Scene, meshs, path) {
		let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
		let materialArray = []; // 将你的要赋值的多个material放入到该数组
		let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
		let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
		//对mesh位置进行偏移
		for (var o of meshs) {
			if (o.geometry != null && o.matrix != null) {
				let matrixWorldGeometry = o.geometry.clone().applyMatrix4(o.matrix.clone());
				let MaterialMapList = window.bimEngine.MaterialMapList.filter(item=>item.path === relativePath)
				let materialMap = MaterialMapList.length?MaterialMapList[0].mapList.filter(item=>item.glb === path)[0]:null
				let paramMaterial = materialMap?window.bimEngine.MaterialList.filter(item=>item.Id === materialMap.materialId)[0]:null

				if(materialMap && materialMap.meshId === o.userData.name && paramMaterial && paramMaterial.Param){
					setMaterialAttribute(o.material, paramMaterial.Param)
				}else{
					o.material.side = THREE.DoubleSide;
				}


				geometryArray.push(matrixWorldGeometry);
				materialArray.push(o.material)
				cloneMaterialArray.push(o.material.clone());
				let _min = o.geometry.boundingBox.min.clone().applyMatrix4(o.matrix.clone());
				let _max = o.geometry.boundingBox.max.clone().applyMatrix4(o.matrix.clone());
				let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
					.min(_min.z, _max.z));
				let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
					.max(_min.z, _max.z));
				let center = min.clone().add(max.clone()).multiplyScalar(0.5);
 
				ElementInfoArray.push({
					name: o.userData.name,
					min: min,
					max: max,
					center: center,
					dbid: ElementInfoArray.length,
					IsMerge: o.IsMerge,
					MergeIndex: o.MergeIndex,
					MergeCount: o.MergeCount,
					MergeName: o.MergeName,
					EdgeList:[], 
					basePath:rootPath+relativePath,
					relativePath:relativePath
				});
			}
		}
		//加载模型
		const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray,
			true);
		const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray);
		singleMergeMesh.ElementInfos = ElementInfoArray;
		singleMergeMesh.cloneMaterialArray = cloneMaterialArray;
		singleMergeMesh.name = "rootModel";
		singleMergeMesh.TypeName = "Mesh";
		singleMergeMesh.meshs = meshs;
		singleMergeMesh.url = path;
		singleMergeMesh.basePath = rootPath+relativePath;
		singleMergeMesh.relativePath = relativePath;
		Scene.add(singleMergeMesh);
    console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
  }
}


//设置材质属性
function setMaterialAttribute(material, param){
  material.transparent = param.transparent //是否透明
  material.opacity = param.opacity //透明度
  material.side = param.side //渲染面
  material.color = new THREE.Color(param.color.r,param.color.g,param.color.b) //颜色
  material.emissive =  new THREE.Color(param.emissive.r,param.emissive.g,param.emissive.b) //自发光
  material.roughness = param.roughness //粗糙度 
  material.metalness = param.metalness //金属度 
  material.reflectivity = param.reflectivity //反射率 
  material.clearcoat = param.clearcoat //清漆/透明图层
  material.clearcoatRoughness = param.clearcoatRoughness //清漆粗糙度 
  material.flatShading = param.flatShading //平面着色
  material.vertexColors = param.vertexColors //顶点颜色

  // material.envMap = param.envMap //环境贴图
  // material.map = param.map //纹理贴图
  // material.normalMap = param.normalMap //法线贴图
  // material.roughnessMap = param.roughnessMap //粗糙贴图
  // material.alphaMap = param.alphaMap //混合贴图
}