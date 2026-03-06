module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Edge 브라우저 지원을 위한 타겟 설정
        targets: {
          edge: '79', // Chromium 기반 Edge 지원
          chrome: '79',
          firefox: '72',
          safari: '13'
        },
        // 오프라인 환경을 위한 설정
        useBuiltIns: 'entry', // 런타임 다운로드 대신 빌드 타임에 모든 폴리필 포함
        corejs: 3,
        // 모듈 변환 비활성화 (Vite가 처리)
        modules: false,
        // 디버그 정보 출력
        debug: process.env.NODE_ENV === 'development',
        // 오프라인 환경을 위한 추가 설정
        forceAllTransforms: false, // 필요한 변환만 수행
        ignoreBrowserslistConfig: false, // browserslist 설정 사용
        shippedProposals: true // 제안된 기능 중 구현된 것만 사용
      }
    ],
    [
      '@babel/preset-react',
      {
        // React 17+ 자동 JSX 변환 사용
        runtime: 'automatic',
        // 개발 모드에서 디버그 정보 포함
        development: process.env.NODE_ENV === 'development'
      }
    ]
  ],
  plugins: [
    // 오프라인 환경을 위한 런타임 헬퍼 설정
    [
      '@babel/plugin-transform-runtime',
      {
        // core-js 폴리필 사용 안함 (useBuiltIns: 'entry'로 대체)
        corejs: false,
        // 헬퍼 함수를 인라인으로 포함 (외부 모듈 의존성 제거)
        helpers: false,
        // regenerator 사용 안함 (useBuiltIns: 'entry'로 대체)
        regenerator: false,
        // 절대 경로 사용
        useESModules: true,
        // 오프라인 환경을 위한 추가 설정
        absoluteRuntime: false, // 절대 경로 사용 안함
        version: '^7.23.2' // 버전 고정
      }
    ]
  ],
  // 환경별 설정
  env: {
    development: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              edge: '79',
              chrome: '79',
              firefox: '72',
              safari: '13'
            },
            useBuiltIns: 'entry', // 오프라인 환경을 위한 설정
            corejs: 3,
            modules: false,
            debug: true,
            forceAllTransforms: false,
            ignoreBrowserslistConfig: false,
            shippedProposals: true
          }
        ],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
            development: true
          }
        ]
      ]
    },
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              edge: '79',
              chrome: '79',
              firefox: '72',
              safari: '13'
            },
            useBuiltIns: 'entry', // 오프라인 환경을 위한 설정
            corejs: 3,
            modules: false,
            debug: false,
            forceAllTransforms: false,
            ignoreBrowserslistConfig: false,
            shippedProposals: true
          }
        ],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
            development: false
          }
        ]
      ]
    }
  }
};
