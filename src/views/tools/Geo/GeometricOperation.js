const THREE = require('three')

//几何运算
export function GeometricOperation() {
	//说明：
	//1. 所有点的类型为THREE.Vector3
	//2. 所有线的格式为起点和终点
	//3. 所有面的格式为原点与法向量

	//获取点击位置的三个点
	//基准点，向量，大小
	var GetProjectPoints = function(point, nomal, size) {
		//首先判断一下面是不是水平的
		size = size * 0.1;
		if (nomal.x == 0 && nomal.z == 0) {
			//直的
			let dirx = new THREE.Vector3(1, 0, 0);
			let diry = new THREE.Vector3(0, 0, 1);
			let results = [
				point.clone().add(dirx.clone().multiplyScalar(size)).add(diry.clone().multiplyScalar(size)),
				point.clone().add(dirx.clone().multiplyScalar(size)).add(diry.clone().multiplyScalar(-size)),
				point.clone().add(dirx.clone().multiplyScalar(-size)).add(diry.clone().multiplyScalar(-size)),
				point.clone().add(dirx.clone().multiplyScalar(-size)).add(diry.clone().multiplyScalar(size))
			];
			return results
		} else {
			//斜的
			let dirx = nomal.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
			let diry = nomal.clone().cross(dirx).normalize();
			return [
				point.clone().add(dirx.clone().multiplyScalar(size)).add(diry.clone().multiplyScalar(size)),
				point.clone().add(dirx.clone().multiplyScalar(size)).add(diry.clone().multiplyScalar(-size)),
				point.clone().add(dirx.clone().multiplyScalar(-size)).add(diry.clone().multiplyScalar(-size)),
				point.clone().add(dirx.clone().multiplyScalar(-size)).add(diry.clone().multiplyScalar(size))
			];
		}
	}
	//点与点
	//1. 计算目标点指定范围内最近的点  当前点，目标点集，误差值
	var PointNearList = function(point, points, error = 0.01) {
		let _points = points.filter(x => x.distanceTo(point) < error);
		let minDis = Number.MAX_VALUE;
		let currentPoint = null;
		if (_points.length == 0) {
			return null;
		}
		for (let p of points) {
			let dis = PointPointDis(p, point);
			if (dis < minDis) {
				currentPoint = p.clone();
				minDis = dis;
			}
		}
		if (minDis > error) {
			return null
		}
		return currentPoint;
	}
	//2. 点与点的距离
	var PointPointDis = function(point1, point2) {
		return point1.distanceTo(point2);
	}
	//点与线
	//1. 点到线的距离  目标点,线的起点，线的终点
	var PointDistanceLine = function(point, start, end) {
		var result = PointProjectLine(point, start, end);
		if (IsPointProjectLine(point, start, end)) {
			return result.distanceTo(point);
		} else {
			return 100000000;
		}
	}
	//1.1 点到延长线的距离
	var PointDistanceLineExtend = function(point, start, end) {

		let dir = end.clone().sub(start.clone()).setLength(10000);
		let newStart = start.clone().sub(dir);
		let newEnd = end.clone().add(dir);
		return PointDistanceLine(point, newStart, newEnd);
	}
	//2. 点投影是否在线内  目标点,线的起点，线的终点
	var IsPointProjectLine = function(point, start, end) {
		var result = PointProjectLine(point, start, end)
		//判断投影点到起始点的距离和
		let dis1 = result.distanceTo(start);
		let dis2 = result.distanceTo(end);
		let length = start.distanceTo(end);
		if (Math.abs(dis1 + dis2 - length) < 0.01) {
			return true;
		}
		return false;
	}
	//3. 点投影到线的位置  目标点,线的起点，线的终点
	var PointProjectLine = function(point, start, end) {
		const egdeV1 = end.clone().sub(start.clone());
		const egdeV2 = point.clone().sub(start.clone());
		// translate to normalize
		const v1Norm = egdeV1.clone().normalize()
		const v2Norm = egdeV2.clone().normalize()
		// calculate the cos@ between vector 1 and vector 2
		const cos1 = v1Norm.dot(v2Norm);
		let length = start.distanceTo(point);
		const distance = length * cos1;
		//获取投影点
		var projectPoint = start.clone().add(v1Norm.clone().setLength(distance));
		return projectPoint;
	}
	//4. 点是否在线上
	var IsPointInLine = function(point, start, end) {
		let dis1 = point.distanceTo(start);
		let dis2 = point.distanceTo(end);
		let length = start.distanceTo(end);
		if (Math.abs(dis1 + dis2 - length) < 0.01) {
			return true;
		}
		return false;
	}
	//5. 点到向量的距离
	var PointDistanceToVector = function(point, start, dir) {
		let end = start.clone().add(dir);
		return PointDistanceLineExtend(point, start, end);
	}

	//点与面
	//1. 点到面的距离
	var PointDistanceFace = function(point, plane) {
		let defaultDir = plane.normal;
		var rayCast = new THREE.Raycaster();
		var rayDir = defaultDir.clone().setLength(20000000);
		var rayDir_ = defaultDir.clone().setLength(-10000000);
		rayCast.set(p.clone().add(rayDir_.clone()), rayDir);
		var startPickPoint = rayCast.ray.intersectPlane(plane);
		return startPickPoint;
	}
	//2. 点投影是否在面内
	var IsPointProjectFace = function(point, plane) {
		//比较复杂

	}
	//3. 点投影到面的位置
	var PointProjectFace = function(point, plane) {
		var rayCast = new THREE.Raycaster();
		var rayDir = defaultDir.clone().setLength(20000000);
		var rayDir_ = defaultDir.clone().setLength(-10000000);
		rayCast.set(p.clone().add(rayDir_.clone()), rayDir);
		var startPickPoint = rayCast.ray.intersectPlane(defaultPlane);
		return startPickPoint;
	}
	//4. 点是否在面上
	var IsPointInFace = function(point, plane) {
		let result = PointProjectFace(point, plane);
		if (result.distanceTo(point) < 0.01) {
			return true;
		}
		return false;
	}
	//线与线
	//1. 线线是否平行
	var LineLineParallel = function(start1, end1, start2, end2) {

	}
	//2. 线线交点
	var LineLineIntersection = function(start1, end1, start2, end2) {

	}
	//3. 线线空间交点
	var LineLineWorldIntersection = function(start1, end1, start2, end2) {

	}
	//线与面
	//1. 线面是否平行
	var LineplaneParallel = function(start1, end1, plane) {

	}
	//2. 线面交点
	var LineFaceIntersection = function(start1, end1, plane) {

	}
	//3. 线投影到面上
	var LineProjectFace = function(start1, end1, plane) {

	}
	return {
		PointDistanceLine,
		PointPointDis,
		PointProjectLine,
		GetProjectPoints,
		PointDistanceLineExtend,
		LineProjectFace,
		LineFaceIntersection,
		LineplaneParallel,
		LineLineWorldIntersection,
		LineLineIntersection,
		LineLineParallel,
		IsPointInFace,
		PointProjectFace,
		IsPointProjectFace,
		PointDistanceFace,
		IsPointInLine
	}
}

//捕捉元素
export function RayCatchElement() {




	function renderCreateMeasureLine(_startPoint, _endPoint, dis = 2) {
		var geometry = getMeasureLine(_startPoint, _endPoint, dis);
		var guid_ = guid();

		//将geo渲染出来
		let boxMaterial = new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true,
			linewidth: 100,
			depthTest: false
		});
		var lines = new THREE.Line(geometry, boxMaterial, THREE.LinePieces);
		lines.name = guid_;
		lines.renderOrder = 99
		_viewer.impl.addOverlay('MeasureOverlay', lines);
		_viewer.impl.createOverlayScene('tempMeasureOverlay', boxMaterial);
		//然后就要可以看到实时渲染的结果
	}


}
export function GeometricOperation2() {
	//获取投影距离,需要投影到相同的平面上，需要考虑投影平面
	function calculateDistance(pt1, pt2, pt) {
		const egdeV1 = new THREE.Vector3().subVectors(pt2.clone(), pt1.clone())
		const egdeV2 = new THREE.Vector3().subVectors(pt.clone(), pt1.clone())
		// translate to normalize
		const v1Norm = egdeV1.clone().normalize();
		const v2Norm = egdeV2.clone().normalize();
		// calculate the cos@ between vector 1 and vector 2
		const cos1 = v1Norm.clone().dot(v2Norm.clone());
		const c = v1Norm.clone().cross(v2Norm.clone());
		//c去和标准平面对比
		let cc = c.clone().dot(defaultDir.clone());

		let distanceToDefaultPlane = defaultPlane.distanceToPoint(pt1.clone());

		let length = pt1.distanceTo(pt);
		const sin = Math.sqrt(1 - cos1 * cos1);
		const distance = Math.sqrt(length * sin * length * sin - distanceToDefaultPlane * distanceToDefaultPlane);

		return distance * (cc > 0 ? 1 : -1);
	}
	//获取投影点
	function LineProjectPoint(pt1, pt2, pt) {
		const egdeV1 = pt2.clone().sub(pt1.clone());
		const egdeV2 = pt.clone().sub(pt1.clone());
		// translate to normalize
		const v1Norm = egdeV1.clone().normalize()
		const v2Norm = egdeV2.clone().normalize()
		// calculate the cos@ between vector 1 and vector 2
		const cos1 = v1Norm.dot(v2Norm);
		let length = pt1.distanceTo(pt);
		const distance = length * cos1;
		//获取投影点
		return pt1.clone().add(v1Norm.clone().setLength(distance));
	}
	//所有的点投影到工作平面
	function PlaneProjectPoint(p) {
		var rayCast = new THREE.Raycaster();
		var rayDir = defaultDir.clone().setLength(20000000);
		var rayDir_ = defaultDir.clone().setLength(-10000000);
		rayCast.set(p.clone().add(rayDir_.clone()), rayDir);
		var startPickPoint = rayCast.ray.intersectPlane(defaultPlane);
		return startPickPoint;
	}
	//获取横平竖直的点
	function HorizontalAndVertical(startPoint, point) {
		if (startPoint == null) {
			return point;
		}
		if (point == null) {
			return point;
		}
		let dir = point.clone().sub(startPoint.clone()).setLength(1);
		if (Math.abs(dir.y) <= 0.05) {
			return new THREE.Vector3(point.x, startPoint.y, point.z);
		} else if (Math.abs(dir.x) <= 0.05) {
			return new THREE.Vector3(startPoint.x, point.y, point.z);
		}
		return point;
	};

}
