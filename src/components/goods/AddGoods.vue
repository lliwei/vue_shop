<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!--   步骤条   -->
      <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--    tab栏  -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top" >
        <!--   tab栏   -->
        <el-tabs :tab-position="'left'" v-model="activeIndex"
                 :before-leave="beforeTabLeave" @tab-click="handleTabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <!--  级联选择器  -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cascaderProps"
                @change="handleChange"
                clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name"
                          v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val" border
                             v-for="(val,index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name"
                          v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :headers="headersObj"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button size="small" type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      title="图片预览"
      :visible.sync="imgVisible"
      width="50%">
      <img :src="imgSrc" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddGoods',
  data() {
    return {
      activeIndex: 0,
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        goods_cat: [],
        // 上传的图片临时路径（对象）
        pics: [],
        goods_introduce: '',
        // 商品的参数（数组）
        attrs: [],
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
      },
      // 商品分类列表
      catelist: [],
      // options属性指定选项数组即可渲染出一个级联选择器
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // hover 触发子菜单
        expandTrigger: 'hover',
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的url地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      headersObj: {
        Authorization: sessionStorage.getItem('token'),
      },
      // 图片预览对话框
      imgVisible: false,
      // 图片预览地址
      imgSrc: '',
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
  methods: {
    //  获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！');
      console.log(res.data);
      this.catelist = res.data;
      return true;
    },
    // 级联选择器 选项发生变化触发该函数
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 切换标签之前的钩子,若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！');
        return false;
      }
      return true;
    },
    // 切换tab
    handleTabClick() {
      console.log(this.activeIndex);
      switch (this.activeIndex) {
        case '1':
          this.getParamsList('many');
          break;
        case '2':
          this.getParamsList('only');
          break;
        default: break;
      }
    },
    // 获取参数列表
    async getParamsList(sel) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: `${sel}` } });
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！');
      if (sel === 'many') {
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];
        });
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      console.log(res.data);
      return true;
    },
    // 文件上传成功时的钩子
    handleSuccess(response) {
      console.log(response);
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      console.log(file);
      this.imgSrc = file.response.data.url;
      this.imgVisible = true;
    },
    // 移除图片
    handleRemove(file) {
      console.log(file);
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
    },
    addGoods() {
      console.log(this.addForm);
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请填写必要的表单项！');
          return false;
        }
        const form = JSON.parse(JSON.stringify(this.addForm));
        form.goods_cat = form.goods_cat.join(',');

        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form);
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form);

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！');
        }

        this.$message.success('添加商品成功！');
        this.$router.push('/goods');
        return true;
      });
    },
  },
};
</script>

<style scoped>
.el-steps{
  margin: 15px 0;
}
.el-checkbox{
  margin: 0 8px !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>
