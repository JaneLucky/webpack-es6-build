import {
	FirstPersonCameraControl
} from '/src/three/controls/firstPersonCameraControl.js';
export function InitFirstPersonControls(scene, callBack) {

	scene.controls && (scene.controls.enabled = false)

	let controls;

	/* 控制器 */
	function initControls() {

		/* 第一人称控件 */
		// controls = new THREE.FirstPersonControls(scene.camera, scene.renderer.domElement);
		controls = new FirstPersonCameraControl(scene.camera, scene.renderer.domElement);
		controls.name = "FirstPersonControls"
		/* 属性参数默认 */
		let settings = {
			firstPerson: true,
			gravity: false,
			collision: false,
			positionEasing: true,
		}; 
		controls.enabled = settings.firstPerson;
		controls.applyGravity = settings.gravity;
		controls.applyCollision = settings.collision;
		controls.positionEasing = settings.positionEasing;


		// controls.lookSpeed = 0.01; //鼠标移动查看的速度
		// controls.movementSpeed = 5; //相机移动速度
		// controls.noFly = false;
		// controls.constrainVertical = true; //约束垂直
		// controls.verticalMin = 1.0;
		// controls.verticalMax = 2.0;
		// controls.lon = 0; //进入初始视角x轴的角度
		// controls.lat = 0; //初始视角进入后y轴的角度
	}


	/* 窗口变动触发 */
	function onWindowResize() {

		scene.camera.aspect = window.innerWidth / window.innerHeight;
		scene.camera.updateProjectionMatrix();
		scene.renderer.setSize(window.innerWidth, window.innerHeight);

	}

	/* 数据更新 */
	function render() {
		requestAnimationFrame(render);
		controls && controls.enabled && controls.update();
	}

	/* 初始化 */
	function init() {
		initControls();
		callBack(controls)
		/* 监听事件 */
		window.addEventListener('resize', onWindowResize, false);
	}

	/* 初始加载 */
	(function() {
		init();
		render();
	})();

}
