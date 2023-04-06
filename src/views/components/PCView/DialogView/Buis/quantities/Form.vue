<template>
	<el-dialog title="工程量设置" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="visible"
		lock-scroll width="660px" class="JNPF-dialog JNPF-dialog_center" append-to-body>
		<el-table ref="tableRef" v-loading="listLoading" :data="tableList" max-height="400">
			<el-table-column prop="Category" label="构件类型" min-width="140">
				<template slot-scope="scope">
					<div class="item-contaim">
						<div class="label">
							<span v-if="scope.row.disabledCategory">{{scope.row.Category}}</span>
							<el-input size="mini" class="input-class" v-else v-model="scope.row.Category" placeholder="构件类型"
								:disabled="scope.row.disabledCategory" />
						</div>
						<div class="icon" v-if="!scope.row.Id">
							<i class="el-icon-edit" @click="scope.row.disabledCategory = !scope.row.disabledCategory"></i>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="StatisticsBasis" label="统计依据" min-width="180">
				<template slot-scope="scope">
					<div class="item-contaim">
						<div class="label">
							<span v-if="scope.row.disabledStatisticsBasis">{{scope.row.StatisticsBasis}}</span>
							<el-input size="mini" class="input-class" v-else v-model="scope.row.StatisticsBasis" placeholder="统计依据"
								:disabled="scope.row.disabledStatisticsBasis" />
						</div>
						<div class="icon">
							<i class="el-icon-edit" @click="scope.row.disabledStatisticsBasis = !scope.row.disabledStatisticsBasis"></i>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="StatisticsType" label="统计方式" min-width="100">
				<template slot-scope="scope">
					<el-select size="mini" v-model="scope.row.StatisticsType" placeholder="请选择"
						@change="onStatisticsTypeChange(scope.row)">
						<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column prop="Unit" label="单位" min-width="60" />
		</el-table>
		<div>
			<el-button style="width:100%;margin-top:20px;" icon="el-icon-plus" size="small" @click="addItem">新增</el-button>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
				保存
			</el-button>
		</span>
	</el-dialog>
</template>

<script>
	import {
		GetCostFilter,
		SaveCostFilters,
		GetModelQuantitieslData
	} from '@/api/costManagement/projectQuantity'
	
	export default {
		
		data() {
			return {
				visible: false,
				listLoading: false,
				btnLoading: false,
				options: [{
					label: '体积',
					value: '体积',
					unit: 'm³'
				}, {
					label: '面积',
					value: '面积',
					unit: '㎡'
				}, {
					label: '数量',
					value: '数量',
					unit: '个'
				}, {
					label: '截面面积',
					value: '截面面积',
					unit: '㎡'
				}, {
					label: '长度',
					value: '长度',
					unit: 'm'
				}],
				tableList: [],
			}
		},
		methods: {
			init() {
				this.visible = true
				this.listLoading = true
				this.getModelTreeTypeList()
			},
			getModelTreeTypeList() {
				GetCostFilter().then(res => {
					this.listLoading = false 
					this.tableList = res.data.list.map(item => {
						// item.disabledStatisticsBasis = true
						// item.disabledCategory = true
						return item
					})
				})
			},
			onStatisticsTypeChange(item) {
				for (let i of this.options) {
					if (i.value === item.StatisticsType) {
						item.Unit = i.unit
						break
					}
				}
			},
			dataFormSubmit() {
				this.btnLoading = true
				SaveCostFilters(this.tableList).then(res => {
					this.btnLoading = false
					this.visible = false
					this.$emit("Submit")
				})

			},
			addItem(){
				console.log(this.tableList)
				for(let i=0;i<this.tableList.length;i++){
					if(!(this.tableList[i].StatisticsBasis && this.tableList[i].StatisticsType)){
						this.$message({
							type: 'error',
							message: '请先将表格填写完整！'
						});
						return
					}
				}
				let obj = {
					Id:null,
					StatisticsBasis:'',
					StatisticsType:'',
					Unit:'',
					Category:'',
					disabledStatisticsBasis:false,
					disabledCategory:false
				}
				this.tableList.push(obj)
				console.log(this.$refs.tableRef.$refs.JNPFTable)
				this.$nextTick(() => {
					this.$refs.tableRef.$refs.JNPFTable.bodyWrapper.scrollTop = this.$refs.tableRef.$refs.JNPFTable.bodyWrapper.scrollHeight
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.item-contaim {
		display: flex;
		justify-content: space-between;

		.label {
			flex: 1;
		}

		.icon {
			padding: 0 10px;
		}
	}
</style>
