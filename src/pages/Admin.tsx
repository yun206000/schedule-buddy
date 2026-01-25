import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold">權限不足</h1>
          <p className="text-muted-foreground">
            您的帳號沒有管理員權限。<br />
            請聯繫系統管理員設定權限。
          </p>
        </div>
      </div>
    );
  }

  return <AdminLayout />;
};

export default Admin;
