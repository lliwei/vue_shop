<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <!--  搜索    -->
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input v-model="queryInfo.query" placeholder="请输入内容"
                      clearable @clear="getOrdersList" @blur="getOrdersList">
              <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
            </el-input>
          </div>
        </el-col>
      </el-row>
      <!--   订单列表区域   -->
      <el-table :data="ordersList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="200px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template v-slot:default="scope">
            <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="160px">
          <template v-slot:default="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template>
            <el-tooltip effect="dark" content="修改地址" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="addressVisible = true"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="物流信息" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-location" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--   分页  -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%"
                 @close="addDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules"
                 ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
      </el-dialog>
      <!--  物流信息对话款   -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">

      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata';

export default {
  name: 'Order',
  data() {
    return {
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 每页展示多少条
        pagesize: 8,
      },
      ordersList: [],
      total: 0,
      // 修改地址对话框
      addressVisible: false,
      // 表单数据对象
      addressForm: {
        address1: [],
        address2: '',
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
        ],
      },
      cityData,
      // 展示物流信息对话款
      progressVisible: false,
      // 物流数据列表
      progressInfo: [],
    };
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    // 获取商品数据
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！');
      this.ordersList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
      return true;
    },
    // 监听 pagesize
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getOrdersList();
      console.log(newPageSize);
    },
    // 监听 页码值
    handleCurrentChange(newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage;
      this.getOrdersList();
      console.log(newCurrentPage);
    },
    // 关闭修改地址对话框，清空表单值
    addDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 展示物流对话款
    // async showProgressDialog() {
    //   const { data: res } = await this.$http.get('/kuaidi/1106975712662');
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('获取物流进度失败！');
    //   }
    //   this.progressInfo = res.data;
    //   this.progressVisible = true;
    //   console.log(this.progressInfo);
    //   return true;
    // },
  },
};
</script>

<style scoped>
.el-cascader{
  width: 100%;
}
</style>
