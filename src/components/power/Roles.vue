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
        <el-table-column type="expand">
          <template v-slot:default="slot">
            <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '','vcenter']"
                    v-for="(item1,index1) in slot.row.children" :key="item1.id">
              <!--    一级权限          -->
              <el-col :span="5">
                <el-tag closable>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--    二级和三级权限          -->
              <el-col :span="19">
                <el-row :class="[index2 === 0 ? '': 'bdtop','vcenter']"
                        v-for="(item2,index2) in item1.children" :key="item2.id">
                  <!--    二级权限          -->
                  <el-col :span="6">
                    <el-tag type="success" closable>{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--    三级权限          -->
                  <el-col :span="18">
                    <el-tag type="warning" closable v-for="item3 in item2.children"
                            :key="item3.id" @close="removePowerById(slot.row,item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(slot.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeRole(slot.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini"
                       @click="assignPower(slot.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialog"
               width="50%" @close="addDialogClosed">
      <el-form :model="addRoleFrom" :rules="RoleRules" ref="addRoleRef" label-width="80px">
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
      <el-form :model="editRoleForm" :rules="RoleRules" ref="editRoleRef" label-width="80px">
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

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="assignPowerVisible"
               width="50%" @close="assignPowerClosed">
      <!--  树形控件  -->
      <el-tree :data="powerlist" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignPowerVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
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
      RoleRules: {
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
      // 控制分配权限框的显示(true)与隐藏(false)
      assignPowerVisible: false,
      // 所有权限的数据
      powerlist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      // 三级权限id
      defKeys: [],
      roleId: '',
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
    // 通过Id删除用户权限
    removePowerById(role, id) {
      console.log(role);
      console.log(id);
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`);
        if (res.meta.status !== 200) return this.$message.error('删除权限失败！');
        role.children = res.data;
        this.$message.success('删除权限成功!');
        return true;
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 展示分配权限的对话框
    async assignPower(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！');
      this.powerlist = res.data;
      this.assignPowerVisible = true;
      this.getLeafKeys(role, this.defKeys);
      console.log(this.powerlist);
      return true;
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children，则是三级权限
      if (!node.children) return arr.push(node.id);
      // 递归获取三级权限的id
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
      return true;
    },
    // 监听分配权限对话框的关闭事件
    assignPowerClosed() {
      this.defKeys = [];
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(',');
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr });
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！');
      }

      this.$message.success('分配权限成功！');
      this.getRoleList();
      this.assignPowerVisible = false;
      console.log(idStr);
      return true;
    },
  },
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.bdtop {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
