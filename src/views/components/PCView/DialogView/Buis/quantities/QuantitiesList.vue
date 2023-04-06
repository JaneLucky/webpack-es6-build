<template>
	<el-dialog class="DIALOG" title="工程量统计" v-if="dialogVisible" :visible.sync="dialogVisible" width="70%" append-to-body>
		<div>
			<!-- 筛选条件 -->
			<el-row>
				<!-- <el-select size="mini" @change="SelectTypeChange" v-model="search_major" placeholder="选择专业">
					<el-option v-for="item in options" :key="item" :label="item" :value="item">
					</el-option>
				</el-select>
				<el-select size="mini" v-model="search_type" placeholder="选择类型">
					<el-option v-for="item in CatogoryOptions" :key="item" :label="item" :value="item">
					</el-option>
				</el-select>
				<el-button @click="Search(false)" size="mini">查询</el-button> -->
				<!-- <el-button size="mini" @click="toAddMaterialPlan" :loading="btnLoading">生成材料计划</el-button> -->
				<el-button @click="Setting" size="mini" style="float: right;">设置</el-button>
				<!-- <el-button @click="Search(true)" size="mini" style="float: right;">导出</el-button> -->
			</el-row>
			<!-- 表格内容 -->
			<el-row style="margin-top: 10px;">
				<el-table :data="tableList" size="mini" height="50vh">
					<el-table-column label="序号" width="60" type="index">
					</el-table-column>
					<el-table-column label="专业" width="80" prop="Category">
					</el-table-column>
					<el-table-column label="构件类型" prop="ModelType" width="120">
					</el-table-column>
					<el-table-column label="族类型" prop="Name">
					</el-table-column>
					<el-table-column label="特征类型" prop="Feature" width="120">
					</el-table-column>
					<el-table-column label="项目特征" prop="FeatureDetail" width="280">
						<template slot-scope="scope">
							<span style="white-space:pre-line;">{{scope.row.FeatureDetail}}</span>
						</template>
					</el-table-column>
					<el-table-column label="计量方式" width="120" prop="StatisticalType">
					</el-table-column>
					<el-table-column label="工程量" width="180" prop="Number">
						<template slot-scope="scope">
							<span>{{scope.row.Number.toFixed(3)}}</span>
						</template>
					</el-table-column>
					<el-table-column label="计量单位" width="120" prop="Unit">
					</el-table-column>
				</el-table>
			</el-row>
		</div>
		<Form @Submit="GetCostFilter" ref="Form" />
	</el-dialog>
</template>

<script>
	import Form from './Form.vue'
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
			Form
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