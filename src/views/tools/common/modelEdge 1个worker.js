export function GetModelEdges() {
  let worker
  let modelsList
  let size = 2000
  let count = 0
  let rootmodels = window.bimEngine.scene.children;
  console.log(rootmodels)
  if(rootmodels && rootmodels.length){
    modelsList = []
    for (let i = 0; i < rootmodels.length; i++) {
      if(rootmodels[i].TypeName == "InstancedMesh"){
        for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
          let ele = {
            TypeName: rootmodels[i].TypeName,
            indexes: [rootmodels[i].index, j],
            geometry: [...rootmodels[i].meshs.geometry.attributes.position.array],
            indexA: [...rootmodels[i].meshs.geometry.index.array],
            matrix: [...rootmodels[i].ElementInfos[j].matrix.elements]
          }
          modelsList.push(ele)
        }
      }else if(rootmodels[i].TypeName == "Mesh"){
        for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
          let ele = {
            TypeName: rootmodels[i].TypeName,
            indexes: [rootmodels[i].index, j],
            geometry: [...rootmodels[i].meshs[j].geometry.attributes.position.array],
            indexA: [...rootmodels[i].meshs[j].geometry.index.array],
            matrix: [...rootmodels[i].meshs[j].matrix.elements]
          }
          modelsList.push(ele)
        }
      } else if (rootmodels[i].TypeName == "InstancedMesh-Pipe") {
        for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
          let ele = {
            TypeName: rootmodels[i].TypeName,
            indexes:[rootmodels[i].index, j],
            geometry: [...rootmodels[i].geometry.attributes.position.array],
            matrix: [...rootmodels[i].instanceMatrix.array.slice(j * 16, (j+1) * 16)]
          }
          modelsList.push(ele)
        }
      }
    }
    console.log(modelsList)
    console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())

    // return
    //计算边线-并存储，用于测量捕捉
    worker = new Worker('static/js/edge.worker.js');
    getModelList(worker)
    worker.onmessage = function(e) {
      let backList = e.data
      console.log(backList)
      for (let i = 0; i < backList.length; i++) {
        rootmodels[backList[i].indexes[0]].ElementInfos[backList[i].indexes[1]].EdgeList = backList[i].EdgeList
      }
      console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
      count = count+1
      getModelList(worker)
    }
    worker.onerror = function(event) {
      worker.terminate()
    }

    function getModelList(worker) {
      let start = count*size
      let end = (count+1)*size > modelsList.length ? modelsList.length : (count+1)*size
      let sliceList = modelsList.slice(start, end)
      if(sliceList && sliceList.length){
        worker.postMessage(sliceList);
      }else{
        worker.terminate()
      }
    }

  }
  
}