import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase 환경변수가 설정되지 않았습니다.")
}

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'public-anon-key')

// 유틸리티 함수: 스토리지에 파일 업로드하고 Public URL 반환
export const uploadImage = async (file, bucket = 'nyangtime-storage') => {
  if (!file) return null;
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  // 로직 간소화를 위해 base64(data url)인 경우 File 객체로 변환
  let fileToUpload = file;
  if (typeof file === 'string' && file.startsWith('data:')) {
    const arr = file.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    fileToUpload = new File([u8arr], fileName, { type: mime });
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}
