<template>
	<div v-if="dialogVisible">
222222222222222222
	</div>
</template>

<script>
	// import Form from './Form'
	// import {
	// 	GetCostFilter,
	// 	SaveCostFilters,
	// 	GetModelQuantitieslData
	// } from '@/api/costManagement/projectQuantity'
	export default {
		props: {
			show:{
				type: Boolean,
				default: false
			},
			item:{
				type:Object,
				default: null
			}
		},
		components: {
			// Form
		},
		data() {
			return {
				dialogVisible: this.show,
				tableList: [],
				CostFilterList: [],
				currentCategoryModels: [],
				categoryModels: [],
				options: ["建筑", "结构", "管道", "电气", "暖通", "其他"],
				CatogoryOptions: [],
				setListfilter: [],
				search_major: '',
				search_type: '',
				btnLoading: false
			}
		},
		mounted() {
			this.init()
		},
		methods: {
			GetCostFilter() {
				GetCostFilter().then(res => {
					this.listLoading = false
					this.CostFilterList = res.data.list.map(item => {
						return item
					})
				})
			},
			//加载工程量信息
			SelectTypeChange(val) {
				GetCostFilter().then(res => {
					this.listLoading = false
					this.CostFilterList = res.data.list.map(item => {
						return item
					})
					//所有选择的索引 
					for (let ii = 0; ii < selectIndexs.length; ii++) {
						getdata(selectIndexs[ii], this.CostFilterList)
					}
					datas.sort((a, b) => a.ModelType.localeCompare(b.ModelType));
					this.tableList = datas; 
				})
				var datas = [];
				var selectIndexs = window.bimEngine.SelectedModels.indexesModels;
				var allmodels = window.bimEngine.scene.children;
				var allMappers = window.bimEngine.treeMapper;

				function getdata(o, CostFilterList) {
					for (let i = 0; i < allMappers.length; i++) {
						let modelmapper = allMappers[i];
						if (modelmapper.ModelIds != null) {
							for (let j = 0; j < modelmapper.ModelIds.length; j++) {
								var mapper = modelmapper.ModelIds[j];
								if (o[0] == mapper[0] && o[1] == mapper[1]) {
									let infoname = allmodels[o[0]].ElementInfos[o[1]].name;
									let QuantitiesList = [];
									var qs = [];
									//计算工程量
									QuantitiesList = window.bimEngine.QuantitiesList.filter(item => item.path ==
										modelmapper.path);
									if (QuantitiesList.length != 0) {
										qs = QuantitiesList[0].datas.filter(o => infoname.includes(o.UniqueId) && infoname
											.includes(o.ModelId));
										var setting = CostFilterList.filter(o => o.Category == modelmapper.Name);
										if (qs.length != 1) {
											continue;
										}
										if (setting.length != 1) {
											continue;
										}
										let featureDetail = getFeature(qs[0].Features, setting[0].StatisticsBasis);
										let number = getValue(setting[0].StatisticsType, qs[0]);
										//判断是否已存在
										let index = datas.findIndex(o => o.ModelType == modelmapper.Name && o
											.FeatureDetail == featureDetail);
										if (index == -1) {
											var val = {
												ModelType: modelmapper.Name,
												Category: modelmapper.T_Name,
												Feature: setting.length == 1 ? setting[0].StatisticsBasis : '',
												FeatureDetail: featureDetail,
												Name: qs[0].Name,
												StatisticalType: setting.length == 1 ? setting[0].StatisticsType : '',
												Unit: setting.length == 1 ? setting[0].Unit : '',
												Number: Math.round(number * 1000) * 0.001,
											}
											datas.push(val)
										} else {
											datas[index].Number = datas[index].Number + number;
											datas[index].Number = Math.round(datas[index].Number * 1000) * 0.001;
										}

									}
									return;
								}
							}
						}
					}
				}
				//获取值
				function getValue(type, data) {
					if (type == "体积") {
						return data.Volume
					} else if (type == "面积") {
						return data.Area;
					} else if (type == "数量") {
						return data.Count;
					} else if (type == "截面面积") {
						return data.Area
					} else if (type == "长度") {
						return data.Length
					}
				}
				//获取特征值
				function getFeature(Features, FeatureType) {
					let f_type_s = FeatureType.split(',');
					Features = JSON.parse(Features);
					let results = [];
					f_type_s.map(x => {
						let index = Features.findIndex(o => o.Item1 == x);
						if (index != -1) {
							results.push(x + "：" + Features[index].Item2 + ",");
						}
					})
					return results.join("\r\n")
				}

			},
			DownLoadQuantitieslData(param) {
				DownLoadQuantitieslData(param).then(res => {
					const downloadElement = document.createElement('a')
					const href = window.URL.createObjectURL(new Blob([res]), {
						type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
					});
					downloadElement.href = href
					downloadElement.download = '工程量清单.xlsx' // 下载后文件名
					document.body.appendChild(downloadElement)
					downloadElement.click() // 点击下载
					document.body.removeChild(downloadElement) // 下载完成移除元素
					window.URL.revokeObjectURL(href) // 释放掉blob对象 
				})
			},
			//设置窗口
			Setting() {
				this.$refs.Form.init()
			},
			//初始化
			init() {
				this.SelectTypeChange();
			},
		}
	}
</script>

<style scoped>
	/deep/.el-dialog__body {
		padding: 5px 20px;
	}
</style>