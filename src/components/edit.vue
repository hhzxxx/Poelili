<template>
	<el-dialog v-model="sdata.dialogFormVisible" title="Shipping address">
		<el-form ref="form" :model="sdata">
			<el-form-item size="mini" label="">
				<el-select
					fit-input-width="true"
					v-model="sdata.domain"
					placeholder="serve"
				>
					<el-option label="腾讯" value="1"></el-option>
					<el-option label="国际" value="2"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item size="mini" label="">
				<el-select
					fit-input-width="true"
					v-model="sdata.league"
					placeholder="league"
				>
					<el-option
						v-for="(item, index1) in leagues[sdata.domain]"
						:key="index1"
						:label="item.id"
						:value="item.id"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="">
				<el-input v-model="sdata.code" placeholder="code"></el-input>
			</el-form-item>
			<el-form-item label="">
				<el-input v-model="sdata.name" placeholder="reamrk"></el-input>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>

<script>
export default {
	name: 'HelloWorld',
	props: {
		data: Object,
		leagues: Object,
	},
	data() {
		return {
			sdata: this.data,
		}
	},
	created() {},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
