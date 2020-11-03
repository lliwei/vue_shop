<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--   商品分类展示表格   -->
      <tree-table class="tree_table"
                  :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  border show-index
                  index-text="#"
                  :show-row-hover="false">
        <!--    是否有序    -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
             style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!--    排序    -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--    操作    scope="scope"-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"
                     @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"
                     @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!--   分页   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%">
      <el-form ref="addCateFormRef" :rules="cateFormRules"
               :model="addCateForm" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
      <!--     级联选择器     -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
    <!--   编辑分类名称  -->
    <el-dialog
      title="修改分类名称"
      :visible.sync="editCatedialogVisible"
      width="50%">
      <el-form ref="editCateFormRef" :rules="cateFormRules"
               :model="editCateForm" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      //  商品分类数据列表
      cateList: [],
      // 获取商品分类的查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isOk',
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        },
      ],
      // 表格总数居条数
      total: 0,
      // 添加分类框 默认隐藏（false),显示（true）
      addCatedialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        // 父类id
        cat_pid: 0,
        // 分类层级，默认要添加的是1级分类
        cat_level: 0,
      },
      // 添加分类验证规则
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 存储父级ID
      selectedKeys: [],
      // options属性指定选项数组即可渲染出一个级联选择器
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // hover 触发子菜单
        expandTrigger: 'hover',
        // 选中任意一项
        checkStrictly: true,
      },
      // 添加分类框 默认隐藏（false),显示（true）
      editCatedialogVisible: false,
      // 修改分类名称表单数据
      editCateForm: {},
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！');
      this.cateList = res.data.result;
      this.total = res.data.total;
      console.log(res.data);
      return true;
    },
    // 监听 pageSize改变
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getCateList();
    },
    // 监听 page改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击展示添加分类框
    showAddCateDialog() {
      this.addCatedialogVisible = true;
      this.getParentCateList();
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！');
      console.log(res.data);
      this.parentCateList = res.data;
      return true;
    },
    // 级联选择器的选项发生变化时触发这个函数
    handleChange() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加商品分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return false;
        const { data: res } = await this.$http.post('categories', this.addCateForm);
        if (res.meta.status !== 201) return this.$message.error('添加商品分类失败！');
        this.getCateList();
        console.log(res.data);
        this.addCatedialogVisible = false;
        return true;
      });
    },
    // 展示编辑分类名称对话框
    async showEditDialog(cateId) {
      console.log(cateId);
      const { data: res } = await this.$http.get(`categories/${cateId}`);
      if (res.meta.status !== 200) return this.$message.error('获取分类名称失败！');
      console.log(res.data);
      this.editCateForm = res.data;
      this.editCatedialogVisible = true;
      return true;
    },
    // 点击按钮，提交修改
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return false;
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`,
          { cat_name: this.editCateForm.cat_name });
        if (res.meta.status !== 200) return this.$message.error('更新分类名称失败！');
        console.log(res.data);
        this.editCatedialogVisible = false;
        this.getCateList();
        this.$message.success('更新分类名称成功！');
        return true;
      });
    },
    // 根据分类id，删除分类
    removeCate(id) {
      console.log(id);
      console.log(this.cateList);
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${id}`);
        if (res.meta.status !== 200) return this.$message.error('删除分类失败！');
        if (this.cateList.length === 1) {
          this.queryInfo.pagenum -= 1;
        }
        this.getCateList();
        this.$message.success('删除成功!');
        console.log(this.queryInfo);
        return true;
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },

  },
};
</script>

<style scoped>
.tree_table{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
