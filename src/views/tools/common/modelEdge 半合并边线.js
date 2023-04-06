export function GetModelEdges() {
  let worker
  let modelsList
  let size = 500
  let count = 0
  let rootmodels = window.bimEngine.scene.children;
  let rootmodelsAll = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
  window.bimEngine.AllEdgeList = []
  let EdgeGroup = {
    Indexs:[],
    EdgeList:[],
    Created: false
  }
  console.log(new Date().getMinutes() + ":"+ new Date().getSeconds(), "边线计算开始")
  if(rootmodels && rootmodels.length){
    let material = new THREE.LineBasicMaterial({
      color: '#000000',
    })
    let clippingPlanes = null
    for (var rootmodel of rootmodelsAll) {
      if(rootmodel.material instanceof Array && rootmodel.material.length){
        clippingPlanes  = rootmodel.material[0].clippingPlanes
        break
      }else{
        clippingPlanes  = rootmodel.material.clippingPlanes
        break
      }
    }
    // return
    //计算边线-并存储，用于测量捕捉
    // worker = new Worker('static/js/edge.worker.js');
    getModelList()

    function getModelList() {
      modelsList = []
      let i = count
      if(rootmodelsAll[i]){
        if(rootmodelsAll[i].TypeName == "InstancedMesh"){
          for (let j = 0; j < rootmodelsAll[i].ElementInfos.length; j++) {
            let ele = {
              TypeName: rootmodelsAll[i].TypeName,
              indexes: [rootmodelsAll[i].index, j],
              geometry: Array.from(rootmodelsAll[i].meshs.geometry.attributes.position.array),
              indexA: Array.from(rootmodelsAll[i].meshs.geometry.index.array),
              matrix: Array.from(rootmodelsAll[i].ElementInfos[j].matrix.elements)
            }
            modelsList.push(ele)
          }
        }else if(rootmodelsAll[i].TypeName == "Mesh"){
          for (let j = 0; j < rootmodelsAll[i].ElementInfos.length; j++) {
            let ele
            if(rootmodelsAll[i].meshs[j].geometry.index){
              ele = {
                TypeName: rootmodelsAll[i].TypeName,
                indexes: [rootmodelsAll[i].index, j],
                geometry: Array.from(rootmodelsAll[i].meshs[j].geometry.attributes.position.array),
                indexA: rootmodelsAll[i].meshs[j].geometry.index?Array.from(rootmodelsAll[i].meshs[j].geometry.index.array):null,
                matrix: Array.from(rootmodelsAll[i].meshs[j].matrix.elements)
              }
            }else{
              ele = {
                TypeName: rootmodelsAll[i].TypeName,
                indexes: [rootmodelsAll[i].index, j],
                geometry: Array.from(rootmodelsAll[i].meshs[j].geometry.attributes.position.array),
                position: {x:rootmodelsAll[i].meshs[j].position.x, y:rootmodelsAll[i].meshs[j].position.y, z:rootmodelsAll[i].meshs[j].position.z},
                rotation: {x:rootmodelsAll[i].meshs[j].rotation._x, y:rootmodelsAll[i].meshs[j].rotation._y, z:rootmodelsAll[i].meshs[j].rotation._z, order:rootmodelsAll[i].meshs[j].rotation._order},
                matrix: Array.from(rootmodelsAll[i].meshs[j].matrix.elements)
              }
            }
            modelsList.push(ele)
          }
        } else if (rootmodelsAll[i].TypeName == "InstancedMesh-Pipe") {
          for (let j = 0; j < rootmodelsAll[i].ElementInfos.length; j++) {
            let ele = {
              TypeName: rootmodelsAll[i].TypeName,
              indexes:[rootmodelsAll[i].index, j],
              geometry: Array.from(rootmodelsAll[i].geometry.attributes.position.array),
              matrix: Array.from(rootmodelsAll[i].instanceMatrix.array.slice(j * 16, (j+1) * 16))
            }
            modelsList.push(ele)
          }
        }
        if(modelsList && modelsList.length){
          worker && worker.terminate()
          worker = new Worker('static/js/edge.worker.js');
          worker.postMessage(modelsList);
          worker.onmessage = function(e) {
            let backList = e.data
            // console.log(backList)
            let positions = []
            let ElementInfos = {
              clonePositions:[],
              children:[]
            }
            for (let i = 0; i < backList.length; i++) {
              rootmodels[backList[i].indexes[0]].ElementInfos[backList[i].indexes[1]].EdgeList = backList[i].EdgeList
              let Infos = {
                index: backList[i].indexes[1],
                startIndex : positions.length,
                endIndex : positions.length + backList[i].EdgeList.length -1,
                EdgeList : backList[i].EdgeList,
              }
              ElementInfos.children.push(Infos)
              Array.prototype.splice.apply(positions, [positions.length, backList[i].EdgeList.length].concat(backList[i].EdgeList));
            }
            rootmodels[backList[0].indexes[0]].EdgeLists = positions
            getEdgeGroupList(backList[0].indexes[0], positions)
            ElementInfos.clonePositions = Array.from(positions)
            // backList && backList.length && createLineSegments(backList[0].indexes[0], positions, ElementInfos)
            worker.terminate()
            worker = null
            count = count+1
            getModelList()
            if(rootmodelsAll.length === count){
              console.log(new Date().getMinutes() + ":"+ new Date().getSeconds(), "边线计算完成")
              if(EdgeGroup.Indexs.length){
                window.bimEngine.AllEdgeList.push(EdgeGroup)
              }
              let count = 0
              let count1 = 0
              let count2 = 0
              for(let EdgeItem of window.bimEngine.AllEdgeList){
                count += EdgeItem.Indexs.length
                count1 += EdgeItem.EdgeList.length
              }
              console.log(count)
              console.log(count1)
              
              let rootmodels = window.bimEngine.scene.children.filter(x => x.name == "rootModel");
              for(let rootmode of rootmodels){
                count2 += rootmode.EdgeLists.length
              }
              console.log(count2)
              console.log(new Date().getMinutes() + ":"+ new Date().getSeconds(), "边线计算完成")
            }
          }
          worker.onerror = function(event) {
            worker.terminate()
            worker = null
          }
        }
      }
    }

    function getEdgeGroupList(index, positions) {
			if(positions.length >= 200000){
				window.bimEngine.AllEdgeList.push({
					Indexs: [index],
					EdgeList: positions,
          Created: false
				})
			}else{
				if(EdgeGroup.EdgeList.length + positions.length <= 200000){
					EdgeGroup.Indexs.push(index)
					Array.prototype.splice.apply(EdgeGroup.EdgeList, [EdgeGroup.EdgeList.length, positions.length].concat(positions))
				}else{
					window.bimEngine.AllEdgeList.push({
            Indexs: Array.from(EdgeGroup.Indexs),
            EdgeList: Array.from(EdgeGroup.EdgeList),
            Created: false
          })
					EdgeGroup = {
						Indexs:[],
						EdgeList:[],
            Created: false
					}
					let flagInsert = false
					for(let EdgeItem of window.bimEngine.AllEdgeList){
						if(EdgeItem.EdgeList.length + positions.length <= 200000){
							EdgeItem.Indexs.push(index)
							Array.prototype.splice.apply(EdgeItem.EdgeList, [EdgeItem.EdgeList.length, positions.length].concat(positions))
							flagInsert = true
							break
						}
					}
					if(!flagInsert){
						EdgeGroup.Indexs.push(index)
						Array.prototype.splice.apply(EdgeGroup.EdgeList, [EdgeGroup.EdgeList.length, positions.length].concat(positions))
					}
				}
			}
    }

    function createLineSegments(index, positions, ElementInfos) {
			let geometry = new THREE.BufferGeometry()
			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute(positions, 3)
			)
			const line = new THREE.LineSegments(
				geometry,
				material
			)
			line.indexO = index;
			line.name = "ModelEdges";
			line.TypeName = "ModelEdges";
			line.ElementInfos = ElementInfos
			line.material.clippingPlanes = clippingPlanes
      line.visible = false
			window.bimEngine.scene.add(line)
    }

  }
  
}