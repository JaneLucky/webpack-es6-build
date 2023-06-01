const THREE = require("@/three/three.js");
export function MeasurePoint(scene, camera, GroupBox) {
  //点击了鼠标左键 - 高亮选中的构建，并返回选中的构建
  window.addEventListener("click", getPoint, false);
  function getPoint(event) {
    if (event.button === 0) {
      event.preventDefault(); // 阻止默认的点击事件执行
      //声明 rayCaster 和 mouse 变量
      let rayCaster = new THREE.Raycaster();
      let mouse = new THREE.Vector2();
      //通过鼠标点击位置，计算出raycaster所需点的位置，以屏幕为中心点，范围-1到1
      mouse.x = ((event.clientX - document.body.getBoundingClientRect().left) / document.body.offsetWidth) * 2 - 1;
      mouse.y = -((event.clientY - document.body.getBoundingClientRect().top) / document.body.offsetHeight) * 2 + 1; //这里为什么是-号，没有就无法点中
      //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
      rayCaster.setFromCamera(mouse, camera);
      //获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
      //+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
      let intersects = rayCaster.intersectObjects(GroupBox.children, true);
      //选中后进行的操作
      if (intersects.length) {
        var selected = intersects[0]; //取第一个物体
        console.log("x坐标:" + selected.point.x);
        console.log("y坐标:" + selected.point.y);
        console.log("z坐标:" + selected.point.z);

        let group = new THREE.Group();
        group.data_glb = "测量标记";

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([selected.point.x, selected.point.y, selected.point.z], 3));

        const material = new THREE.PointsMaterial({ color: 0x409eff, size: 8, outlineWidth: 2, renderOrder: 99, depthTest: false });
        var point = new THREE.Points(geometry, material);
        // point.position.set(selected.point.x, selected.point.y, selected.point.z); //设置球的坐标
        // scene.add( point );
        group.add(point);

        scene.add(group);

        // const points = DrawPoint(selected.point.x, selected.point.y, selected.point.z)

        // scene.add( points );
      }
    }
  }
}

function DrawPoint(x, y, z, color = 0x409eff, opacity = 1, r = 0.1) {
  var geometry = new THREE.SphereGeometry(r, 10, 10); //创建球体
  var material = new THREE.PointsMaterial({
    //创建材料
    color: color,
    wireframe: false,
    transparent: false,
    side: THREE.DoubleSide,
    opacity: opacity,
    renderOrder: 99,
    depthTest: false,
    sizeAttenuation: false
  });
  var point = new THREE.Mesh(geometry, material); //创建球体网格模型
  point.position.set(x, y, z); //设置球的坐标
  return point;
}
