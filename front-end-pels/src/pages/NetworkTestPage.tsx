import React, { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { IS_DEV } from '../constants/config';
import { devLog } from '../utils/devConsole';
import type {
  NetworkChangeEvent,
  NetworkQuality,
  NetworkState,
} from '../utils/networkUtils';
import {
  checkNetworkConnection,
  createNetworkWatcher,
  formatNetworkState,
  getNetworkQualityBadgeColor,
  getNetworkQualityColor,
  getNetworkStateAsJson,
  logNetworkState,
  testNetworkQuality,
  useNetworkMonitoring,
  validateNetworkBeforeSend,
} from '../utils';

/**
 * 네트워크 상태 테스트 페이지
 * 실시간 네트워크 연결 상태 모니터링 및 테스트 기능
 */
const NetworkTestPage: React.FC = () => {
  // 네트워크 상태 모니터링
  const { isOnline, networkState, quality } = useNetworkMonitoring();

  // 상태 관리
  const [testResults, setTestResults] = useState<{
    connectionTest?: { success: boolean; timestamp: Date };
    qualityTest?: {
      latency: number;
      downloadSpeed: number;
      uploadSpeed: number;
      success: boolean;
      timestamp: Date;
    };
    validationTest?: {
      canSend: boolean;
      reason?: string;
      quality: NetworkQuality;
      recommendation?: string;
      timestamp: Date;
    };
  }>({});

  const [networkHistory, setNetworkHistory] = useState<NetworkChangeEvent[]>(
    []
  );
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testUrl, setTestUrl] = useState('https://httpbin.org/get');
  const [customData, setCustomData] = useState(
    '{"test": "data", "timestamp": "' + new Date().toISOString() + '"}'
  );

  // 네트워크 상태 변경 감지
  useEffect(() => {
    if (!isMonitoring) return;

    return createNetworkWatcher((event: NetworkChangeEvent) => {
      setNetworkHistory(prev => [event, ...prev.slice(0, 49)]); // 최대 50개 유지

      if (IS_DEV) {
        devLog('🌐 네트워크 상태 변경:', event);
      }
    });
  }, [isMonitoring]);

  // 네트워크 연결 테스트
  const runConnectionTest = async () => {
    if (IS_DEV) {
      devLog('🔗 네트워크 연결 테스트 시작');
    }

    const success = await checkNetworkConnection();
    setTestResults(prev => ({
      ...prev,
      connectionTest: { success, timestamp: new Date() },
    }));

    if (IS_DEV) {
      devLog('🔗 네트워크 연결 테스트 결과:', success ? '성공' : '실패');
    }
  };

  // 네트워크 품질 테스트
  const runQualityTest = async () => {
    if (IS_DEV) {
      devLog('📊 네트워크 품질 테스트 시작');
    }

    const result = await testNetworkQuality();
    setTestResults(prev => ({
      ...prev,
      qualityTest: { ...result, timestamp: new Date() },
    }));

    if (IS_DEV) {
      devLog('📊 네트워크 품질 테스트 결과:', result);
    }
  };

  // 데이터 전송 전 검증 테스트
  const runValidationTest = async () => {
    if (IS_DEV) {
      devLog('✅ 데이터 전송 검증 테스트 시작');
    }

    const result = await validateNetworkBeforeSend();
    setTestResults(prev => ({
      ...prev,
      validationTest: { ...result, timestamp: new Date() },
    }));

    if (IS_DEV) {
      devLog('✅ 데이터 전송 검증 테스트 결과:', result);
    }
  };

  // 모든 테스트 실행
  const runAllTests = async () => {
    await runConnectionTest();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    await runQualityTest();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    await runValidationTest();
  };

  // 모니터링 시작/중지
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setNetworkHistory([]); // 새로 시작할 때 히스토리 초기화
    }
  };

  // 네트워크 상태 로깅
  const logCurrentNetworkState = () => {
    const currentState: NetworkState = {
      isOnline,
      isConnected: networkState.online ?? false,
      connectionType: networkState.type || 'unknown',
      downlink: networkState.downlink || 0,
      uplink: 0, // react-use의 useNetworkState에는 uplink 속성이 없음
      rtt: networkState.rtt || 0,
      effectiveType: networkState.effectiveType || 'unknown',
      lastChanged: new Date(),
      changeCount: 0,
    };

    logNetworkState(currentState, '테스트 페이지');
  };

  // 네트워크 상태 JSON 출력
  const exportNetworkState = () => {
    const json = getNetworkStateAsJson();
    devLog('📋 네트워크 상태 JSON:', json);

    // 클립보드에 복사
    navigator.clipboard
      .writeText(json)
      .then(() => {
        alert('네트워크 상태 정보가 클립보드에 복사되었습니다.');
      })
      .catch(() => {
        alert('클립보드 복사에 실패했습니다. 콘솔을 확인해주세요.');
      });
  };

  // 실제 데이터 전송 시뮬레이션
  const simulateDataSend = async () => {
    if (IS_DEV) {
      devLog('📤 데이터 전송 시뮬레이션 시작');
    }

    // 전송 전 검증
    const validation = await validateNetworkBeforeSend();

    if (!validation.canSend) {
      alert(
        `데이터 전송 불가: ${validation.reason}\n권장사항: ${validation.recommendation}`
      );
      return;
    }

    try {
      // 실제 전송 시뮬레이션
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: customData,
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      });

      if (response.ok) {
        alert('데이터 전송 성공!');
        if (IS_DEV) {
          devLog('📤 데이터 전송 성공:', await response.json());
        }
      } else {
        alert(`데이터 전송 실패: HTTP ${response.status}`);
      }
    } catch (error) {
      alert(
        `데이터 전송 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
      if (IS_DEV) {
        console.error('📤 데이터 전송 오류:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">네트워크 상태 모니터링</h1>
        <p className="text-muted-foreground">
          실시간 네트워크 연결 상태 감지 및 데이터 전송 전 검증 기능
        </p>
      </div>

      {/* 현재 네트워크 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={getNetworkQualityBadgeColor(quality)}
            >
              {quality === 'offline' ? '❌' : '✅'}{' '}
              {formatNetworkState({
                isOnline,
                isConnected: networkState.online ?? false,
                connectionType: networkState.type || 'unknown',
                downlink: networkState.downlink || 0,
                uplink: 0, // react-use의 useNetworkState에는 uplink 속성이 없음
                rtt: networkState.rtt || 0,
                effectiveType: networkState.effectiveType || 'unknown',
                lastChanged: new Date(),
                changeCount: 0,
              })}
            </Badge>
            현재 네트워크 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <strong>온라인 상태:</strong>
              <div
                className={getNetworkQualityColor(
                  isOnline ? 'excellent' : 'offline'
                )}
              >
                {isOnline ? '✅ 온라인' : '❌ 오프라인'}
              </div>
            </div>
            <div>
              <strong>연결 타입:</strong>
              <div>{networkState.type || '알 수 없음'}</div>
            </div>
            <div>
              <strong>다운로드 속도:</strong>
              <div>{networkState.downlink || 0} Mbps</div>
            </div>
            <div>
              <strong>지연 시간:</strong>
              <div>{networkState.rtt || 0} ms</div>
            </div>
            <div>
              <strong>효과적 타입:</strong>
              <div>{networkState.effectiveType || '알 수 없음'}</div>
            </div>
            <div>
              <strong>업로드 속도:</strong>
              <div>0 Mbps</div>
            </div>
            <div>
              <strong>품질 등급:</strong>
              <div className={getNetworkQualityColor(quality)}>
                {quality === 'excellent'
                  ? '우수'
                  : quality === 'good'
                    ? '양호'
                    : quality === 'fair'
                      ? '보통'
                      : quality === 'poor'
                        ? '불량'
                        : '오프라인'}
              </div>
            </div>
            <div>
              <strong>모니터링:</strong>
              <div
                className={isMonitoring ? 'text-green-600' : 'text-gray-600'}
              >
                {isMonitoring ? '🟢 활성' : '⚪ 비활성'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 테스트 컨트롤 */}
      <Card>
        <CardHeader>
          <CardTitle>네트워크 테스트</CardTitle>
          <CardDescription>
            다양한 네트워크 상태 테스트를 실행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={runConnectionTest} variant="outline">
              🔗 연결 테스트
            </Button>
            <Button onClick={runQualityTest} variant="outline">
              📊 품질 테스트
            </Button>
            <Button onClick={runValidationTest} variant="outline">
              ✅ 전송 검증
            </Button>
            <Button
              onClick={runAllTests}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🚀 전체 테스트
            </Button>
            <Button
              onClick={toggleMonitoring}
              variant={isMonitoring ? 'destructive' : 'default'}
            >
              {isMonitoring ? '⏹️ 모니터링 중지' : '▶️ 모니터링 시작'}
            </Button>
            <Button onClick={logCurrentNetworkState} variant="outline">
              📝 상태 로깅
            </Button>
            <Button onClick={exportNetworkState} variant="outline">
              📋 JSON 내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 테스트 결과 */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>테스트 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.connectionTest && (
              <div>
                <h4 className="font-semibold mb-2">🔗 연결 테스트</h4>
                <div className="p-3 bg-gray-100 rounded">
                  <div>
                    <strong>결과:</strong>{' '}
                    {testResults.connectionTest.success ? '✅ 성공' : '❌ 실패'}
                  </div>
                  <div>
                    <strong>시간:</strong>{' '}
                    {testResults.connectionTest.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {testResults.qualityTest && (
              <div>
                <h4 className="font-semibold mb-2">📊 품질 테스트</h4>
                <div className="p-3 bg-gray-100 rounded">
                  <div>
                    <strong>지연 시간:</strong>{' '}
                    {testResults.qualityTest.latency}ms
                  </div>
                  <div>
                    <strong>다운로드 속도:</strong>{' '}
                    {testResults.qualityTest.downloadSpeed}Mbps
                  </div>
                  <div>
                    <strong>업로드 속도:</strong>{' '}
                    {testResults.qualityTest.uploadSpeed}Mbps
                  </div>
                  <div>
                    <strong>성공 여부:</strong>{' '}
                    {testResults.qualityTest.success ? '✅ 성공' : '❌ 실패'}
                  </div>
                  <div>
                    <strong>시간:</strong>{' '}
                    {testResults.qualityTest.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {testResults.validationTest && (
              <div>
                <h4 className="font-semibold mb-2">✅ 전송 검증</h4>
                <div className="p-3 bg-gray-100 rounded">
                  <div>
                    <strong>전송 가능:</strong>{' '}
                    {testResults.validationTest.canSend
                      ? '✅ 가능'
                      : '❌ 불가능'}
                  </div>
                  {testResults.validationTest.reason && (
                    <div>
                      <strong>사유:</strong> {testResults.validationTest.reason}
                    </div>
                  )}
                  <div>
                    <strong>품질:</strong> {testResults.validationTest.quality}
                  </div>
                  {testResults.validationTest.recommendation && (
                    <div>
                      <strong>권장사항:</strong>{' '}
                      {testResults.validationTest.recommendation}
                    </div>
                  )}
                  <div>
                    <strong>시간:</strong>{' '}
                    {testResults.validationTest.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 네트워크 상태 변경 히스토리 */}
      {networkHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>네트워크 상태 변경 히스토리</CardTitle>
            <CardDescription>
              최근 50개의 네트워크 상태 변경 이벤트
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {networkHistory.map((event, index) => (
                <div key={index} className="p-2 border rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>
                        {event.type === 'online'
                          ? '🟢 온라인'
                          : event.type === 'offline'
                            ? '🔴 오프라인'
                            : '📊 품질 변경'}
                      </strong>
                      <div className="text-gray-600">
                        {event.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.currentState.isOnline ? '온라인' : '오프라인'}
                    </Badge>
                  </div>
                  {event.previousState && (
                    <div className="mt-1 text-xs text-gray-500">
                      이전:{' '}
                      {event.previousState.isOnline ? '온라인' : '오프라인'} →
                      현재:{' '}
                      {event.currentState.isOnline ? '온라인' : '오프라인'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 데이터 전송 시뮬레이션 */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 전송 시뮬레이션</CardTitle>
          <CardDescription>
            실제 데이터 전송 전 네트워크 상태를 검증하고 전송을
            시뮬레이션합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testUrl">테스트 URL</Label>
              <Input
                id="testUrl"
                value={testUrl}
                onChange={e => setTestUrl(e.target.value)}
                placeholder="https://httpbin.org/post"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customData">전송할 데이터 (JSON)</Label>
              <Textarea
                id="customData"
                value={customData}
                onChange={e => setCustomData(e.target.value)}
                placeholder='{"test": "data"}'
                rows={3}
              />
            </div>
          </div>
          <Button
            onClick={simulateDataSend}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!isOnline}
          >
            📤 데이터 전송 시뮬레이션 실행
          </Button>
          {!isOnline && (
            <div className="text-red-600 text-sm text-center">
              ⚠️ 오프라인 상태에서는 데이터 전송이 불가능합니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkTestPage;
