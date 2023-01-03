import {
	FirstPersonCameraControl
} from '@/three/controls/firstPersonCameraControl.js';
export function firstPersonControls(bimengine, callBack) {
	var _firstPersonControls = new Object();
	let AnimationFrame;
	//激活
	_firstPersonControls.Active = function() {
		bimengine.scene.controls && (bimengine.scene.controls.enabled = false)
		_firstPersonControls.controls = new FirstPersonCameraControl(bimengine.scene.camera, bimengine.scene.renderer.domElement,bimengine.GetAllVisibilityModel());
		_firstPersonControls.controls.name = "FirstPersonControls"
		/* 属性参数默认 */
		let settings = {
			firstPerson: true,
			gravity: false,
			collision: false,
			positionEasing: true,
		}; 
		_firstPersonControls.controls.enabled = settings.firstPerson;
		_firstPersonControls.controls.applyGravity = settings.gravity;
		_firstPersonControls.controls.applyCollision = settings.collision;
		_firstPersonControls.controls.positionEasing = settings.positionEasing; 
		window.addEventListener('resize', onWindowResize, false);
		render();
	}
	//关闭
	_firstPersonControls.DisActive = function() {
		bimengine.scene.controls && (bimengine.scene.controls.enabled = true)
		window.removeEventListener('resize', onWindowResize)
		cancelAnimationFrame(AnimationFrame) //清除动画
	}
	
	/* 窗口变动触发 */
	function onWindowResize() {
		bimengine.scene.camera.aspect = window.innerWidth / window.innerHeight;
		bimengine.scene.camera.updateProjectionMatrix();
		bimengine.scene.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	/* 数据更新 */
	function render() {
		AnimationFrame = requestAnimationFrame(render);
		_firstPersonControls.controls && _firstPersonControls.controls.enabled && _firstPersonControls.controls.update();
	}
	return _firstPersonControls
}
