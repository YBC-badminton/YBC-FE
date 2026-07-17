import api from './axios';

/**
 * 이미지를 서버에 업로드하고 저장된 imageUrl을 반환합니다.
 * 콘텐츠 수정 API(PATCH)에는 파일을 직접 보내지 않고,
 * 먼저 이 함수로 업로드한 뒤 반환된 imageUrl을 넣어주세요.
 *
 * POST /admin/images (multipart/form-data)
 * @param file 업로드할 파일
 * @param existingImageUrl 교체 대상이 되는 기존 이미지 URL (선택)
 */
export async function uploadImage(file: File, existingImageUrl?: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    if (existingImageUrl) {
        formData.append('existingImageUrl', existingImageUrl);
    }

    const response = await api.post<{ imageUrl: string }>('/admin/images', formData, {
        // FormData의 boundary를 axios가 자동 설정하도록 기본 JSON 헤더를 제거합니다.
        headers: { 'Content-Type': undefined },
    });

    return response.data.imageUrl;
}
