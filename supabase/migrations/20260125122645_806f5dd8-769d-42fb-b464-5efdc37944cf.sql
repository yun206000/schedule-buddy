-- 建立角色 Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 建立排程類型 Enum
CREATE TYPE public.schedule_type AS ENUM ('SHIFT', 'LEAVE');

-- 建立員工表
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 所有人可讀取員工資料（公開頁面需要）
CREATE POLICY "Anyone can view staff"
ON public.staff
FOR SELECT
USING (true);

-- 僅管理員可新增員工
CREATE POLICY "Admins can insert staff"
ON public.staff
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 僅管理員可更新員工
CREATE POLICY "Admins can update staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (true);

-- 僅管理員可刪除員工
CREATE POLICY "Admins can delete staff"
ON public.staff
FOR DELETE
TO authenticated
USING (true);

-- 建立排程表
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    type public.schedule_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_schedule_per_day UNIQUE (date, staff_id)
);

-- 建立日期索引
CREATE INDEX idx_schedules_date ON public.schedules(date);
CREATE INDEX idx_schedules_staff_id ON public.schedules(staff_id);

-- 啟用 RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 所有人可讀取排程（公開頁面需要）
CREATE POLICY "Anyone can view schedules"
ON public.schedules
FOR SELECT
USING (true);

-- 僅管理員可新增排程
CREATE POLICY "Admins can insert schedules"
ON public.schedules
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 僅管理員可更新排程
CREATE POLICY "Admins can update schedules"
ON public.schedules
FOR UPDATE
TO authenticated
USING (true);

-- 僅管理員可刪除排程
CREATE POLICY "Admins can delete schedules"
ON public.schedules
FOR DELETE
TO authenticated
USING (true);

-- 建立角色表（安全存儲角色）
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 啟用 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 用戶可以查看自己的角色
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 建立安全函數檢查角色
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 建立函數更新 updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 建立觸發器
CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();