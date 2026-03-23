-- ==========================================
-- 냥타임(NyangTime) Supabase DB 스키마
-- ==========================================

-- ==========================================
-- 0. 사용자/그룹 관련 테이블
-- ==========================================

-- profiles (사용자 프로필)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- groups (그룹/가구 단위)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT '우리집',
    invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- group_members (그룹 멤버 매핑)
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- ==========================================
-- 1. 데이터 테이블
-- ==========================================

-- 1. cats (고양이 프로필 테이블)
CREATE TABLE IF NOT EXISTS public.cats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    emoji TEXT,
    avatar_url TEXT,
    birthday DATE,
    accent TEXT NOT NULL DEFAULT '#F4A261',
    light TEXT NOT NULL DEFAULT '#FFF3E8',
    group_id UUID REFERENCES public.groups(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. hospital_logs (병원 기록 테이블)
CREATE TABLE IF NOT EXISTS public.hospital_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hospital_name TEXT,
    weight NUMERIC,
    purpose TEXT NOT NULL,
    treatment TEXT,
    aftercare TEXT,
    next_visit DATE,
    attachments TEXT[],
    group_id UUID REFERENCES public.groups(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. care_todos (케어/할일 테이블)
CREATE TABLE IF NOT EXISTS public.care_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('once', 'routine')),
    done BOOLEAN NOT NULL DEFAULT false,
    done_date DATE,
    source_log_id UUID REFERENCES public.hospital_logs(id) ON DELETE SET NULL,
    group_id UUID REFERENCES public.groups(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. food_logs (사료/간식 구매 및 기록 테이블)
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_date DATE NOT NULL,
    name TEXT NOT NULL,
    weight_kg NUMERIC,
    qty INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL DEFAULT 0,
    memo TEXT,
    photo_url TEXT,
    group_id UUID REFERENCES public.groups(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. health_logs (건강 이상 기록 테이블)
CREATE TABLE IF NOT EXISTS public.health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
    datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    group_id UUID REFERENCES public.groups(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- RLS 헬퍼 함수
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_user_group_ids() RETURNS SETOF UUID AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ==========================================
-- RLS(Row Level Security) 설정
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 프로필만 접근
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- profiles: 같은 그룹 멤버의 프로필 조회 허용
CREATE POLICY "Users can view group members profiles" ON public.profiles FOR SELECT
  USING (id IN (
    SELECT gm.user_id FROM public.group_members gm
    WHERE gm.group_id IN (SELECT public.get_user_group_ids())
  ));

-- groups: 자신이 속한 그룹만 조회
CREATE POLICY "Users can view own groups" ON public.groups FOR SELECT
  USING (id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Owners can update groups" ON public.groups FOR UPDATE
  USING (id IN (
    SELECT group_id FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- group_members: 자신이 속한 그룹의 멤버 조회
CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT
  USING (group_id IN (SELECT public.get_user_group_ids()));
CREATE POLICY "Users can insert self as member" ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can delete members" ON public.group_members FOR DELETE
  USING (group_id IN (
    SELECT group_id FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- 데이터 테이블 5개: 그룹 기반 접근 제어
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
-- 회원가입 시 자동 처리 트리거
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  new_group_id UUID;
BEGIN
  -- 1. profiles 레코드 생성
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '냥집사'));

  -- 2. 기본 그룹 '우리집' 생성
  INSERT INTO public.groups (name, created_by)
  VALUES ('우리집', NEW.id)
  RETURNING id INTO new_group_id;

  -- 3. group_members에 owner로 추가
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (new_group_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 초대 코드로 그룹 참여 함수
-- ==========================================

CREATE OR REPLACE FUNCTION public.join_group_by_code(code TEXT) RETURNS UUID AS $$
DECLARE
  found_group_id UUID;
BEGIN
  SELECT id INTO found_group_id FROM public.groups WHERE invite_code = code;

  IF found_group_id IS NULL THEN
    RAISE EXCEPTION '유효하지 않은 초대 코드입니다.';
  END IF;

  -- 이미 멤버인지 확인
  IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = found_group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION '이미 이 그룹의 멤버입니다.';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (found_group_id, auth.uid(), 'member');

  RETURN found_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 6. Storage Bucket (파일 업로드 스토리지)
-- ==========================================
-- 'nyangtime-storage'라는 이름의 Public 버킷을 생성합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('nyangtime-storage', 'nyangtime-storage', true)
ON CONFLICT (id) DO NOTHING;

-- 스토리지 객체에 대한 모든 권한 허용 (개발 환경용)
CREATE POLICY "Allow all storage operations" ON storage.objects FOR ALL USING (bucket_id = 'nyangtime-storage');
