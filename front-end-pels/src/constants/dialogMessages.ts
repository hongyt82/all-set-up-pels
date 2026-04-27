/**
 * PDF Formatter 다이얼로그 메시지 중앙 관리
 * 모든 다이얼로그에서 사용하는 문구를 이 파일에서 관리합니다.
 */

export const DIALOG_MESSAGES = {
  // PDF 원본 불러오기
  IMPORT_PDF: {
    CONFIRM: {
      title: 'PDF 원본 불러오기',
      description: 'PDF 원본을 불러오시겠습니까?',
      confirmText: '불러오기',
      cancelText: '취소',
    },
    PROGRESS: {
      loading: {
        title: 'PDF 원본 불러오는 중...',
        description: '잠시만 기다려 주세요.',
      },
      success: {
        title: 'PDF 원본 불러오기 완료',
        description: 'PDF 파일을 성공적으로 불러왔습니다.',
      },
      error: {
        title: 'PDF 원본 불러오기 실패',
        description:
          'PDF 파일을 불러오는 중 오류가 발생했습니다.\n다시 시도해 주세요.',
      },
    },
  },

  // PDF 서식화 작성 초기화
  RESET_SETTINGS: {
    CONFIRM: {
      title: 'PDF 서식화 작성 초기화',
      description:
        '모든 작성된 서식 정보가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n\n정말로 초기화하시겠습니까?',
      confirmText: '초기화',
      cancelText: '취소',
    },
  },

  // PDF 원본 서식화 저장
  SAVE_FORMAT: {
    CONFIRM: {
      title: 'PDF 원본 서식화 저장',
      description: 'PDF 원본 서식화를 저장하시겠습니까?',
      confirmText: '저장',
      cancelText: '취소',
    },
    PROGRESS: {
      loading: {
        title: 'PDF 원본 서식화 저장 중...',
        description: '잠시만 기다려 주세요.',
      },
      success: {
        title: 'PDF 원본 서식화 저장 완료',
        description: 'PDF 서식화 정보를 성공적으로 저장했습니다.',
      },
      error: {
        title: 'PDF 원본 서식화 저장 실패',
        description:
          'PDF 서식화 정보를 저장하는 중 오류가 발생했습니다.\n다시 시도해 주세요.',
      },
    },
  },

  // 공통 버튼 텍스트
  COMMON: {
    confirm: '확인',
    cancel: '취소',
    close: '닫기',
    save: '저장',
    delete: '삭제',
    edit: '수정',
  },

  // 에러 다이얼로그
  ERROR: {
    // 404 Not Found
    NOT_FOUND: {
      title: '페이지를 찾을 수 없습니다',
      description:
        '요청하신 페이지가 존재하지 않습니다.\n이 메시지를 확인 후 닫아 주세요.',
      confirmText: '확인',
    },
    // 400대 클라이언트 에러
    CLIENT_ERROR: {
      title: '요청 처리 실패',
      description: '잘못된 요청입니다.\n다시 시도해 주세요.',
      confirmText: '확인',
    },
    // 500대 서버 에러
    SERVER_ERROR: {
      title: '서버 오류',
      description:
        '일시적인 서버 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
      confirmText: '확인',
    },
    // 네트워크 에러
    NETWORK_ERROR: {
      title: '네트워크 오류',
      description: '네트워크 연결을 확인해 주세요.',
      confirmText: '확인',
    },
    // React 런타임 에러
    RUNTIME_ERROR: {
      title: '예상치 못한 오류',
      description:
        '애플리케이션에 오류가 발생했습니다.\n페이지를 새로고침해 주세요.',
      confirmText: '새로고침',
    },
    // 일반 에러
    GENERAL_ERROR: {
      title: '오류 발생',
      description: '오류가 발생했습니다.\n다시 시도해 주세요.',
      confirmText: '확인',
    },
  },
} as const;

/**
 * 콘솔 로그 메시지 관리
 */
export const LOG_MESSAGES = {
  IMPORT_PDF: {
    start: 'PDF 원본 불러오기 시작',
    success: 'PDF 원본 불러오기 완료',
    error: 'PDF 원본 불러오기 실패',
    cancel: 'PDF 원본 불러오기 취소',
  },
  RESET_SETTINGS: {
    confirm: '초기화 확인',
    cancel: '초기화 취소',
    complete: '설정 초기화 완료',
  },
  SAVE_FORMAT: {
    start: 'PDF 원본 서식화 저장 시작',
    success: 'PDF 원본 서식화 저장 완료',
    error: 'PDF 원본 서식화 저장 실패',
    cancel: 'PDF 원본 서식화 저장 취소',
  },
  SAVE_JSON: {
    allPages: '전체 페이지 JSON 저장 실행',
    allPagesComplete: '전체 페이지 JSON 파일 저장 완료',
    currentPage: '현재 페이지 JSON 저장 실행',
    currentPageComplete: '현재 페이지 JSON 파일 저장 완료',
  },
  STATE_PERSIST: {
    enabled: '상태 저장 활성화됨',
    disabled: '상태 저장 비활성화됨',
    toggleOn: '상태 저장 기능을 활성화했습니다.',
    toggleOff: '상태 저장 기능을 비활성화했습니다.',
    info: '리로드 시 현재 상태가 복원됩니다.',
  },
} as const;
