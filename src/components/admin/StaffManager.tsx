import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaff } from '@/hooks/useStaff';
import { Plus, Pencil, Trash2, Check, X, Users, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function StaffManager() {
  const { staff, isLoading, addStaff, updateStaff, deleteStaff } = useStaff();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDisplayName, setEditingDisplayName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addStaff.mutate(newName.trim());
      setNewName('');
    }
  };

  const handleStartEdit = (id: string, name: string, displayName: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingDisplayName(displayName);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateStaff.mutate({ 
        id: editingId, 
        name: editingName.trim(),
        display_name: editingDisplayName.trim() || editingName.trim().slice(-1)
      });
      setEditingId(null);
      setEditingName('');
      setEditingDisplayName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDisplayName('');
  };

  const handleToggleActive = (id: string, currentState: boolean) => {
    updateStaff.mutate({ id, is_active: !currentState });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>人員管理</CardTitle>
            <CardDescription>新增、編輯或刪除員工</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 新增員工 */}
        <div className="flex gap-2">
          <Input
            placeholder="輸入員工姓名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button 
            onClick={handleAdd} 
            disabled={!newName.trim() || addStaff.isPending}
            className="btn-gradient-primary shrink-0"
          >
            {addStaff.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                新增
              </>
            )}
          </Button>
        </div>

        {/* 員工列表 */}
        <div className="space-y-2">
          {staff.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">尚無員工資料</p>
          ) : (
            staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {editingId === s.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">姓名</Label>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="w-full sm:w-20">
                      <Label className="text-xs text-muted-foreground mb-1 block">簡稱</Label>
                      <Input
                        value={editingDisplayName}
                        onChange={(e) => setEditingDisplayName(e.target.value)}
                        placeholder={editingName.slice(-1)}
                        maxLength={2}
                      />
                    </div>
                    <div className="flex items-end gap-1">
                      <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-2">
                      <span className={`${!s.is_active ? 'text-muted-foreground line-through' : ''}`}>
                        {s.name}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        簡稱: {s.display_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${s.id}`} className="text-xs text-muted-foreground">
                        啟用
                      </Label>
                      <Switch
                        id={`active-${s.id}`}
                        checked={s.is_active}
                        onCheckedChange={() => handleToggleActive(s.id, s.is_active)}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(s.id, s.name, s.display_name)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>確認刪除</AlertDialogTitle>
                          <AlertDialogDescription>
                            確定要刪除員工「{s.name}」嗎？此操作將同時刪除該員工的所有排班記錄。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteStaff.mutate(s.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            刪除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
