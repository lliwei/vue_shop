<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <!--  搜索    -->
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!--   用户列表区域   -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template v-slot:default="scope">
            <el-switch v-model="scope.row.mg_state"
                       @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot:default="slot">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(slot.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeUser(slot.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--   分页  -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible"
               width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible"
               width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'User',
  data() {
    // 验证邮箱的规则
    const checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9]+)*@([A-Za-z0-9_-]+\.)+[A-Za-z]{2,6}$/;
      if (regEmail.test(value)) {
        // 合法的邮箱
        callback();
      } else {
        callback(new Error('请输入合法的邮箱'));
      }
    };
    // 验证手机号的规则
    const checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        // 合法手机号
        callback();
      } else {
        callback(new Error('请输入合法的手机号'));
      }
    };
    return {
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 每页展示多少条
        pagesize: 5,
      },
      userlist: [],
      total: 0,
      // 控制添加用户框的显示(true)与隐藏(false)
      addDialogVisible: false,
      // 表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6, max: 15, message: '密码的长度在6~15个字符之间', trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 控制修改用户框的显示(true)与隐藏(false)
      editDialogVisible: false,
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获取用户数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！');
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
      return true;
    },
    // 监听 pagesize
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getUserList();
      console.log(newPageSize);
    },
    // 监听 页码值
    handleCurrentChange(newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage;
      this.getUserList();
      console.log(newCurrentPage);
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
      if (res.meta.status === 200) {
        this.$message.success('更新用户状态成功！');
      } else {
        userInfo.mg_state = !userInfo.mg_state;
        this.$message.error('更新用户状态失败！');
      }
      console.log(userInfo.mg_state);
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 添加用户对话框内容重置
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return false;
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) return this.$message.error('添加用户失败！');
        this.$message.success('添加用户成功！');
        this.addDialogVisible = false;
        this.getUserList();
        return true;
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！');
      this.editForm = res.data;
      this.editDialogVisible = true;
      return true;
    },
    // 关闭修改用户对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮，修改用户
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return false;
        // 发起更新用户的网络请求
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile });
        if (res.meta.status !== 200) return this.$message.error('更新用户失败！');
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success('更新用户成功！');
        return true;
      });
    },
    // 删除用户
    removeUser(id) {
      console.log(id);
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(`users/${id}`);
        if (res.meta.status !== 200) return this.$message.error('删除用户失败！');
        this.getUserList();
        this.$message.success('删除成功!');
        return true;
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
  },
};
</script>

<style scoped>

</style>
