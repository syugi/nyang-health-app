-- ==========================================
-- 냥타임(NyangTime) Supabase DB 스키마
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS(Row Level Security) 설정 (현재는 단일 사용자이므로 모두 허용)
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for cats" ON public.cats FOR ALL USING (true);
CREATE POLICY "Allow all operations for hospital_logs" ON public.hospital_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations for care_todos" ON public.care_todos FOR ALL USING (true);
CREATE POLICY "Allow all operations for food_logs" ON public.food_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations for health_logs" ON public.health_logs FOR ALL USING (true);

-- ==========================================
-- 6. Storage Bucket (파일 업로드 스토리지)
-- ==========================================
-- 'nyangtime-storage'라는 이름의 Public 버킷을 생성합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('nyangtime-storage', 'nyangtime-storage', true)
ON CONFLICT (id) DO NOTHING;

-- 스토리지 객체에 대한 모든 권한 허용 (개발 환경용)
CREATE POLICY "Allow all storage operations" ON storage.objects FOR ALL USING (bucket_id = 'nyangtime-storage');
