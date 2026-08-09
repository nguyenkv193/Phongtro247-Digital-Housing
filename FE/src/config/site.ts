export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Phongtro247';

export const APP_DESCRIPTION = 'Tìm phòng trọ, nhà nguyên căn và căn hộ phù hợp.';

export function formatPageTitle(pageTitle: string): string {
    return pageTitle === APP_NAME ? APP_NAME : `${pageTitle} | ${APP_NAME}`;
}
