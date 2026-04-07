/**
 * IndexedDB Storage 유틸리티
 * idb-keyval 라이브러리를 사용하여 간단한 IndexedDB 인터페이스 제공
 */

import { get, set, del, clear } from 'idb-keyval';
import { devLog } from '../utils/devConsole';

/**
 * IndexedDB에 데이터 저장
 */
export async function setStorage<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
    devLog('💾 [Storage] 데이터 저장 완료:', {
      키: key,
      데이터타입: typeof value,
      데이터크기: JSON.stringify(value).length + ' bytes',
      시간: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error('❌ [Storage] 데이터 저장 실패:', {
      키: key,
      오류: error,
      시간: new Date().toLocaleTimeString(),
    });
    throw error;
  }
}

/**
 * IndexedDB에서 데이터 읽기
 */
export async function getStorage<T>(key: string): Promise<T | undefined> {
  try {
    const value = await get<T>(key);
    devLog('📖 [Storage] 데이터 읽기:', {
      키: key,
      발견여부: value !== undefined,
      시간: new Date().toLocaleTimeString(),
    });
    return value;
  } catch (error) {
    console.error('❌ [Storage] 데이터 읽기 실패:', {
      키: key,
      오류: error,
      시간: new Date().toLocaleTimeString(),
    });
    return undefined;
  }
}

/**
 * IndexedDB에서 데이터 삭제
 */
export async function deleteStorage(key: string): Promise<void> {
  try {
    await del(key);
    devLog('🗑️ [Storage] 데이터 삭제 완료:', {
      키: key,
      시간: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error('❌ [Storage] 데이터 삭제 실패:', {
      키: key,
      오류: error,
      시간: new Date().toLocaleTimeString(),
    });
    throw error;
  }
}

/**
 * IndexedDB 전체 데이터 삭제
 */
export async function clearStorage(): Promise<void> {
  try {
    await clear();
    devLog('🗑️ [Storage] 전체 데이터 삭제 완료:', {
      시간: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error('❌ [Storage] 전체 데이터 삭제 실패:', {
      오류: error,
      시간: new Date().toLocaleTimeString(),
    });
    throw error;
  }
}
