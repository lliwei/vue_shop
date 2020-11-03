<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <!--  搜索    -->
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input v-model="queryInfo.query" placeholder="请输入内容"
                      clearable @clear="getGoodsList" @blur="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </div>
        </el-col>
      </el-row>
      <!--   商品列表区域   -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="85px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot:default="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot:default="slot">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeUser(slot.row.goods_id)"></el-button>
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
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  data() {
    return {
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 每页展示多少条
        pagesize: 8,
      },
      goodsList: [],
      total: 0,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！');
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
      return true;
    },
    // 监听 pagesize
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getGoodsList();
      console.log(newPageSize);
    },
    // 监听 页码值
    handleCurrentChange(newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage;
      this.getGoodsList();
      console.log(newCurrentPage);
    },
    // 删除商品
    removeUser(id) {
      console.log(id);
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${id}`);
        if (res.meta.status !== 200) return this.$message.error('删除商品失败！');
        this.getGoodsList();
        this.$message.success('删除成功!');
        return true;
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    addGoods() {
      this.$router.push('/goods/add');
    },
  },
};
</script>

<style scoped>

</style>
