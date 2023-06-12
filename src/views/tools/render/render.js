const THREE = require("@/three/three.js");
import SceneEffectSet from "@/views/tools/components/SceneEffectSet.vue";
import { create } from "@/utils/create";

//渲染相关
/*
1. 设置光照
2. 设置阴影
3. 设置显示边线
4. 设置背景颜色等等 
*/

export function Render(_Engine) {
  var _render = new Object();
  _render.isActive = false;
  let _container = _Engine.scene.renderer.domElement.parentElement;

  //激活
  _render.Active = function () {
    _render.isActive = true;
    CreatorSetDialog(); //创建弹框UI
  };
  //关闭
  _render.DisActive = function () {
    _render.Component.dialogVisible = false;
    _render.isActive = false;
  };

  //是否显示模型的边线
  _render.DisplayEdge = function (enable) {
    if (enable) {
      let material = new THREE.LineBasicMaterial({
        color: "#000000"
      });
      let EdgeList = _Engine.AllEdgeList;
      for (const Edge of EdgeList) {
        if (!Edge.Created) {
          Edge.Created = true;
          let MeshEdgeList = [];
          for (let elementEdge of Edge.ElementInfos) {
            Array.prototype.splice.apply(MeshEdgeList, [MeshEdgeList.length, elementEdge.EdgeList.length].concat(elementEdge.EdgeList));
          }
          createLineSegments(Edge.Indexs, MeshEdgeList, Edge.ElementInfos, material);
        }
      }
    }

    var rootmodels = _Engine.scene.children.filter(x => x.name == "ModelEdges");
    rootmodels.map(item => {
      item.visible = enable;
    });
    _Engine.RenderUpdate();
  };
  //设置背景颜色
  _render.SetBackGroundColor = function (color) {
    _Engine.scene.renderer.domElement.parentElement.style.background = color;
  };
  //设置环境光
  _render.SetAmbientLightColor = function (color) {
    _Engine.scene.ambientLight.color = new THREE.Color(color);
    _Engine.RenderUpdate();
  };
  //设置曝光强度
  _render.SetAmbientLightIntensity = function (val) {
    _Engine.scene.ambientLight.intensity = val;
    _Engine.RenderUpdate();
  };
  //设置天空盒子
  _render.SetSceneSky = function (name) {
    _Engine.scene.background = null;
    _Engine.RenderUpdate();
    if (name) {
      let cubeTextureLoader = new THREE.CubeTextureLoader();
      cubeTextureLoader.setPath("bimCDN/img/skybox/" + name + "/");
      let cubeTexture = cubeTextureLoader.load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"], () => {
        _Engine.RenderUpdate();
      });
      _Engine.scene.background = cubeTexture;
    }
  };
  //设置阴影强度

  //创建边线模型
  function createLineSegments(index, positions, ElementInfos, material) {
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.LineSegments(geometry, material);
    line.indexO = index;
    line.name = "ModelEdges";
    line.TypeName = "ModelEdges";
    line.ElementInfos = ElementInfos;
    line.visible = true;
    _Engine.scene.add(line);
    _Engine.RenderUpdate();
  }

  function CreatorSetDialog() {
    if (_render.Component) {
      _render.Component.dialogVisible = true;
      return;
    }
    _render.Component = create(_container, SceneEffectSet, { _Engine: _Engine });
  }

  return _render;
}
