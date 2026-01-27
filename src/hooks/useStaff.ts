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
      return (data as unknown as Staff[]).map(s => ({
        ...s,
        display_name: s.display_name ?? s.name.slice(-1)
      }));
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
    mutationFn: async ({ id, name, display_name, is_active }: { id: string; name?: string; display_name?: string; is_active?: boolean }) => {
      const updateData: { name?: string; display_name?: string; is_active?: boolean } = {};
      if (name !== undefined) updateData.name = name;
      if (display_name !== undefined) updateData.display_name = display_name;
      if (is_active !== undefined) updateData.is_active = is_active;
      
      const { data, error } = await supabase
        .from('staff')
        .update(updateData)
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
