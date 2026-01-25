import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffManager } from './StaffManager';
import { Scheduler } from './Scheduler';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Calendar, Users, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminLayout() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('scheduler');

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-primary">排班管理系統</h1>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                管理後台
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">公開頁面</span>
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              排班管理
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              人員管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduler" className="animate-fade-in">
            <Scheduler />
          </TabsContent>

          <TabsContent value="staff" className="animate-fade-in">
            <StaffManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
