const THREE = require('@/three/three.js')
import { RGBELoader } from "@/three/loaders/RGBELoader.js";
//初始化场景
 export function InitScene(){
  let scene = new THREE.Scene();//创建场景
  // scene.background = new THREE.Color( '#b9d3ff' );
  return scene
}

//初始化辅助坐标轴
export function InitAxesHelper(scene){
  const axesHelper = new THREE.AxesHelper( 5 );//红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴
  scene.add( axesHelper );
}

//初始化光线
export function InitLight(scene){
	
	// let hemisphereLight = new THREE.HemisphereLight( 0.3);
	// hemisphereLight.position.set(0, 500, 0);
	// scene.add(hemisphereLight);
  var point = new THREE.PointLight(0xffffff,0.3);
  point.position.set(0, 200, 0); //点光源位置
  // point.castShadow = true;
  scene.add(point); //点光源添加到场景中
  
  var point1 = new THREE.PointLight(0xffffff,0.3);
  point1.position.set(0, -200, 0); //点光源位置
  // point1.castShadow = true;
  scene.add(point1); //点光源添加到场景中
  //环境光
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  scene.ambientLight = ambientLight
  // return point
}

//初始化相机
export function  InitCamera(scene){
  var width = window.innerWidth; //窗口宽度
  var height = window.innerHeight; //窗口高度
  var k = width / height; //窗口宽高比
  var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
  //创建相机对象
  // var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
  var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 30000 ) //透视相机
  camera.position.set( 1000, 500, 1000 ); //设置相机位置
  camera.lookAt( scene.position ); //设置相机方向(指向的场景对象)
  return camera
}

//初始化透视相机
export function InitPerCamera(scene){
  if(!scene.perCamera){
    var perCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 30000 ) //透视相机
    perCamera.position.set( 1000, 500, 1000 ); //设置相机位置
    perCamera.lookAt( scene.position ); //设置相机方向(指向的场景对象)
    scene.perCamera = perCamera
  }
  return scene.perCamera;
}

//初始化正交相机
export function InitOrthCamera(scene){
  if(!scene.perCamera){
      console.error('透视相机不存在');
      return null;
  }
  if(!scene.orthCamera){
    //1.计算透视相机到场景 scene 的深度距离 depth
    let target = scene.position.clone();;
    let camPos = scene.perCamera.position.clone();
    let depth = camPos.sub(target).length();

    //2.得到透视相机的宽高比和垂直可视角度
    let aspect = scene.perCamera.aspect;
    let fov = scene.perCamera.fov;

    //3.根据上述变量计算正交投影相机的视口矩形
    let top_ortho = depth  * Math.atan( (Math.PI/180)*(fov)/2);
    let right_ortho = top_ortho * aspect;
    let bottom_ortho = - top_ortho;
    let left_ortho = - right_ortho;


    //4.最后创建正交投影相机
    let near = scene.perCamera.near;
    let far = scene.perCamera.far;
    scene.orthCamera = new THREE.OrthographicCamera(
      left_ortho , right_ortho ,
      top_ortho , bottom_ortho ,
      near, far);
  }
  return scene.orthCamera;
}

//初始化渲染器
export function InitRenender(dom){
  var width = document.getElementById(dom).clientWidth; //窗口宽度
  var height = document.getElementById(dom).clientHeight; //窗口高度
  var renderer = new THREE.WebGLRenderer({
    // powerPreference:'high-performance',
    alpha : true,
    antialias:true,
    preserveDrawingBuffer: true //保留图形缓冲区
  }); //创建渲染器
  renderer.setSize(width, height); //设置渲染区域尺寸
  // renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
  renderer.setClearAlpha(0);//设置背景颜色透明
  renderer.shadowMap.enabled = true;
  renderer.localClippingEnabled = true;
 
  return renderer
}

//初始背景图场景
export function InitBackgroundScene(scene){
  new RGBELoader()
  .setPath( 'static/img/' )
  .load( 'quarry_01_1k.hdr', function ( texture ) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture; //背景图
    scene.environment = texture; //环境图
  } );
}

//其他内容初始化
export function InitOthers(dom, renderer){
  let container = document.getElementById(dom);
  container.appendChild(renderer.domElement);//渲染到浏览器
}



//定义物体
export function setGeometrys(){
  //创建形状 BoxGeometry
  var geometry = new THREE.BoxGeometry(1,1,1);
  var cubeMaterial = [
      //右
      new THREE.MeshLambertMaterial({color:0xFFFFFF,side:THREE.DoubleSide}),
      //左
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/2.png') ,side:THREE.DoubleSide}),
      //上
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/3.png') ,side:THREE.DoubleSide}),
      //下
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/4.png') ,side:THREE.DoubleSide}),
      //前
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/5.png') ,side:THREE.DoubleSide}),
      //后
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/6.png') ,side:THREE.DoubleSide})

  ];
  //创建材料   wireframe是否使用线条
  //var material = new THREE.MeshBasicMaterial({color:0xFFFFFF,wireframe:true});
  var material = new THREE.MeshFaceMaterial(cubeMaterial);

  //将材料和形状结合
  var cube = new THREE.Mesh(geometry,material);

  //物体加入场景中
  scene.add(cube);

}
