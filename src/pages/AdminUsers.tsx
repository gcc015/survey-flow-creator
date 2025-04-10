
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from '@/App';

type User = {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('获取用户列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('请输入邮箱和密码');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '添加用户失败');
      }
      
      toast.success('用户添加成功');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error instanceof Error ? error.message : '添加用户失败');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="邮箱"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <div>
              <Input
                placeholder="密码"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            <div>
              <Button type="submit">添加用户</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>加载中...</p>
          ) : users.length === 0 ? (
            <p>没有找到用户</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">ID</th>
                    <th className="text-left py-2 px-4">邮箱</th>
                    <th className="text-left py-2 px-4">管理员</th>
                    <th className="text-left py-2 px-4">创建时间</th>
                    <th className="text-left py-2 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{user.id}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">{user.is_admin ? '是' : '否'}</td>
                      <td className="py-2 px-4">{new Date(user.created_at).toLocaleString()}</td>
                      <td className="py-2 px-4">
                        <Button variant="destructive" size="sm" onClick={() => {/* 实现删除功能 */}}>
                          删除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
