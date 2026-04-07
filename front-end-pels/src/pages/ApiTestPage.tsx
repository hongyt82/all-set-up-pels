import { useEffect, useState } from 'react';
import { getHttpClient } from '../lib/http';
import {
  UsersRepository,
  type UserDto,
} from '../lib/repository/UsersRepository';
import { getEffectiveApiBaseUrl } from '../constants/config';
import { FileUpload } from '../components/common/FileUpload';
import { FileDownload } from '../components/common/FileDownload';
import { fileService, type UploadProgress } from '../lib/fileService';
import { api, createRequestBuilder } from '../lib/requestBuilder';
import { devLog } from '../utils/devConsole';

export function ApiTestPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const http = getHttpClient();
  const repo = new UsersRepository(http);

  useEffect(() => {
    // initial fetch
    // void handleList();
  }, []);

  async function handleList() {
    setLoading(true);
    setError(null);
    try {
      const data = await repo.list();
      // Check if it's a mock response from development fallback
      if (
        data &&
        Array.isArray(data) &&
        data.length === 0 &&
        (data as any).error === 'API server not available'
      ) {
        setError('API 서버가 연결되지 않았습니다. Mock 데이터를 사용하세요.');
        setUsers([]);
      } else {
        setUsers(data);
      }
    } catch (e: any) {
      // Handle timeout and connection errors gracefully
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
        setUsers([]);
      } else {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        setError(`List Error: ${errorMsg}`);
      }
      console.error('list error', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const created = await repo.create({ name: 'New User' } as unknown as Omit<
        UserDto,
        'id'
      >);
      setUsers(prev => [...prev, created]);
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
      } else {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        setError(`Create Error: ${errorMsg}`);
      }
      console.error('create error', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!users[0]) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await repo.update(users[0].id, {
        name: users[0].name + ' (updated)',
      });
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
      } else {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        setError(`Update Error: ${errorMsg}`);
      }
      console.error('update error', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!users[0]) return;
    setLoading(true);
    setError(null);
    try {
      await repo.remove(users[0].id);
      setUsers(prev => prev.slice(1));
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
      } else {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        setError(`Delete Error: ${errorMsg}`);
      }
      console.error('delete error', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleMockData() {
    setLoading(true);
    setError(null);
    try {
      // Mock data for testing without backend
      const mockUsers: UserDto[] = [
        { id: 1, name: 'Mock User 1', email: 'user1@example.com' },
        { id: 2, name: 'Mock User 2', email: 'user2@example.com' },
        { id: 3, name: 'Mock User 3', email: 'user3@example.com' },
      ];
      setUsers(mockUsers);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Mock Data Error: ${errorMsg}`);
      console.error('mock data error', e);
    } finally {
      setLoading(false);
    }
  }

  // File upload handlers
  const handleUploadComplete = (fileId: string, fileName: string) => {
    setUploadedFileId(fileId);
    setUploadedFileName(fileName);
    devLog('Upload completed:', { fileId, fileName });
  };

  const handleUploadError = (error: string) => {
    setError(`Upload Error: ${error}`);
    console.error('Upload error:', error);
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    devLog('Upload progress:', progress);
  };

  const handleDownloadComplete = (fileName: string) => {
    devLog('Download completed:', fileName);
  };

  const handleDownloadError = (error: string) => {
    setError(`Download Error: ${error}`);
    console.error('Download error:', error);
  };

  // HTTP Method Test Functions
  const testHttpGet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.get('/users');
      devLog('GET Response:', response);
      setUsers(response.data || []);
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
        setUsers([]);
      } else {
        setError(`GET Error: ${e.message}`);
      }
      console.error('GET error:', e);
    } finally {
      setLoading(false);
    }
  };

  const testHttpPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.post('/users', {
        name: 'New User',
        email: 'new@example.com',
      });
      devLog('POST Response:', response);
      setUsers(prev => [...prev, response.data]);
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
      } else {
        setError(`POST Error: ${e.message}`);
      }
      console.error('POST error:', e);
    } finally {
      setLoading(false);
    }
  };

  const testHttpPut = async () => {
    if (!users[0]) return;
    setLoading(true);
    setError(null);
    try {
      const response = await http.put(`/users/${users[0].id}`, {
        name: users[0].name + ' (updated)',
        email: users[0].email,
      });
      devLog('PUT Response:', response);
      setUsers(prev =>
        prev.map(u => (u.id === users[0].id ? response.data : u))
      );
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
      } else {
        setError(`PUT Error: ${e.message}`);
      }
      console.error('PUT error:', e);
    } finally {
      setLoading(false);
    }
  };

  const testHttpDelete = async () => {
    if (!users[0]) return;
    setLoading(true);
    setError(null);
    try {
      const response = await http.delete(`/users/${users[0].id}`);
      devLog('DELETE Response:', response);
      setUsers(prev => prev.filter(u => u.id !== users[0].id));
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
      } else {
        setError(`DELETE Error: ${e.message}`);
      }
      console.error('DELETE error:', e);
    } finally {
      setLoading(false);
    }
  };

  const testCustomBuilder = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create custom request builder with specific configuration
      const customBuilder = createRequestBuilder({
        timeout: 5000,
        retryCount: 2,
        retryDelay: 1000,
        headers: {
          'X-Custom-Header': 'test-value',
        },
      });

      const response = await customBuilder.get('/users', {
        params: { limit: 10, offset: 0 },
        onDownloadProgress: progress => {
          devLog('Download progress:', progress.percentage + '%');
        },
      });

      devLog('Custom Builder Response:', response);
      setUsers(response.data || []);
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
        setUsers([]);
      } else {
        setError(`Custom Builder Error: ${e.message}`);
      }
      console.error('Custom Builder error:', e);
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test API client with base URL
      const response = await api.get('/users', {
        params: { page: 1, size: 5 },
      });
      devLog('API Client Response:', response);
      setUsers(response.data || []);
    } catch (e: any) {
      if (
        e.code === 'ECONNABORTED' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ETIMEDOUT'
      ) {
        setError('API 서버 연결 시간 초과. Mock 데이터를 사용하세요.');
        setUsers([]);
      } else {
        setError(`API Client Error: ${e.message}`);
      }
      console.error('API Client error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>API Test Page</h2>
      <div style={{ marginBottom: 8 }}>
        Base URL: {getEffectiveApiBaseUrl() ?? '(not set)'}
      </div>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: 12,
            marginBottom: 12,
            borderRadius: 4,
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
      >
        <button onClick={handleList} disabled={loading}>
          List (API)
        </button>
        <button onClick={handleCreate} disabled={loading}>
          Create (API)
        </button>
        <button onClick={handleUpdate} disabled={loading || users.length === 0}>
          Update first (API)
        </button>
        <button onClick={handleDelete} disabled={loading || users.length === 0}>
          Delete first (API)
        </button>
        <button
          onClick={handleMockData}
          disabled={loading}
          style={{ background: '#10b981', color: 'white' }}
        >
          Load Mock Data
        </button>
      </div>

      {/* HTTP Method Test Section */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#fef3c7',
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 12 }}>HTTP Method Tests</h3>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={testHttpGet}
            disabled={loading}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
            }}
          >
            GET Test
          </button>
          <button
            onClick={testHttpPost}
            disabled={loading}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
            }}
          >
            POST Test
          </button>
          <button
            onClick={testHttpPut}
            disabled={loading || users.length === 0}
            style={{
              background: '#f59e0b',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
            }}
          >
            PUT Test
          </button>
          <button
            onClick={testHttpDelete}
            disabled={loading || users.length === 0}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
            }}
          >
            DELETE Test
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={testCustomBuilder}
            disabled={loading}
            style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
            }}
          >
            Custom Builder Test
          </button>
          <button
            onClick={testApiClient}
            disabled={loading}
            style={{
              background: '#06b6d4',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
            }}
          >
            API Client Test
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      <div style={{ marginTop: 16 }}>
        <h3>Users Data:</h3>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            overflow: 'auto',
            maxHeight: '400px',
          }}
        >
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>

      {/* File Upload/Download Section */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#f8fafc',
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 16 }}>PDF 파일 업로드/다운로드 테스트</h3>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 8 }}>파일 업로드:</h4>
          <FileUpload
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onProgress={handleUploadProgress}
            accept=".pdf"
            maxSizeInMB={10}
            className="max-w-md"
          />
        </div>

        {uploadProgress && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>업로드 진행률:</h4>
            <div style={{ background: '#e5e7eb', borderRadius: 4, padding: 8 }}>
              <div
                style={{
                  background: '#3b82f6',
                  height: 8,
                  borderRadius: 4,
                  width: `${uploadProgress.percentage}%`,
                  transition: 'width 0.3s ease',
                }}
              />
              <div style={{ marginTop: 4, fontSize: '12px', color: '#6b7280' }}>
                {uploadProgress.percentage}% (
                {fileService.formatFileSize(uploadProgress.loaded)} /{' '}
                {fileService.formatFileSize(uploadProgress.total)})
              </div>
            </div>
          </div>
        )}

        {uploadedFileId && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>업로드된 파일:</h4>
            <div
              style={{
                background: '#d1fae5',
                padding: 8,
                borderRadius: 4,
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: '14px' }}>
                <strong>파일 ID:</strong> {uploadedFileId}
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>파일명:</strong> {uploadedFileName}
              </div>
            </div>
            <FileDownload
              fileId={uploadedFileId}
              fileName={uploadedFileName}
              onDownloadComplete={handleDownloadComplete}
              onDownloadError={handleDownloadError}
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#f0f9ff',
          borderRadius: 4,
        }}
      >
        <h4>사용법:</h4>
        <ul>
          <li>
            <strong>List/Create/Update/Delete</strong>: 실제 API 서버가
            필요합니다 (포트 3400)
          </li>
          <li>
            <strong>Load Mock Data</strong>: 백엔드 없이 테스트 데이터를
            로드합니다
          </li>
          <li>
            <strong>PDF 업로드/다운로드</strong>: multipart/form-data 지원, 개발
            모드에서는 Mock 응답
          </li>
          <li>
            <strong>HTTP Method Tests</strong>: GET, POST, PUT, DELETE 테스트
          </li>
          <li>
            <strong>Custom Builder</strong>: 재시도, 커스텀 헤더, 진행률 콜백
            지원
          </li>
          <li>
            <strong>API Client</strong>: Base URL 자동 설정, 편리한 메서드 제공
          </li>
          <li>API 에러가 발생하면 에러 메시지가 표시됩니다</li>
        </ul>
      </div>
    </div>
  );
}
