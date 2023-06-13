const THREE = require("@/three/three.js");
import { EffectComposer } from "@/three/postprocessing/EffectComposer.js";
import { RenderPass } from "@/three/postprocessing/RenderPass.js";
import { OutlinePass } from "@/three/postprocessing/OutlinePass.js";
import { ShaderPass } from "@/three/postprocessing/ShaderPass.js";
import { FXAAShader } from "@/three/shaders/FXAAShader.js";
import { IncludeElement, ClipInclude } from "@/views/tools/initialize/InitEvents.js"; //监听函数

// 模型边线高亮
export function OutlineMesh(_Engine, callback) {
  let _outlineMesh = new Object();
  _outlineMesh.isActive = false;
  let _container = _Engine.scene.renderer.domElement.parentElement;
  let outlinePass, composer;
  let AnimationFrame;
  let CAMERA_POSITION;

  CreateOutline();
  //激活
  _outlineMesh.Active = function () {
    if (!_outlineMesh.isActive) {
      //禁用点击
      _Engine.StopClick = true;
      //清除之前选中的构建
      _Engine.CurrentSelect = null;
      _Engine.ResetModelStatus("highlight", [], false);
      _container.addEventListener("pointerdown", onMouseDown);
      _container.addEventListener("pointerup", onMouseUp);
      render();
      function render() {
        AnimationFrame = requestAnimationFrame(render);
        composer.render();
      }
      _outlineMesh.isActive = true;
    }
  };
  //关闭
  _outlineMesh.DisActive = function () {
    if (_outlineMesh.isActive) {
      //禁用点击
      _Engine.StopClick = false;
      _container.removeEventListener("pointerdown", onMouseDown);
      _container.removeEventListener("pointerup", onMouseUp);
      cancelAnimationFrame(AnimationFrame); //清除动画
      _outlineMesh.isActive = false;
    }
  };

  function CreateOutline() {
    composer = new EffectComposer(_Engine.scene.renderer);
    let renderPass = new RenderPass(_Engine.scene, _Engine.scene.camera);
    composer.addPass(renderPass);
    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), _Engine.scene, _Engine.scene.camera);
    // outlinePass.edgeStrength = 5; //包围线浓度
    // outlinePass.edgeGlow = 0; //边缘线范围
    // outlinePass.edgeThickness = 1; //边缘线浓度
    // outlinePass.pulsePeriod = 0; //包围线闪烁频率
    // outlinePass.usePatternTexture = false;
    // outlinePass.visibleEdgeColor.set('#3f9ce4'); //包围线颜色
    // outlinePass.hiddenEdgeColor.set('#0008fa'); //被遮挡的边界线颜色

    composer.addPass(outlinePass);
    let effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    effectFXAA.renderToScreen = true;
    composer.addPass(effectFXAA);
  }

  function UpdateOutline(selectedObjects) {
    outlinePass.selectedObjects = selectedObjects;
  }
  //监听场景点击模型
  function onMouseDown(event) {
    event.preventDefault(); // 阻止默认的点击事件执行
    CAMERA_POSITION = {
      x: event.x,
      y: event.y
    };
  }

  function onMouseUp(event) {
    if (event.button === 0) {
      event.preventDefault(); // 阻止默认的点击事件执行
      let current_model = null;
      let current_mesh = null;
      if (CAMERA_POSITION && Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
        //声明 rayCaster 和 mouse 变量
        let rayCaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - _Engine.scene.camera.viewport.x) / _Engine.scene.camera.viewport.z) * 2 - 1;
        mouse.y = -((event.clientY - _Engine.scene.camera.viewport.y) / _Engine.scene.camera.viewport.w) * 2 + 1; //这里为什么是-号，没有就无法点中
        //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
        rayCaster.setFromCamera(mouse, _Engine.scene.camera);
        //获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
        //+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
        let intersects = rayCaster.intersectObjects(_Engine.GetAllVisibilityModel(), true);
        if (intersects.length > 0 && _Engine.LockingSelect != true) {
          for (var intersect of intersects) {
            if (
              intersect.object.TypeName == "Mesh" ||
              intersect.object.TypeName == "Mesh-Structure" ||
              intersect.object.TypeName == "PipeMesh"
            ) {
              var clickObj = IncludeElement(_Engine, intersect.object, intersect.point); //选中的构建位置信息
              if (clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false) {
                let EdgeInfos = _Engine.AllEdgeList.filter(item => item.Indexs === intersect.object.index);
                let EdgeItem = EdgeInfos && EdgeInfos.length ? EdgeInfos[0] : null;
                current_model = {
                  dbid: clickObj.dbid,
                  name: clickObj.name,
                  glb: intersect.object.url,
                  TypeName: intersect.object.TypeName,
                  basePath: intersect.object.basePath,
                  relativePath: intersect.object.relativePath,
                  indexs: [intersect.object.index, clickObj.dbid],
                  min: intersect.object.ElementInfos[clickObj.dbid].min,
                  center: intersect.object.ElementInfos[clickObj.dbid].center,
                  max: intersect.object.ElementInfos[clickObj.dbid].max,
                  EdgeList: EdgeItem ? EdgeItem.ElementInfos[clickObj.dbid].EdgeList : [],
                  update: false,
                  materialName: intersect.object.ElementInfos[clickObj.dbid].materialName,
                  materialMap: intersect.object.material.materialMap
                };
                current_mesh = intersect.object.meshs[clickObj.dbid];
                break;
              }
            } else if (intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName == "InstancedMesh-Pipe") {
              if (
                !ClipInclude(
                  intersect.object.ElementInfos[intersect.instanceId].min,
                  intersect.object.ElementInfos[intersect.instanceId].max,
                  intersect.object.material.clippingPlanes,
                  intersect.point
                )
              ) {
                let EdgeInfos = _Engine.AllEdgeList.filter(item => item.Indexs === intersect.object.index);
                let EdgeItem = EdgeInfos && EdgeInfos.length ? EdgeInfos[0] : null;
                current_model = {
                  dbid: intersect.instanceId,
                  name: intersect.object.ElementInfos[intersect.instanceId].name,
                  glb: intersect.object.url,
                  TypeName: intersect.object.TypeName,
                  basePath: intersect.object.basePath,
                  relativePath: intersect.object.relativePath,
                  indexs: [intersect.object.index, intersect.instanceId],
                  min: intersect.object.ElementInfos[intersect.instanceId].min,
                  center: intersect.object.ElementInfos[intersect.instanceId].center,
                  max: intersect.object.ElementInfos[intersect.instanceId].max,
                  EdgeList: EdgeItem ? EdgeItem.ElementInfos[intersect.instanceId].EdgeList : [],
                  update: false,
                  materialName: intersect.object.ElementInfos[intersect.instanceId].materialName,
                  materialMap: intersect.object.material.materialMap
                };
                current_mesh = intersect.object.meshs[intersect.instanceId];
                break;
              }
            }
          }
          if (current_model) {
            if (current_model.center) {
              _Engine.scene.controls.origin = current_model.center;
            }
            let mesh = CreateSelectMesh(current_mesh);
            UpdateOutline([mesh]);
          } else {
            UpdateOutline([]);
          }
          callback(current_model);
        } else {
          UpdateOutline([]);
        }
      }
    }
  }

  // 创建选择构件，用于显示高亮边线
  function CreateSelectMesh(meshSelect) {
    let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
    let HighLightGroup = HighLightGroupList[0];
    HighLightGroup.children = [];
    const meshMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthTest: false
    });
    const mesh = new THREE.Mesh(meshSelect.geometry, meshMaterial);
    mesh.applyMatrix4(meshSelect.matrix);
    mesh.TypeName = "HighLightGroup-MeshOutline";

    if (meshSelect.rotation) {
      let rotationX = isNaN(meshSelect.rotation.x) ? 0 : meshSelect.rotation.x;
      let rotationY = isNaN(meshSelect.rotation.y) ? 0 : meshSelect.rotation.y;
      let rotationZ = isNaN(meshSelect.rotation.z) ? 0 : meshSelect.rotation.z;
      if (!(rotationX == 0 && rotationY == 0 && rotationZ == 0)) {
        mesh.rotation._order = "YXZ";
        mesh.rotation.set(rotationX, rotationY, rotationZ);
      }
    }
    if (meshSelect.position) {
      let positionX = isNaN(meshSelect.position.x) ? 0 : meshSelect.position.x;
      let positionY = isNaN(meshSelect.position.y) ? 0 : meshSelect.position.y;
      let positionZ = isNaN(meshSelect.position.z) ? 0 : meshSelect.position.z;
      if (!(positionX == 0 && positionY == 0 && positionZ == 0)) {
        mesh.position.set(positionX, positionY, positionZ);
      }
    }
    HighLightGroup.add(mesh);
    return mesh;
  }

  return _outlineMesh;
}
