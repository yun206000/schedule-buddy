import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // 檢查是否為管理員
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    // 初始獲取 session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!data);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: '登入失敗',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: '登入成功',
      description: '歡迎回來！',
    });
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: '已登出',
      description: '期待您再次使用',
    });
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: '註冊失敗',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: '註冊成功',
      description: '請前往管理後台設定管理員權限',
    });
    return true;
  };

  return {
    user,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    signUp,
  };
}
