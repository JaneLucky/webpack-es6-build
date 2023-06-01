const THREE = require("@/three/three.js");
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { CreateSvg } from "@/views/tools/common/index.js";

//渲染相关
/*
1. 设置光照
2. 设置阴影
3. 设置显示边线
4. 设置背景颜色等等 
*/

export function Render(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/RenderSetDialog.scss");
  require("@/views/tools/style/" + SetDeviceStyle() + "/FormStyle.scss");
  var _render = new Object();
  _render.isActive = false;
  let render_set_dialog;
  let _container = _Engine.scene.renderer.domElement.parentElement;
  let bgColorList = [
    {
      id: "1",
      color: "linear-gradient(rgb(241, 243, 244), rgb(241, 243, 244))",
      status: false
    },
    {
      id: "2",
      color: "linear-gradient(rgb(40, 44, 53), rgb(248, 249, 249))",
      status: false
    },
    {
      id: "3",
      color: "linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
      status: false
    },
    {
      id: "4",
      color: "linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))",
      status: false
    },
    {
      id: "5",
      color: "linear-gradient(rgb(127, 191, 225), rgb(198, 226, 255))",
      status: false
    }
  ];
  let lightColorList = [
    {
      id: "1",
      label: "照相亭",
      color: "rgb(226, 227, 224)"
    },
    {
      id: "2",
      label: "游泳池",
      color: "rgb(170, 168, 165)"
    },
    {
      id: "3",
      label: "户外",
      color: "rgb(152, 160, 176)"
    },
    {
      id: "4",
      label: "照相亭",
      color: "rgb(225, 227, 223)"
    },
    {
      id: "5",
      label: "田野",
      color: "rgb(199, 213, 227)"
    },
    {
      id: "6",
      label: "蓝天",
      color: "rgb(235, 235, 234)"
    },
    {
      id: "7",
      label: "暖光",
      color: "rgb(203, 204, 208)"
    },
    {
      id: "8",
      label: "冷光",
      color: "rgb(202, 203, 208)"
    }
  ];

  //激活
  _render.Active = function () {
    _render.isActive = true;
    CreatorSetDialog(); //创建弹框UI
  };
  //关闭
  _render.DisActive = function () {
    _render.isActive = false;
    render_set_dialog.style.display = "none"; //关闭弹框UI
    render_set_dialog.style.left = "0px";
    render_set_dialog.style.top = "0px";
    render_set_dialog.removeEventListener("mousedown", _onMouseDown);
  };

  //是否显示模型的边线
  _render.DisplayEdge = function (enable) {
    if (enable) {
      let material = new THREE.LineBasicMaterial({
        color: "#999999"
      });
      let EdgeList = _Engine.AllEdgeList;
      for (const Edge of EdgeList) {
        if (!Edge.Created) {
          Edge.Created = true;
          createLineSegments(Edge.Indexs, Edge.EdgeList, Edge.ElementInfos, material);
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
    if (render_set_dialog) {
      render_set_dialog.style.display = "block"; //关闭弹框UI
      render_set_dialog.addEventListener("mousedown", _onMouseDown);
      return;
    }
    render_set_dialog = document.createElement("div");
    render_set_dialog.className = "Render-Set-Dialog user-select-none";
    render_set_dialog.addEventListener("mousedown", _onMouseDown);

    let header_contain = document.createElement("div");
    header_contain.className = "Feader-Contain";

    let header_title = document.createElement("div");
    header_title.className = "Title";
    header_title.innerText = "引擎设置";
    let header_close = document.createElement("div");
    header_close.className = "Close-Btn";
    header_close.innerText = "×";
    header_close.onclick = () => {
      // _render.DisActive()
      let item = _Engine.TopMenu && _Engine.TopMenu.MenuList.filter(item => item.label === "引擎设置")[0];
      item && item.domEl.click();
    };
    header_contain.appendChild(header_title);
    header_contain.appendChild(header_close);
    render_set_dialog.appendChild(header_contain);

    let main_contain = document.createElement("div");
    main_contain.className = "Main-Contain";
    render_set_dialog.appendChild(main_contain);

    let module_header1 = document.createElement("div");
    module_header1.className = "Module-Header";
    let icon1 = document.createElement("div");
    icon1.className = "Icon";
    let title1 = document.createElement("div");
    title1.className = "Title";
    title1.innerText = "模型效果";
    module_header1.appendChild(icon1);
    module_header1.appendChild(title1);
    main_contain.appendChild(module_header1);

    let form_item_0 = document.createElement("div");
    form_item_0.className = "Form_Item";
    main_contain.appendChild(form_item_0);
    let form_item_label_0 = document.createElement("div");
    form_item_label_0.className = "Form_Item_Label";
    form_item_label_0.innerText = "地面阴影";
    form_item_0.appendChild(form_item_label_0);
    let input_item_0 = document.createElement("input");
    input_item_0.className = "switch";
    input_item_0.type = "checkbox";
    input_item_0.checked = true;
    input_item_0.onchange = e => {
      // console.log(e.target.checked)
    };
    form_item_0.appendChild(input_item_0);

    let input_item_3;

    let form_item_1 = document.createElement("div");
    form_item_1.className = "Form_Item";
    main_contain.appendChild(form_item_1);
    let form_item_label_1 = document.createElement("div");
    form_item_label_1.className = "Form_Item_Label";
    form_item_label_1.innerText = "显示阴影";
    form_item_1.appendChild(form_item_label_1);
    let input_item_1 = document.createElement("input");
    input_item_1.className = "switch";
    input_item_1.type = "checkbox";
    input_item_1.checked = false;
    input_item_1.onchange = e => {
      _Engine.RenderSAO.enableRenderSAO(e.target.checked);
      _Engine.RenderSAO.saoPass.params.output = 0;
      _Engine.RenderSAO.saoPass.params.saoBias = 1;
      _Engine.RenderSAO.saoPass.params.saoBlur = 0;
      _Engine.RenderSAO.saoPass.params.saoBlurDepthCutoff = 0.1;
      _Engine.RenderSAO.saoPass.params.saoBlurRadius = 1;
      _Engine.RenderSAO.saoPass.params.saoBlurStdDev = 5;
      _Engine.RenderSAO.saoPass.params.saoIntensity = Number(input_item_3.innerText);
      _Engine.RenderSAO.saoPass.params.saoKernelRadius = 5;
      _Engine.RenderSAO.saoPass.params.saoMinResolution = 0;
      _Engine.RenderSAO.saoPass.params.saoScale = 2;
    };
    form_item_1.appendChild(input_item_1);

    let form_item_2 = document.createElement("div");
    form_item_2.className = "Form_Item";
    main_contain.appendChild(form_item_2);
    let form_item_label_2 = document.createElement("div");
    form_item_label_2.className = "Form_Item_Label";
    form_item_label_2.innerText = "显示边线";
    form_item_2.appendChild(form_item_label_2);
    let input_item_2 = document.createElement("input");
    input_item_2.className = "switch";
    input_item_2.type = "checkbox";
    input_item_2.checked = false;
    input_item_2.onchange = e => {
      _render.DisplayEdge(e.target.checked);
    };
    form_item_2.appendChild(input_item_2);

    let module_header2 = document.createElement("div");
    module_header2.className = "Module-Header";
    let icon2 = document.createElement("div");
    icon2.className = "Icon";
    let title2 = document.createElement("div");
    title2.className = "Title";
    title2.innerText = "场景光照";
    module_header2.appendChild(icon2);
    module_header2.appendChild(title2);
    main_contain.appendChild(module_header2);

    let form_item_3 = document.createElement("div");
    form_item_3.className = "Form_Item";
    main_contain.appendChild(form_item_3);
    let form_item_label_3 = document.createElement("div");
    form_item_label_3.className = "Form_Item_Label";
    form_item_label_3.innerText = "阴影强度";
    form_item_3.appendChild(form_item_label_3);

    let input_number_contain1 = document.createElement("div");
    input_number_contain1.className = "input_number_contain";
    form_item_3.appendChild(input_number_contain1);

    input_item_3 = document.createElement("div");
    input_item_3.className = "inputtext";
    input_item_3.innerText = 0.2;

    let btn_sub_contain = document.createElement("div");
    btn_sub_contain.className = "Btn_Contain";
    let btn_sub_icon = CreateSvg("icon-jianhao");
    btn_sub_contain.appendChild(btn_sub_icon);
    btn_sub_contain.onclick = e => {
      e.stopPropagation();
      e.preventDefault();
      let num = Number(input_item_3.innerText);
      if (num > 0) {
        let newNum = (num - 0.1).toFixed(1);
        input_item_3.innerText = newNum;
        input_item_1.checked && (_Engine.RenderSAO.saoPass.params.saoIntensity = newNum);
      }
    };
    input_number_contain1.appendChild(btn_sub_contain);
    input_number_contain1.appendChild(input_item_3);

    let btn_add_contain = document.createElement("div");
    btn_add_contain.className = "Btn_Contain user-select-none";
    let btn_add_icon = CreateSvg("icon-jiahao");
    btn_add_contain.appendChild(btn_add_icon);
    btn_add_contain.onclick = e => {
      e.stopPropagation();
      e.preventDefault();
      let num = Number(input_item_3.innerText);
      if (num < 1) {
        let newNum = (num + 0.1).toFixed(1);
        input_item_3.innerText = newNum;
        input_item_1.checked && (_Engine.RenderSAO.saoPass.params.saoIntensity = newNum);
      }
    };
    input_number_contain1.appendChild(btn_add_contain);

    let form_item_4 = document.createElement("div");
    form_item_4.className = "Form_Item";
    main_contain.appendChild(form_item_4);
    let form_item_label_4 = document.createElement("div");
    form_item_label_4.className = "Form_Item_Label";
    form_item_label_4.innerText = "曝光强度";
    form_item_4.appendChild(form_item_label_4);

    let input_number_contain2 = document.createElement("div");
    input_number_contain2.className = "input_number_contain";
    form_item_4.appendChild(input_number_contain2);

    let input_item_4 = document.createElement("div");
    input_item_4.className = "inputtext";
    input_item_4.innerText = 0.6;

    let btn_sub_contain2 = document.createElement("div");
    btn_sub_contain2.className = "Btn_Contain";
    let btn_sub_icon2 = CreateSvg("icon-jianhao");
    btn_sub_contain2.appendChild(btn_sub_icon2);
    btn_sub_contain2.onclick = e => {
      e.stopPropagation();
      e.preventDefault();
      let num = Number(input_item_4.innerText);
      if (num > 0) {
        let newNum = (num - 0.1).toFixed(1);
        input_item_4.innerText = newNum;
        _render.SetAmbientLightIntensity(newNum);
      }
    };
    input_number_contain2.appendChild(btn_sub_contain2);
    input_number_contain2.appendChild(input_item_4);

    let btn_add_contain2 = document.createElement("div");
    btn_add_contain2.className = "Btn_Contain user-select-none";
    let btn_add_icon2 = CreateSvg("icon-jiahao");
    btn_add_contain2.appendChild(btn_add_icon2);
    btn_add_contain2.onclick = e => {
      e.stopPropagation();
      e.preventDefault();
      let num = Number(input_item_4.innerText);
      if (num < 1) {
        let newNum = (num + 0.1).toFixed(1);
        input_item_4.innerText = newNum;
        _render.SetAmbientLightIntensity(newNum);
      }
    };
    input_number_contain2.appendChild(btn_add_contain2);

    let module_header3 = document.createElement("div");
    module_header3.className = "Module-Header";
    let icon3 = document.createElement("div");
    icon3.className = "Icon";
    let title3 = document.createElement("div");
    title3.className = "Title";
    title3.innerText = "高级效果";
    module_header3.appendChild(icon3);
    module_header3.appendChild(title3);
    main_contain.appendChild(module_header3);

    let bg_color_list = document.createElement("div");
    bg_color_list.className = "Bg-Color-List";
    let form_item_label_6 = document.createElement("div");
    form_item_label_6.className = "Form_Item_Label";
    form_item_label_6.innerText = "背景颜色";
    bg_color_list.appendChild(form_item_label_6);
    for (let i = 0; i < bgColorList.length; i++) {
      let item = document.createElement("div");
      item.className = "Item";
      item.style.backgroundImage = bgColorList[i].color;
      item.dataset.value = bgColorList[i].id;
      item.dataset.color = bgColorList[i].color;
      bgColorList[i].domEl = item;
      item.onclick = e => {
        for (let j = 0; j < bgColorList.length; j++) {
          if (bgColorList[j].id === e.target.dataset.value) {
            bgColorList[j].domEl.className = "Item Actived";
          } else {
            bgColorList[j].domEl.className = "Item";
          }
        }
        _render.SetBackGroundColor(e.target.dataset.color);
      };
      bg_color_list.appendChild(item);
    }
    main_contain.appendChild(bg_color_list);

    let light_color_list = document.createElement("div");
    light_color_list.className = "Light-Color-List";
    let form_item_label_7 = document.createElement("div");
    form_item_label_7.className = "Form_Item_Label";
    form_item_label_7.innerText = "环境光照";
    light_color_list.appendChild(form_item_label_7);

    let item_contain = document.createElement("div");
    item_contain.className = "Item-Contain";
    let item_inside_contain = document.createElement("div");
    item_inside_contain.className = "Item-Inside-Contain";
    item_contain.appendChild(item_inside_contain);
    light_color_list.appendChild(item_contain);

    for (let i = 0; i < lightColorList.length; i++) {
      let item = document.createElement("div");
      item.className = "Item";

      let legened = document.createElement("div");
      legened.className = "Legened";
      legened.style.backgroundColor = lightColorList[i].color;
      let title = document.createElement("div");
      title.className = "Title";
      title.innerText = lightColorList[i].label;
      item.appendChild(legened);
      item.appendChild(title);
      item.dataset.value = lightColorList[i].id;
      item.dataset.color = lightColorList[i].color;
      lightColorList[i].domEl = item;
      item.onclick = e => {
        for (let j = 0; j < lightColorList.length; j++) {
          if (lightColorList[j].id === e.target.dataset.value) {
            lightColorList[j].domEl.className = "Item Actived";
          } else {
            lightColorList[j].domEl.className = "Item";
          }
        }
        _render.SetAmbientLightColor(e.target.dataset.color);
      };
      item_inside_contain.appendChild(item);
    }
    main_contain.appendChild(light_color_list);

    _container.appendChild(render_set_dialog);
  }

  function _onMouseDown(e) {
    var left = render_set_dialog.offsetLeft;
    var top = render_set_dialog.offsetTop;
    //计算出鼠标的位置与元素位置的差值。
    var cleft = e.clientX - left;
    var ctop = e.clientY - top;
    render_set_dialog.style.cursor = "move";
    document.onmousemove = function (doc) {
      //计算出移动后的坐标。
      var moveLeft = doc.clientX - cleft;
      var moveTop = doc.clientY - ctop;
      let maxWidth = _container.offsetWidth - render_set_dialog.offsetWidth;
      let maxHeight = _container.offsetHeight - render_set_dialog.offsetHeight;
      if (moveLeft < 0) {
        moveLeft = 0;
      }
      if (moveTop < 0) {
        moveTop = 0;
      }
      if (moveLeft > maxWidth) {
        moveLeft = maxWidth;
      }
      if (moveTop > maxHeight) {
        moveTop = maxHeight;
      }
      //当移动位置在范围内时，元素跟随鼠标移动。
      render_set_dialog.style.left = moveLeft + "px";
      render_set_dialog.style.top = moveTop + "px";
    };

    document.onmouseup = function () {
      render_set_dialog.style.cursor = "auto";
      document.onmousemove = function () {};
    };
  }

  return _render;
}
