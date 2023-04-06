import * as THREE from "three";

export default class MemoryManager {
	resources: Set < unknown > ;

	constructor() {
		this.resources = new Set();
	}

	// 收集资源
	track(resource: any) {
		if (!resource) {
			return resource;
		}

		// 当资源是一组材质，或者一组纹理，递归每一项
		if (Array.isArray(resource)) {
			resource.forEach((resource) => this.track(resource));
			return resource;
		}
		// 当资源有 dispose 方法，或者 是 Object3D 对象
		if (resource.dispose || resource instanceof THREE.Object3D) {
			this.resources.add(resource);
		}
		// Object3D 对象
		if (resource instanceof THREE.Object3D) {

			// Mesh 对象时，追踪 几何体和材质
			if (resource instanceof THREE.Mesh) {
				this.track(resource.geometry);
				this.track(resource.material);
			}

			this.track(resource.children);
		} else if (resource instanceof THREE.Material) {
			// We have to check if there are any textures on the material
			for (const value of Object.values(resource)) {
				if (value instanceof THREE.Texture) {
					this.track(value);
				}
			}
			// We also have to check if any uniforms reference textures or arrays of textures
			if ((resource as any).uniforms) {
				for (const value of Object.values((resource as any).uniforms)) {
					if (value) {
						const uniformValue = (value as any).value;
						if (
							uniformValue instanceof THREE.Texture ||
							Array.isArray(uniformValue)
						) {
							this.track(uniformValue);
						}
					}
				}
			}
		}
		return resource;
	}
	untrack(resource: any) {
		this.resources.delete(resource);
	}

	// 进行统一释放GPU内存
	dispose() {
		for (const resource of this.resources) {
			if (resource instanceof THREE.Object3D) {
				if (resource.parent) {
					resource.parent.remove(resource);
				}
			}
			if ((resource as any).dispose) {
				(resource as any).dispose();
			}
		}
		this.resources.clear();
	}
}