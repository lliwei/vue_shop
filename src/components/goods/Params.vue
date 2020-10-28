<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
    <!--  级联选择器  -->
      <el-cascader
        v-model="selectedCateKeys"
        :options="parentCateList"
        :props="cascaderProps"
        @change="handleChange"
        clearable></el-cascader>

      <!--  tab页  -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" size="mini"
                     @click="addDialogVisible=true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index,scope.row)">
                  {{item}}
                </el-tag>
                <!--      动态可编辑标签          -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit"
                           @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" size="mini"
                     @click="addDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index,scope.row)">
                  {{item}}
                </el-tag>
                <!--      动态可编辑标签          -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit"
                           @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog :title="titleText1 +titleText2" :visible.sync="addDialogVisible" width="50%"
               @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText2" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="isAdd===true?addParams():editParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // 父级分类的列表
      parentCateList: [],
      // 存储父级ID
      selectedCateKeys: [],
      // options属性指定选项数组即可渲染出一个级联选择器
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // hover 触发子菜单
        expandTrigger: 'hover',
      },
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 参数/属性对话框  显示：true   隐藏：false
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: '',
      },
      // 表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
      // 展示添加（true）或修改（false）动态参数对话框
      isAdd: true,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //  获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！');
      console.log(res.data);
      this.parentCateList = res.data;
      return true;
    },
    // 监听级联选择器选项变化
    handleChange() {
      console.log(this.selectedCateKeys);
      this.getParamsList();
    },
    // 切换tab
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsList();
    },
    // 获取参数列表
    async getParamsList() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return false;
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } });
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！');
      console.log(res.data);
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];
        // 控制文本框的显示与隐藏
        item.inputVisible = false;
        // tag下input框的文本值
        item.inputValue = '';
      });
      if (this.activeName === 'many') {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      return true;
    },
    // 添加属性
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return false;
        console.log(this.addForm.attr_name);
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          });
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！');
        console.log(res.data);
        this.$message.success('添加参数成功！');
        this.addDialogVisible = false;
        this.getParamsList();
        return true;
      });
    },
    // 点击按钮，显示编辑参数对话框
    showEditDialog(row) {
      console.log(row);
      this.isAdd = false;
      this.$nextTick(() => {
        this.addForm = JSON.parse(JSON.stringify(row));
      });
      this.addDialogVisible = true;
    },
    // 点击按钮，修改参数信息
    editParams() {
      console.log(this.addForm.attr_id);
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return false;
        console.log(this.addForm);
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.addForm.attr_id}`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          },
        );
        if (res.meta.status !== 200) return this.$message.error('更新参数失败！');
        console.log(res.data);
        this.$message.success('更新参数成功！');
        this.getParamsList();
        this.addDialogVisible = false;
        return true;
      });
    },
    // 关闭对话框，并重置表单内容
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.isAdd = true;
    },
    // 删除用户
    removeParams(attrId) {
      console.log(attrId);
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrId}`,
        );
        if (res.meta.status !== 200) return this.$message.error('删除参数失败！');
        this.getParamsList();
        this.$message.success('删除成功!');
        return true;
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // input框失焦后触发该函数
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false;
        row.inputValue = '';
        return false;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputVisible = false;
      row.inputValue = '';
      this.saveAttrVals(row);
      return true;
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      console.log(row.attr_id);
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(','),
        },
      );
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败！');
      this.$message.success('修改参数项成功！');
      return true;
    },
    // 删出参数选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      this.saveAttrVals(row);
    },
  },
  computed: {
    // 如果按钮需要被禁止，返回true
    isBtnDisabled() {
      if (this.selectedCateKeys.length === 3) return false;
      return true;
    },
    // 第三级分类ID
    cateId() {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2];
      return null;
    },
    // 动态计算对话框标题文本，添加或修改
    titleText1() {
      if (this.isAdd) return '添加';
      return '修改';
    },
    // 动态计算对话框标题文本，动态参数或静态属性
    titleText2() {
      if (this.activeName === 'many') {
        return '动态参数';
      }
      return '静态属性';
    },
  },
};
</script>

<style scoped>
.el-cascader{
  margin-top: 15px;
}
.el-tag{
  margin: 8px;
}
.input-new-tag{
  width: 120px;
}
</style>
