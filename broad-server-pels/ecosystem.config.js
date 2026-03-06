/**
 * PM2 Ecosystem Configuration
 * 
 * 사용 방법:
 *   pm2 start ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 logs sync-server
 *   pm2 monit
 */
module.exports = {
  apps: [
    {
      name: 'broad-server',
      script: './dist/index.js',
      instances: 1, // Windows에서는 보통 1개 인스턴스
      exec_mode: 'fork', // Windows에서는 fork 모드만 지원
      
      // 환경 변수
      env: {
        NODE_ENV: 'production',
      },
      
      // 로그 설정
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 자동 재시작 설정
      autorestart: true,
      watch: false, // 프로덕션에서는 파일 감지 비활성화
      max_memory_restart: '500M', // 메모리 500MB 초과 시 재시작
      
      // Windows 특화 설정
      windowsHide: true, // Windows에서 콘솔 창 숨김
      kill_timeout: 5000, // 프로세스 종료 대기 시간 (밀리초)
      
      // 추가 설정
      min_uptime: '10s', // 최소 실행 시간 (이 시간 이내 종료 시 에러로 간주)
      max_restarts: 10, // 최대 재시작 횟수
      restart_delay: 4000, // 재시작 대기 시간 (밀리초)
    },
  ],
};
