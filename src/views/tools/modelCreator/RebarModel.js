const THREE = require("@/three/three.js");
import { LoadZipJson } from "@/utils/LoadJSON.js";
import { UpdateMaterialAttribute } from "@/views/tools/modelCreator/UpdateMaterial.js";
//绘制管道
export function CreatorRebarModel(_Engine, scene, relativePath, url, infos) {
  let path = url + "/sysmodelList.zip";
  let rebarLoadNum = 0;
  LoadZipJson(path, res => {
    let sysmodelList = JSON.parse(res);
    console.log("管道模型", JSON.parse(res));
    let lineRebarsList = sysmodelList.circularMeps; //直钢筋
    let circleRebarsList = [
      {
        color: "255,0,0", //材质颜色
        materialImage: "", //材质map贴图
        pipeDdiameter: 6, //钢管直径
        diameter: 50, //环面直径
        arc: 180, //环面圆心角
        angle: { Z: 10, Y: 0, X: 0 }, //旋转角度
        position: { Z: 10.334645669291339, Y: 114.99218001475595, X: 180.92822762403344 }, //环面圆心的位置
        id: "2011371",
        name: "PD-冷凝（LN）[2011375][60182dff-c924-4490-976d-2e5b8e7389ad-001eb0e1]",
        systemName: "6mm钢筋",
        type: "钢筋"
      },
      {
        color: "0,255,0", //材质颜色
        materialImage: "", //材质map贴图
        pipeDdiameter: 3, //钢管直径
        diameter: 100, //环面直径
        arc: 270, //环面圆心角
        angle: { Z: 10, Y: 10, X: 10 }, //旋转角度
        position: { Z: 20.334645669291339, Y: 124.99218001475595, X: 200.92822762403344 }, //环面圆心的位置
        id: "2011372",
        name: "PD-冷凝（LN）[2011375][60182dff-c924-4490-976d-2e5b8e7389ad-001eb0e2]",
        systemName: "3mm钢筋",
        type: "钢筋"
      },
      {
        color: "255,0,0", //材质颜色
        materialImage: "", //材质map贴图
        pipeDdiameter: 8, //钢管直径
        diameter: 20, //环面直径
        arc: 180, //环面圆心角
        angle: { Z: 10, Y: 0, X: 0 }, //旋转角度
        position: { Z: 30.334645669291339, Y: 134.99218001475595, X: 310.92822762403344 }, //环面圆心的位置
        id: "2011373",
        name: "PD-冷凝（LN）[2011375][60182dff-c924-4490-976d-2e5b8e7389ad-001eb0e3]",
        systemName: "8mm钢筋",
        type: "钢筋"
      }
    ]; //圆钢筋

    //绘制圆钢筋
    if (circleRebarsList && circleRebarsList.length) {
      let MeshGroup = GroupByMaterial(circleRebarsList);
      for (let group of MeshGroup) {
        let AllMesh = CreatorCircleRebarMesh(group);
        mergeBufferModel(scene, relativePath, url, path, AllMesh);
      }
    } else {
      setLoaded();
    }

    return;
    //绘制直钢筋
    if (lineRebarsList && lineRebarsList.length) {
      let meshParamList = [];
      for (let Mep of lineRebarsList) {
        Mep.color = new THREE.Color(`rgb(${Mep.color})`);
        (Mep.position = {
          x: Mep.startPoint.X * 0.3048,
          y: Mep.startPoint.Z * 0.3048,
          z: -Mep.startPoint.Y * 0.3048
        }),
          (Mep.rotation = {
            x: 0,
            y: 0,
            z: 0
          });
        meshParamList.push(Mep);
      }
      InstanceModel("Circle", scene, meshParamList, relativePath, url, path);
    } else {
      setLoaded();
    }
  });

  function mergeBufferModel(scene, relativePath, basePath, path, meshs, material) {
    let geometryArray = [];
    let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
    for (var i = 0; i < meshs.length; i++) {
      let o = meshs[i];
      //o.geometry.matrix是假的，需要自己创建4维矩阵
      o.geometry.computeBoundingBox();
      var matrix = new THREE.Matrix4();
      matrix = matrix.makeRotationFromEuler(o.rotation);
      matrix.elements[12] = o.position.x;
      matrix.elements[13] = o.position.y;
      matrix.elements[14] = o.position.z;
      let matrixWorldGeometry = o.geometry.clone().applyMatrix4(matrix.clone());

      geometryArray.push(matrixWorldGeometry);
      //如果我们直接获取boundingBox，得到的结果将会是undefined，需要先执行计算。
      let _min = matrixWorldGeometry.boundingBox.min.clone();
      let _max = matrixWorldGeometry.boundingBox.max.clone();
      let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math.min(_min.z, _max.z));
      let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math.max(_min.z, _max.z));
      let center = min.clone().add(max.clone()).multiplyScalar(0.5);
      ElementInfoArray.push({
        name: o.name,
        min: min,
        max: max,
        center: center,
        dbid: i,
        basePath: basePath,
        materialName: o.material.name
      });
    }
    const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray, true);
    const singleMergeMesh = new THREE.Mesh(mergedGeometries, meshs[0].material);
    singleMergeMesh.ElementInfos = ElementInfoArray;
    singleMergeMesh.cloneMaterialArray = meshs[0].material.clone();
    singleMergeMesh.relativePath = relativePath;
    singleMergeMesh.name = "rootModel";
    singleMergeMesh.TypeName = "Mesh";
    singleMergeMesh.meshs = meshs;
    singleMergeMesh.url = path;
    singleMergeMesh.basePath = basePath;
    scene.add(singleMergeMesh);
  }

  // 模型按照材质分组
  function GroupByMaterial(eles) {
    let MaterialGroup = [];
    for (let ele of eles) {
      let index = MaterialGroup.findIndex(x => x.color == ele.color && x.materialImage === ele.materialImage);
      if (index === -1) {
        //不存在
        let groupM = {
          color: ele.color,
          materialImage: ele.materialImage,
          children: [ele]
        };
        MaterialGroup.push(groupM);
      } else {
        //存在
        MaterialGroup[index].children.push(ele);
      }
    }
    return MaterialGroup;
  }

  //创建柱子
  function CreatorCircleRebarMesh(eles) {
    let meshs = [];
    var material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(`rgb(${eles.color})`),
      side: THREE.DoubleSide //两面可见
    }); //材质对象
    material.map = eles.materialImage
      ? new THREE.TextureLoader().load(url + "/" + eles.materialImage, texture => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
        })
      : null; //纹理贴图
    for (let eleItem of eles.children) {
      //TorusGeometry(环面半径，管道半径，管道横截面的分段数【圆的程度，越大越圆】，管道的分段数【圆的程度，越大越圆】， 圆环的圆心角 )
      const geometry = new THREE.TorusGeometry(eleItem.diameter, eleItem.pipeDdiameter, 16, 100, (eleItem.arc / 180) * Math.PI);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "rootModel";
      mesh.TypeName = "Mesh";

      mesh.position.set(eleItem.position.X, eleItem.position.Y, eleItem.position.Z);
      mesh.rotation._order = "YXZ";
      mesh.rotation.set(eleItem.angle.X, eleItem.angle.Y, eleItem.angle.Z);

      mesh.name = eleItem.name;
      meshs.push(mesh);
    }
    return meshs;
  }

  //InstanceMesh合并模型
  function InstanceModel(type, scene, meshs, relativePath, url, path) {
    let needSetColor = true;
    let instancedMesh, mesh;
    let Param = {
      width: 1,
      height: 1,
      length: 1,
      diameter: 1,
      color: new THREE.Color(),
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    };
    switch (type) {
      case "Circle":
        mesh = DrawInstanceRebars("Circle", Param, scene);
        break;
    }

    if (mesh) {
      let MaterialMapList = _Engine.MaterialMapList.filter(item => item.path === relativePath);
      let materialMap = MaterialMapList.length ? MaterialMapList[0].mapList.filter(item => item.glb === path + "/" + type)[0] : null;
      if (materialMap && materialMap.Param) {
        for (let item of meshs) {
          if (materialMap && materialMap.meshId === item.name) {
            UpdateMaterialAttribute(mesh.material, materialMap.Param);
            mesh.material.materialMap = {
              Id: materialMap.materialId,
              Name: materialMap.Param.name,
              Img: materialMap.Img,
              Param: materialMap.Param
            };
            needSetColor = false;
          }
        }
      }
      instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, meshs.length);
    }

    let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
    window.color = new THREE.Color();
    for (var j = 0; j < meshs.length; j++) {
      let param = meshs[j];

      let start = new THREE.Vector3(param.startPoint.X, 0, -param.startPoint.Y);
      let end = new THREE.Vector3(param.endPoint.X, 0, -param.endPoint.Y);

      let start_ = new THREE.Vector3(param.startPoint.X, param.startPoint.Z, -param.startPoint.Y);
      let end_ = new THREE.Vector3(param.endPoint.X, param.endPoint.Z, -param.endPoint.Y);

      let angle_x = 0;
      let angle_y = 0;
      let angle_z = 0;
      //end.clone().sub(start.clone())是起点到终点的投影向量
      if (Math.abs(end.clone().sub(start.clone()).z) < 0.01 && Math.abs(end.clone().sub(start.clone()).x) < 0.01) {
        //立管
        let dir = param.startPoint.Z > param.endPoint.Z ? 1 : -1; //判断立管是向上还是向下的
        angle_x = dir * Math.PI * 0.5; //旋转90度，让管子竖起来
        if (param.base_x != null) {
          var basex = new THREE.Vector3(param.base_x.X, 0, -param.base_x.Y);
          let dir_ = basex.clone().cross(new THREE.Vector3(0, 0, 1)).y <= 0 ? 1 : -1;

          angle_y = dir_ * basex.angleTo(new THREE.Vector3(0, 0, 1)) + Math.PI * 0.5;
        }
      } else {
        //普通管道
        let dir = end.clone().sub(start.clone()).cross(new THREE.Vector3(0, 0, 1)).y > 0 ? -1 : 1;
        angle_y = dir * end.clone().sub(start.clone()).angleTo(new THREE.Vector3(0, 0, 1));
        //倾斜管道
        let dir_ = param.startPoint.Z > param.endPoint.Z ? 1 : -1;
        angle_x = dir_ * end.clone().sub(start.clone()).angleTo(end_.clone().sub(start_.clone()));
      }

      let matrix = new THREE.Matrix4();
      const euler = new THREE.Euler(angle_x, angle_y, angle_z, "YXZ");

      // 创建旋转矩阵
      let T1 = matrix.clone().makeRotationFromEuler(euler);
      // 创建缩放矩阵
      let width, height;
      if (type === "Circle") {
        width = param.diameter;
        height = param.diameter;
      } else {
        width = param.width;
        height = param.height;
      }
      let T2 = matrix.clone().makeScale(width, height, param.length);
      // 旋转和缩放合并
      matrix.multiplyMatrices(T1, T2);
      //设置矩阵位置
      matrix.setPosition(param.position.x, param.position.y, param.position.z);

      //更新矩阵
      instancedMesh.setMatrixAt(j, matrix.clone());
      //更新颜色
      needSetColor && instancedMesh.setColorAt(j, param.color);

      instancedMesh.geometry.computeBoundingBox();
      let _min = instancedMesh.geometry.boundingBox.min.clone().applyMatrix4(matrix.clone());
      let _max = instancedMesh.geometry.boundingBox.max.clone().applyMatrix4(matrix.clone());
      let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math.min(_min.z, _max.z));
      let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math.max(_min.z, _max.z));
      let center = min.clone().add(max.clone()).multiplyScalar(0.5);

      ElementInfoArray.push({
        name: param.name,
        min: min,
        max: max,
        center: center,
        dbid: j,
        url: path + "/" + type,
        matrix: matrix,
        basePath: url,
        relativePath: relativePath
      });
    }

    instancedMesh.ElementInfos = ElementInfoArray;
    instancedMesh.name = "rootModel";
    instancedMesh.TypeName = "InstancedMesh-Rebar";
    instancedMesh.MeshId = null;
    instancedMesh.cloneMaterialArray = instancedMesh.material.clone();
    instancedMesh.basePath = url;
    instancedMesh.relativePath = relativePath;
    instancedMesh.meshs = instancedMesh;
    instancedMesh.url = path + "/" + type;
    // instancedMesh.cloneInstanceColor = instancedMesh.instanceColor ? Array.from(instancedMesh.instanceColor.array) : [];
    instancedMesh.cloneInstanceMatrix = Array.from(instancedMesh.instanceMatrix.array);
    scene.add(instancedMesh);

    setLoaded();
  }

  //绘制直型钢筋
  function DrawInstanceRebars(type, param, scene) {
    let Shape = new THREE.Shape();
    param.width = param.width * 0.3048;
    param.height = param.height * 0.3048;
    param.diameter = param.diameter * 0.3048;
    switch (type) {
      case "Circle":
        Shape.moveTo(0, 0);
        Shape.absarc(0, 0, param.diameter * 0.5, 0, Math.PI * 2, false);

        break;
    }

    const extrudeSettings = {
      depth: param.length * 0.3048, //拉伸长度
      bevelEnabled: false
    };
    return addShape(Shape, extrudeSettings, param.color, param.position, param.rotation);

    function addShape(shape, extrudeSettings, color, position, rotation) {
      let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      let mat = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide
        // depthTest:false
      });

      let mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(position.x, position.y, position.z);
      mesh.rotation._order = "YXZ";
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);

      return mesh;
    }
  }

  function setLoaded() {
    rebarLoadNum = rebarLoadNum + 1;
    if (rebarLoadNum === 2) {
      _Engine.doneModels.push(path);
    }
  }
}
