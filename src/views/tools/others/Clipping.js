const THREE = require("@/three/three.js");
import "@/three/controls/TransformControls.js";
import { GetBoundingBox } from "@/views/tools/common/index.js";
//模型单面剖切
export function ClippingSingleSide(_Engine, scene, status, type, Oconstant) {
  let plane, control;
  let planes = [
    {
      type: "X轴",
      vector: new THREE.Vector3(-1, 0, 0),
      color: 0xff0000,
      show: "showX"
    },
    {
      type: "Y轴",
      vector: new THREE.Vector3(0, -1, 0),
      color: 0x00ff00,
      show: "showY"
    },
    {
      type: "Z轴",
      vector: new THREE.Vector3(0, 0, -1),
      color: 0x0000ff,
      show: "showZ"
    }
  ];
  control = _Engine.scene.children.filter(item => item.name === "TransformControlsClipping")[0]; //获得控制器

  clearClippingMesh(); //删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建

  status && init(); // 根据状态初始化
  _Engine.UpdateRender();
  function init() {
    let BoundingBox = getClippingMeshSizeAndPosition(Oconstant); //获得辅助对象的宽高和位置
    plane = new THREE.Plane(BoundingBox.plane.vector, 0); //创建二维切割平面
    plane.constant = BoundingBox.constant; //设置初始切割距离
    //创建切割示意面和控制器，并绑定
    const geometry = new THREE.PlaneGeometry(BoundingBox.width, BoundingBox.height);
    const material = new THREE.MeshBasicMaterial({
      color: "#252525",
      opacity: 0.2,
      wireframeLinewidth: 10,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true // 设置为true，opacity才会生效
    }); // wireframe: true,
    const mesh = new THREE.Mesh(geometry, material); //辅助对象,用于示意剖切面
    mesh.visible = false;
    let GroupBox = new THREE.Group();
    GroupBox.add(mesh);
    GroupBox.name = "ClippingMesh";
    GroupBox.position.set(BoundingBox.position.x, BoundingBox.position.y, BoundingBox.position.z);
    BoundingBox.direction && (GroupBox.rotation[BoundingBox.direction] = Math.PI / 2);
    scene.add(GroupBox);
    let bufferGeometry = new THREE.BufferGeometry();
    let positions = [];
    var edges = new THREE.EdgesGeometry(geometry, 1); //大于89度才添加线条
    var ps = edges.attributes.position.array;
    for (var i = 0; i < ps.length; i = i + 3) {
      let point = new THREE.Vector3(ps[i], ps[i + 1], ps[i + 2]);
      let newpoint = point.clone();
      positions.push(newpoint.x);
      positions.push(newpoint.y);
      positions.push(newpoint.z);
    }
    bufferGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const bufferline = new THREE.LineSegments(
      bufferGeometry,
      new THREE.LineBasicMaterial({
        color: "#E3B951"
      })
    );
    GroupBox.add(bufferline);
    control.attach(GroupBox); //控制器和切割示意面绑定

    control[BoundingBox.plane.show] = true; //显示控制器对应需要显示的坐标轴
    control.addEventListener("change", render); //控制器监听更新视图
    control.addEventListener("dragging-changed", function (event) {
      //鼠标拖动开始和结束，开始禁止控制器放缩/旋转视图，结束放开控制器的控制
      scene.controls.enabled = !event.value;
      if (scene.controls.enabled) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
      }
      _Engine.UpdateRender();
    });
    setModelClippingPlanes(plane); //设置所有构建的clippingPlanes
  }
  //实时修改plane.constant，以实现模型剖切
  function render(res) {
    switch (type) {
      case "X轴":
        plane.constant = res.target.worldPosition.x - 0;
        break;
      case "Y轴":
        plane.constant = res.target.worldPosition.y - 0;
        break;
      case "Z轴":
        plane.constant = res.target.worldPosition.z - 0;
        break;
    }
    _Engine.Clipping.Plane = [plane];
    _Engine.UpdateRender();
  }

  //获得辅助对象的宽高和位置
  function getClippingMeshSizeAndPosition(Oconstant = null) {
    let BoundingBox = _Engine.ViewCube.getBoundingBox(_Engine);
    let width = 0,
      height = 0,
      direction = null,
      position,
      plane,
      constant;
    position = BoundingBox.center;
    switch (type) {
      case "X轴":
        direction = "y";
        width = BoundingBox.max.z - BoundingBox.min.z;
        height = BoundingBox.max.y - BoundingBox.min.y;
        position.x = Oconstant ? Oconstant : BoundingBox.max.x;
        constant = Oconstant ? Oconstant : BoundingBox.max.x;
        plane = planes[0];
        break;
      case "Y轴":
        direction = "x";
        width = BoundingBox.max.x - BoundingBox.min.x;
        height = BoundingBox.max.z - BoundingBox.min.z;
        position.y = Oconstant ? Oconstant : BoundingBox.max.y;
        constant = Oconstant ? Oconstant : BoundingBox.max.y;
        plane = planes[1];
        break;
      case "Z轴":
        width = BoundingBox.max.x - BoundingBox.min.x;
        height = BoundingBox.max.y - BoundingBox.min.y;
        position.z = Oconstant ? Oconstant : BoundingBox.max.z;
        constant = Oconstant ? Oconstant : BoundingBox.max.z;
        plane = planes[2];
        break;
    }
    return {
      position,
      width,
      height,
      direction,
      plane,
      constant
    };
  }

  //设置所有构建的clippingPlanes
  function setModelClippingPlanes(plane) {
    let models = _Engine.scene.children;
    let planes = plane ? [plane] : null;
    models.forEach(item => {
      if (item.name === "rootModel") {
        if (item.material instanceof Array) {
          item.material.forEach(ii => {
            ii.clippingPlanes = planes;
          });
          item.cloneMaterialArray.forEach(ii => {
            ii.clippingPlanes = planes;
          });
        } else {
          item.material.clippingPlanes = planes;
          item.cloneMaterialArray.clippingPlanes = planes;
        }
      }
    });
    _Engine.Clipping.Plane = planes;
    setHighlightModelClippingPlanes(_Engine, planes);
    setModelEdgesClippingPlanes(_Engine, planes);
    setEngineRayClippingPlanes(_Engine, planes);
  }

  //删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建
  function clearClippingMesh() {
    planes.map(item => {
      control[item.show] = false;
    });
    setModelClippingPlanes(); //还原所有构建
    //删除之前创建的ClippingMesh剖切辅助对象
    let models = _Engine.scene.children;
    for (let i = models.length - 1; i >= 0; i--) {
      if (models[i].name === "ClippingMesh") {
        if (status) {
          _Engine.scene.remove(models[i]);
        } else {
          models[i].visible = false;
        }
      }
    }
  }
}

//模型多面剖切
export function ClippingMultiSide(_Engine, scene, status, Oconstant, allClip = true) {
  let planes = []; //所有剖切plane集合
  let BoundingBox = allClip ? _Engine.ViewCube.getBoundingBox(_Engine) : GetBoundingBox(_Engine, _Engine.SelectedModels.indexesModels); //场景中的模型包围矩形框
  let MultiSide = getMultiSideSizeAndPosition(Oconstant); //6个剖切面的参数
  let center = BoundingBox.center; //中心点-剖切过程中变化
  let size = {
    //剖切矩形大小-剖切过程中变化
    x: BoundingBox.max.x - BoundingBox.min.x,
    y: BoundingBox.max.y - BoundingBox.min.y,
    z: BoundingBox.max.z - BoundingBox.min.z
  };

  clearClippingMesh(); //删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建

  status && init(); // 根据状态初始化
  _Engine.UpdateRender();
  function init() {
    drawClippingBox(size, center, true);
    const material = new THREE.MeshBasicMaterial({
      color: "#252525",
      opacity: 0.2,
      wireframeLinewidth: 10,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true // 设置为true，opacity才会生效
    }); // 剖切面材质

    for (let i = 0; i < MultiSide.length; i++) {
      //绘制6个剖切面，6个控制器和监听函数
      //控制器
      let control = new THREE.TransformControls(scene.camera, scene.renderer.domElement); //创建Transform控制器
      control.size = 0.5;
      control.name = "TransformControlsClipping-MultiSide";
      control.data_name = MultiSide[i].name;
      control.data_opposite_size = MultiSide[i].oppositeSize;
      control.data_show = MultiSide[i].show;
      control.visible = false;
      MultiSide[i].show === "showX" ? (control.showX = true) : (control.showX = false);
      MultiSide[i].show === "showY" ? (control.showY = true) : (control.showY = false);
      MultiSide[i].show === "showZ" ? (control.showZ = true) : (control.showZ = false);
      scene.add(control); //控制器添加到场景中

      //剖切对象
      let plane = new THREE.Plane(MultiSide[i].vector, 0); //创建二维平面
      plane.visible = true;
      planes = [...planes, plane];
      switch (MultiSide[i].type) {
        case "X轴":
          plane.constant = MultiSide[i].position.x - 0;
          break;
        case "-X轴":
          plane.constant = -MultiSide[i].position.x - 0;
          break;
        case "Y轴":
          plane.constant = MultiSide[i].position.y - 0;
          break;
        case "-Y轴":
          plane.constant = -MultiSide[i].position.y - 0;
          break;
        case "Z轴":
          plane.constant = MultiSide[i].position.z - 0;
          break;
        case "-Z轴":
          plane.constant = -MultiSide[i].position.z - 0;
          break;
      }
      //剖切面
      let geometry = new THREE.PlaneGeometry(MultiSide[i].width, MultiSide[i].height);
      geometry.name = MultiSide[i].name;
      let mesh = new THREE.Mesh(geometry, material); //辅助对象,用于示意剖切面
      mesh.name = "ClippingMesh";
      mesh.data_name = MultiSide[i].name;
      mesh.data_show = MultiSide[i].show;
      mesh.visible = false;
      mesh.position.set(MultiSide[i].position.x, MultiSide[i].position.y, MultiSide[i].position.z);
      MultiSide[i].direction && (mesh.rotation[MultiSide[i].direction] = Math.PI / 2);
      scene.add(mesh);

      //控制器和剖切面绑定
      control.attach(mesh);

      //控制器监听函数
      control.addEventListener("change", render); //控制器监听更新视图
      control.addEventListener("dragging-changed", function (event) {
        //鼠标拖动开始和结束，开始禁止控制器放缩/旋转视图，结束放开控制器的控制
        scene.controls.enabled = !event.value;
        if (scene.controls.enabled) {
          mesh.visible = false;
          let models = _Engine.scene.children;
          let controlPositonList = models.filter(item => item.name === "TransformControlsClipping-MultiSide");
          let sxmax = 0,
            symax = 0,
            szmax = 0,
            sxmin = 0,
            symin = 0,
            szmin = 0;
          controlPositonList.map(item => {
            switch (item.data_name) {
              case "side-x-max":
                sxmax = item.worldPosition.x;
                break;
              case "side-x-min":
                sxmin = item.worldPosition.x;
                break;
              case "side-y-max":
                symax = item.worldPosition.y;
                break;
              case "side-y-min":
                symin = item.worldPosition.y;
                break;
              case "side-z-max":
                szmax = item.worldPosition.z;
                break;
              case "side-z-min":
                szmin = item.worldPosition.z;
                break;
            }
          });
          size = {
            x: sxmax - sxmin,
            y: symax - symin,
            z: szmax - szmin
          };
          center = {
            x: sxmin + size.x / 2,
            y: symin + size.y / 2,
            z: szmin + size.z / 2
          };
          drawClippingBox(size, center, event.target.data_show);
        } else {
          mesh.visible = true;
        }
        _Engine.UpdateRender();
      });

      //实时修改plane.constant，以实现模型剖切
      function render(res) {
        switch (MultiSide[i].type) {
          case "X轴":
            plane.constant = res.target.worldPosition.x - 0;
            break;
          case "-X轴":
            plane.constant = -res.target.worldPosition.x - 0;
            break;
          case "Y轴":
            plane.constant = res.target.worldPosition.y - 0;
            break;
          case "-Y轴":
            plane.constant = -res.target.worldPosition.y - 0;
            break;
          case "Z轴":
            plane.constant = res.target.worldPosition.z - 0;
            break;
          case "-Z轴":
            plane.constant = -res.target.worldPosition.z - 0;
            break;
        }
        _Engine.UpdateRender();
        _Engine.Clipping.Plane = planes;
      }
    }
    if (Oconstant && Oconstant.length) {
      //更新剖切矩形
      setTimeout(() => {
        let models = _Engine.scene.children;
        let controlPositonList = models.filter(item => item.name === "TransformControlsClipping-MultiSide");
        let sxmax = 0,
          symax = 0,
          szmax = 0,
          sxmin = 0,
          symin = 0,
          szmin = 0;
        controlPositonList.map(item => {
          switch (item.data_name) {
            case "side-x-max":
              sxmax = item.worldPosition.x;
              break;
            case "side-x-min":
              sxmin = item.worldPosition.x;
              break;
            case "side-y-max":
              symax = item.worldPosition.y;
              break;
            case "side-y-min":
              symin = item.worldPosition.y;
              break;
            case "side-z-max":
              szmax = item.worldPosition.z;
              break;
            case "side-z-min":
              szmin = item.worldPosition.z;
              break;
          }
        });
        size = {
          x: sxmax - sxmin,
          y: symax - symin,
          z: szmax - szmin
        };
        center = {
          x: sxmin + size.x / 2,
          y: symin + size.y / 2,
          z: szmin + size.z / 2
        };
        drawClippingBox(size, center, false);
      }, 0);
    }
    setModelClippingPlanes(planes); //设置所有构建的clippingPlanes
  }

  //绘制剖切矩形
  function drawClippingBox(size, position, showType, first = false) {
    let models = _Engine.scene.children;
    if (!first) {
      //删除上次的示例剖切矩形
      for (let i = models.length - 1; i >= 0; i--) {
        if (models[i].name === "ClippingBox") {
          _Engine.scene.remove(models[i]);
          break;
        }
      }
    }
    //绘制新的示例剖切矩形
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: "#252525",
      opacity: 0.0001,
      wireframeLinewidth: 10,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true // 设置为true，opacity才会生效
    });
    const ClippingBox = new THREE.Mesh(boxGeometry, boxMaterial);

    let GroupBox = new THREE.Group();
    GroupBox.add(ClippingBox);
    GroupBox.name = "ClippingBox";
    GroupBox.position.set(position.x, position.y, position.z);
    BoundingBox.direction && (GroupBox.rotation[BoundingBox.direction] = Math.PI / 2);
    scene.add(GroupBox);
    let bufferGeometry = new THREE.BufferGeometry();
    let positions = [];
    var edges = new THREE.EdgesGeometry(boxGeometry, 1); //大于89度才添加线条
    var ps = edges.attributes.position.array;
    for (var i = 0; i < ps.length; i = i + 3) {
      let point = new THREE.Vector3(ps[i], ps[i + 1], ps[i + 2]);
      let newpoint = point.clone();
      positions.push(newpoint.x);
      positions.push(newpoint.y);
      positions.push(newpoint.z);
    }
    bufferGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const bufferline = new THREE.LineSegments(
      bufferGeometry,
      new THREE.LineBasicMaterial({
        color: "#E3B951"
      })
    );
    GroupBox.add(bufferline);

    //处理剖切面大小位置
    if (!first) {
      for (let i = models.length - 1; i >= 0; i--) {
        if (models[i].name === "ClippingMesh") {
          let beforeSize, width, height, pos;
          switch (models[i].data_name) {
            case "side-x-max":
              beforeSize = MultiSide.filter(o => o.name === models[i].data_name)[0];
              width = size.z;
              height = size.y;
              pos = {
                x: position.x + size.x / 2,
                y: position.y,
                z: position.z
              };
              models[i].scale.set(width / beforeSize.width, height / beforeSize.height, 1);
              models[i].position.set(pos.x, pos.y, pos.z);
              break;
            case "side-x-min":
              beforeSize = MultiSide.filter(o => o.name === models[i].data_name)[0];
              width = size.z;
              height = size.y;
              pos = {
                x: position.x - size.x / 2,
                y: position.y,
                z: position.z
              };
              models[i].scale.set(width / beforeSize.width, height / beforeSize.height, 1);
              models[i].position.set(pos.x, pos.y, pos.z);
              break;
            case "side-y-max":
              beforeSize = MultiSide.filter(o => o.name === models[i].data_name)[0];
              width = size.x;
              height = size.z;
              pos = {
                x: position.x,
                y: position.y + size.y / 2,
                z: position.z
              };
              models[i].scale.set(width / beforeSize.width, height / beforeSize.height, 1);
              models[i].position.set(pos.x, pos.y, pos.z);
              break;
            case "side-y-min":
              beforeSize = MultiSide.filter(o => o.name === models[i].data_name)[0];
              width = size.x;
              height = size.z;
              pos = {
                x: position.x,
                y: position.y - size.y / 2,
                z: position.z
              };
              models[i].scale.set(width / beforeSize.width, height / beforeSize.height, 1);
              models[i].position.set(pos.x, pos.y, pos.z);
              break;
            case "side-z-max":
              beforeSize = MultiSide.filter(o => o.name === models[i].data_name)[0];
              width = size.x;
              height = size.y;
              pos = {
                x: position.x,
                y: position.y,
                z: position.z + size.z / 2
              };
              models[i].scale.set(width / beforeSize.width, height / beforeSize.height, 1);
              models[i].position.set(pos.x, pos.y, pos.z);
              break;
            case "side-z-min":
              beforeSize = MultiSide.filter(o => o.name === models[i].data_name)[0];
              width = size.x;
              height = size.y;
              pos = {
                x: position.x,
                y: position.y,
                z: position.z - size.z / 2
              };
              models[i].scale.set(width / beforeSize.width, height / beforeSize.height, 1);
              models[i].position.set(pos.x, pos.y, pos.z);
              break;
          }
        }
      }
    }
  }

  //设置所有构建的clippingPlanes
  function setModelClippingPlanes(planes) {
    let models = _Engine.scene.children;
    models.forEach(item => {
      if (item.name === "rootModel") {
        if (item.material instanceof Array) {
          item.material.forEach(ii => {
            ii.clippingPlanes = planes ? planes : null;
          });
          item.cloneMaterialArray.forEach(ii => {
            ii.clippingPlanes = planes ? planes : null;
          });
        } else {
          item.material.clippingPlanes = planes ? planes : null;
          item.cloneMaterialArray.clippingPlanes = planes ? planes : null;
        }
      }
    });
    _Engine.Clipping.Plane = planes;
    setHighlightModelClippingPlanes(_Engine, planes);
    setModelEdgesClippingPlanes(_Engine, planes);
    setEngineRayClippingPlanes(_Engine, planes);
  }

  //删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建
  function clearClippingMesh() {
    setModelClippingPlanes(); //还原所有构建
    //删除之前创建的ClippingMesh剖切辅助对象
    let models = _Engine.scene.children;
    for (let i = models.length - 1; i >= 0; i--) {
      if (
        models[i].name === "ClippingBox" ||
        models[i].name === "ClippingMesh" ||
        models[i].name === "TransformControlsClipping-MultiSide"
      ) {
        _Engine.scene.remove(models[i]);
      }
    }
  }

  //获得6个剖切面和控制器所需参数
  function getMultiSideSizeAndPosition(Oconstant = null) {
    let listLength = Oconstant ? Oconstant.length : 0;
    let center = BoundingBox.center;
    let list = [
      {
        name: "side-z-max", //z轴上的平面1
        width: BoundingBox.max.x - BoundingBox.min.x,
        height: BoundingBox.max.y - BoundingBox.min.y,
        position: {
          x: center.x,
          y: center.y,
          z: listLength ? Oconstant[0].constant : BoundingBox.max.z
        },
        show: "showZ",
        direction: null,
        vector: new THREE.Vector3(0, 0, -1),
        type: "Z轴",
        oppositeSize: "side-z-min" //对立面
      },
      {
        name: "side-z-min", //z轴上的平面2
        width: BoundingBox.max.x - BoundingBox.min.x,
        height: BoundingBox.max.y - BoundingBox.min.y,
        position: {
          x: center.x,
          y: center.y,
          z: listLength ? -Oconstant[1].constant : BoundingBox.min.z
        },
        show: "showZ",
        direction: null,
        vector: new THREE.Vector3(0, 0, +1),
        type: "-Z轴",
        oppositeSize: "side-z-max" //对立面
      },
      {
        name: "side-x-max", //x轴上的平面1
        width: BoundingBox.max.z - BoundingBox.min.z,
        height: BoundingBox.max.y - BoundingBox.min.y,
        position: {
          x: listLength ? Oconstant[2].constant : BoundingBox.max.x,
          y: center.y,
          z: center.z
        },
        show: "showX",
        direction: "y",
        vector: new THREE.Vector3(-1, 0, 0),
        type: "X轴",
        oppositeSize: "side-x-min" //对立面
      },
      {
        name: "side-x-min", //x轴上的平面2
        width: BoundingBox.max.z - BoundingBox.min.z,
        height: BoundingBox.max.y - BoundingBox.min.y,
        position: {
          x: listLength ? -Oconstant[3].constant : BoundingBox.min.x,
          y: center.y,
          z: center.z
        },
        show: "showX",
        direction: "y",
        vector: new THREE.Vector3(+1, 0, 0),
        type: "-X轴",
        oppositeSize: "side-x-max" //对立面
      },
      {
        name: "side-y-max", //y轴上的平面1
        width: BoundingBox.max.x - BoundingBox.min.x,
        height: BoundingBox.max.z - BoundingBox.min.z,
        position: {
          x: center.x,
          y: listLength ? Oconstant[4].constant : BoundingBox.max.y,
          z: center.z
        },
        show: "showY",
        direction: "x",
        vector: new THREE.Vector3(0, -1, 0),
        type: "Y轴",
        oppositeSize: "side-y-min" //对立面
      },
      {
        name: "side-y-min", //y轴上的平面1
        width: BoundingBox.max.x - BoundingBox.min.x,
        height: BoundingBox.max.z - BoundingBox.min.z,
        position: {
          x: center.x,
          y: listLength ? -Oconstant[5].constant : BoundingBox.min.y,
          z: center.z
        },
        show: "showY",
        direction: "x",
        vector: new THREE.Vector3(0, +1, 0),
        type: "-Y轴",
        oppositeSize: "side-y-max" //对立面
      }
    ];
    return list;
  }
}

// 设置高亮模型剖切
function setHighlightModelClippingPlanes(_Engine, planes) {
  let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
  let HighLightGroup = HighLightGroupList[0];
  for (const group of HighLightGroup.children) {
    group.children.map(item => {
      item.material.clippingPlanes = planes ? planes : null;
    });
  }
}

// 设置边线模型剖切
function setModelEdgesClippingPlanes(_Engine, planes) {
  let ModelEdgesList = _Engine.scene.children.filter(o => o.TypeName == "ModelEdges");
  for (const ModelEdge of ModelEdgesList) {
    ModelEdge.material.clippingPlanes = planes ? planes : null;
  }
}

// 设置EngineRay剖切
function setEngineRayClippingPlanes(_Engine, planes) {
  if (_Engine.EngineRay) {
    let EngineRayList = _Engine.EngineRay.scene.children;
    if (EngineRayList && EngineRayList.length) {
      for (const rayItem of EngineRayList) {
        rayItem.material.clippingPlanes = planes ? planes : null;
      }
    }
  }
}

// 剖切对象
export function Clipping(_Engine, scene) {
  var _clippingObject = new Object();
  _clippingObject.Plane = null;
  _clippingObject.isActive = false; //剖切是否激活
  _clippingObject.ActiveType = null; //剖切激活类型
  _clippingObject.SingleSideOpen = function (side, Oconstant) {
    _clippingObject.clearOtherActived();
    ClippingSingleSide(_Engine, scene, true, side, Oconstant);
    _clippingObject.isActive = true;
    _clippingObject.ActiveType = side;
    _clippingObject.AllClip = true;
    _Engine.ClearOriginalData();
  };
  _clippingObject.SingleSideClose = function () {
    ClippingSingleSide(_Engine, scene, false);
    _clippingObject.isActive = false;
    _clippingObject.ActiveType = null;
  };
  _clippingObject.MultiSideOpen = function (Oconstant, allClip = true) {
    _clippingObject.clearOtherActived();
    ClippingMultiSide(_Engine, scene, true, Oconstant, allClip);
    _clippingObject.isActive = true;
    _clippingObject.ActiveType = "MultiSide";
    _clippingObject.AllClip = allClip;
    _Engine.ClearOriginalData();
  };
  _clippingObject.MultiSideClose = function () {
    ClippingMultiSide(_Engine, scene, false);
    _clippingObject.isActive = false;
    _clippingObject.ActiveType = null;
  };

  _clippingObject.clearOtherActived = function () {
    if (_Engine.Clipping.isActive && !_Engine.Clipping.AllClip) {
      _Engine.Clipping.MultiSideClose();
    }
  };
  return _clippingObject;
}
