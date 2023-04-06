import * as THREE from "three";
import {
	TWEEN
} from "three/examples/jsm/libs/tween.module.min.js";
import {
	OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import ResourceTracker from "./memoryManager";

export class SceneManager {
	dom: HTMLElement;
	scene: THREE.Scene;
	camera!: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	controls!: OrbitControls;
	animationId: number = 0;
	trackManager: ResourceTracker;
	constructor(dom: HTMLElement) {
		// trackManager
		this.trackManager = new ResourceTracker();
	}

	// 使用封装的 add 方法向场景添加 Object3D 对象，对对象进行追踪处理
	add(obj: THREE.Object3D) {
		this.scene && this.scene.add(obj);
		this.trackManager && this.trackManager.track(obj);
	}

	// track object 3d
	track(obj: THREE.Object3D) {
		return this.trackManager.track(obj);
	}

	//  animation loop
	animate() {
		this.animationId = requestAnimationFrame(this.animate.bind(this));
		this.renderer && this.renderer.render(this.scene, this.camera);
		this.controls && this.controls.update();
	}

	// 统一处理所有资源
	destroy() {
		// dispose geometry and material
		this.scene.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose();
				obj.material.map?.dispose();
				obj.material.map = null;
				obj.material.dispose();
			}

			if (obj instanceof THREE.Light) {
				obj.dispose();
			}
		});
		this.trackManager.dispose();
		// console.log(this.renderer.info.memory);

		// dispose all
		cancelAnimationFrame(this.animationId);
		this.scene.clear();
		this.renderer.renderLists.dispose();
		this.renderer.dispose();
		this.renderer.forceContextLoss();
		this.dom.removeChild(this.renderer.domElement);
		this.dom = null;
		this.renderer.domElement = null;
		this.scene = null;
		this.camera = null;
		this.renderer = null;

		THREE.Cache.clear();
	}
}