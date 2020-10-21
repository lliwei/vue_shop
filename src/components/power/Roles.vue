<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col>
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addRoleDialog = true">添加角色</el-button>
          </div>
        </el-col>
      </el-row>
      <!--   角色列表区域   -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand"></el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="slot">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(slot.row.id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeRole(slot.row.id)">删除</el-button>
              <el-button type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialog"
               width="50%" @close="addDialogClosed">
      <el-form :model="addRoleFrom" :rules="addRoleRules" ref="addRoleRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible"
               width="50%" @close="editDialogClosed">
      <el-form :model="editRoleForm" :rules="addRoleRules" ref="editRoleRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRole">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [],
      // 控制添加角色框的显示(true)与隐藏(false)
      addRoleDialog: false,
      // 表单数据
      addRoleFrom: {
        roleName: '',
        roleDesc: '',
      },
      // 添加表单验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2, max: 10, message: '角色名的长度在3~10个字符之间', trigger: 'blur',
          },
        ],
        roleDesc: [
          { message: '请输入角色描述', trigger: 'blur' },
        ],
      },
      // 控制修改角色框的显示(true)与隐藏(false)
      editDialogVisible: false,
      editRoleForm: {},
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    // 获取角色数据
    async getRoleList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
      this.roleList = res.data;
      console.log(this.roleList);
      return true;
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed() {
      // 添加角色对话框内容重置
      this.$refs.addRoleRef.resetFields();
    },
    // 点击按钮，添加新角色
    addRoles() {
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) return false;
        // 发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleFrom);
        if (res.meta.status !== 201) return this.$message.error('添加角色失败！');
        this.$message.success('添加角色成功！');
        this.addRoleDialog = false;
        this.getRoleList();
        return true;
      });
    },
    // 展示编辑角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败！');
      this.editRoleForm = res.data;
      this.editDialogVisible = true;
      return true;
    },
    // 关闭修改角色对话框
    editDialogClosed() {
      this.$refs.editRoleRef.resetFields();
    },
    // 点击按钮，修改角色
    editRole() {
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) return false;
        // 发起更新角色的网络请求
        const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`,
          { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc });
        if (res.meta.status !== 200) return this.$message.error('更新角色失败！');
        this.editDialogVisible = false;
        this.getRoleList();
        this.$message.success('更新角色成功！');
        return true;
      });
    },
    // 删除角色
    removeRole(id) {
      console.log(id);
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${id}`);
        if (res.meta.status !== 200) return this.$message.error('删除角色失败！');
        this.getRoleList();
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
