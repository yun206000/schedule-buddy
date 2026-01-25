import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/types/schedule';
import { toast } from '@/hooks/use-toast';

export function useStaff() {
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading, error } = useQuery({
    queryKey: ['staff'],
    queryFn: async (): Promise<Staff[]> => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const activeStaff = staff.filter(s => s.is_active);

  const addStaff = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('staff')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: '成功', description: '員工已新增' });
    },
    onError: (error) => {
      toast({ title: '錯誤', description: error.message, variant: 'destructive' });
    },
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, name, is_active }: { id: string; name?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('staff')
        .update({ name, is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: '成功', description: '員工已更新' });
    },
    onError: (error) => {
      toast({ title: '錯誤', description: error.message, variant: 'destructive' });
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: '成功', description: '員工已刪除' });
    },
    onError: (error) => {
      toast({ title: '錯誤', description: error.message, variant: 'destructive' });
    },
  });

  return {
    staff,
    activeStaff,
    isLoading,
    error,
    addStaff,
    updateStaff,
    deleteStaff,
  };
}
