-- ==========================================
-- 냥타임 인증+그룹 마이그레이션 스크립트
-- Supabase SQL Editor에서 순서대로 실행하세요
-- ==========================================

-- ==========================================
-- Step 1: 새 테이블 생성
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT '우리집',
    invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- ==========================================
-- Step 2: 기존 테이블에 group_id 컬럼 추가 (nullable)
-- ==========================================

ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);
ALTER TABLE public.hospital_logs ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);
ALTER TABLE public.care_todos ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);
ALTER TABLE public.health_logs ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);

-- ==========================================
-- Step 3: RLS 헬퍼 함수
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_user_group_ids() RETURNS SETOF UUID AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ==========================================
-- Step 4: 회원가입 자동 처리 트리거
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  new_group_id UUID;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '냥집사'));

  INSERT INTO public.groups (name, created_by)
  VALUES ('우리집', NEW.id)
  RETURNING id INTO new_group_id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (new_group_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- Step 5: 초대 코드 함수
-- ==========================================

CREATE OR REPLACE FUNCTION public.join_group_by_code(code TEXT) RETURNS UUID AS $$
DECLARE
  found_group_id UUID;
BEGIN
  SELECT id INTO found_group_id FROM public.groups WHERE invite_code = code;

  IF found_group_id IS NULL THEN
    RAISE EXCEPTION '유효하지 않은 초대 코드입니다.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = found_group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION '이미 이 그룹의 멤버입니다.';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (found_group_id, auth.uid(), 'member');

  RETURN found_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- Step 6: 새 테이블 RLS
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can view group members profiles" ON public.profiles FOR SELECT
  USING (id IN (
    SELECT gm.user_id FROM public.group_members gm
    WHERE gm.group_id IN (SELECT public.get_user_group_ids())
  ));

CREATE POLICY "Users can view own groups" ON public.groups FOR SELECT
  USING (id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Owners can update groups" ON public.groups FOR UPDATE
  USING (id IN (
    SELECT group_id FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT
  USING (group_id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Users can insert self as member" ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can delete members" ON public.group_members FOR DELETE
  USING (group_id IN (
    SELECT group_id FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- ==========================================
-- Step 7: 기존 RLS 정책 교체
-- (기존 "Allow all" 정책 삭제 후 그룹 기반 정책 생성)
-- ==========================================

DROP POLICY IF EXISTS "Allow all operations for cats" ON public.cats;
DROP POLICY IF EXISTS "Allow all operations for hospital_logs" ON public.hospital_logs;
DROP POLICY IF EXISTS "Allow all operations for care_todos" ON public.care_todos;
DROP POLICY IF EXISTS "Allow all operations for food_logs" ON public.food_logs;
DROP POLICY IF EXISTS "Allow all operations for health_logs" ON public.health_logs;

CREATE POLICY "Group access for cats" ON public.cats FOR ALL
  USING (group_id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Group access for hospital_logs" ON public.hospital_logs FOR ALL
  USING (group_id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Group access for care_todos" ON public.care_todos FOR ALL
  USING (group_id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Group access for food_logs" ON public.food_logs FOR ALL
  USING (group_id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Group access for health_logs" ON public.health_logs FOR ALL
  USING (group_id IN (SELECT public.get_user_group_ids()));

-- ==========================================
-- Step 8: 기존 데이터 마이그레이션
-- 첫 사용자 회원가입 후 생성된 group_id로 교체하세요
-- ==========================================

-- 아래 '<YOUR_GROUP_ID>'를 실제 그룹 ID로 교체 후 실행:
--
-- UPDATE public.cats SET group_id = '<YOUR_GROUP_ID>' WHERE group_id IS NULL;
-- UPDATE public.hospital_logs SET group_id = '<YOUR_GROUP_ID>' WHERE group_id IS NULL;
-- UPDATE public.care_todos SET group_id = '<YOUR_GROUP_ID>' WHERE group_id IS NULL;
-- UPDATE public.food_logs SET group_id = '<YOUR_GROUP_ID>' WHERE group_id IS NULL;
-- UPDATE public.health_logs SET group_id = '<YOUR_GROUP_ID>' WHERE group_id IS NULL;
--
-- 마이그레이션 완료 후 NOT NULL 제약 추가:
-- ALTER TABLE public.cats ALTER COLUMN group_id SET NOT NULL;
-- ALTER TABLE public.hospital_logs ALTER COLUMN group_id SET NOT NULL;
-- ALTER TABLE public.care_todos ALTER COLUMN group_id SET NOT NULL;
-- ALTER TABLE public.food_logs ALTER COLUMN group_id SET NOT NULL;
-- ALTER TABLE public.health_logs ALTER COLUMN group_id SET NOT NULL;
