// src/constants/mainmenu.ts
/**
 * PDF Formatter 메인 메뉴 및 도구 팔레트 문구 중앙 관리
 * 모든 좌측 메뉴, 카테고리, 도구 팔레트에서 사용하는 문구를 이 파일에서 관리합니다.
 */

/**
 * 메뉴 항목 텍스트 관리
 */
export const MENU_LABELS = {
  // 좌측 메인 메뉴
  MAIN: {
    importPDF: 'PDF 원본 불러오기',
    resetAllPages: 'PDF 전체 페이지 서식화 작성 초기화',
    resetCurrentPage: 'PDF 현재 페이지 서식화 작성 초기화',
    saveFormat: 'PDF 원본 서식화 저장',
  },

  // 개발용 메뉴
  DEV: {
    saveAllPagesJSON: 'PDF 전체 컴포넌트 페이지 정보 JSON 저장',
    saveCurrentPageJSON: 'PDF 현재 컴포넌트 페이지 정보 JSON 저장',
    statePersist: '상태 저장',
    statePersistTooltipOn: '상태 저장 활성화됨 (리로드 시 복원됨)',
    statePersistTooltipOff: '상태 저장 비활성화됨 (리로드 시 초기화됨)',
  },

  // 카테고리 라벨
  CATEGORIES: {
    ban: '금지',
    all: '전체',
    textbox: '텍스트박스',
    checkbox: '체크박스',
    circleslash: '써클앤슬래시',
    calendar: '캘린더',
    signature: '서명',
    satisfactionbox: '만족/불만족',
    button: '버튼',
    circle: '원형',
  },

  // 오버레이 버튼
  OVERLAY: {
    show: '오버레이 보기',
    hide: '오버레이 숨기기',
    label: '오버레이',
  },

  // 좌측 도구 팔레트 - 금지 도구
  TOOLS_BAN: {
    banCircle: '금지 원형',
    banSquare: '금지 사각형',
    banLine: '금지선',
    banCross: '금지 X표시',
  },

  // 좌측 도구 팔레트 - 텍스트박스 도구
  TOOLS_TEXTBOX: {
    textInput: '텍스트 입력',
    textBold: '굵은 텍스트',
    textItalic: '기울임 텍스트',
    textUnderline: '밑줄 텍스트',
    textAlignLeft: '왼쪽 정렬',
    textAlignCenter: '가운데 정렬',
    textAlignRight: '오른쪽 정렬',
    textEdit: '텍스트 편집',
  },

  // 좌측 도구 팔레트 - 체크박스 도구
  TOOLS_CHECKBOX: {
    checkboxEmpty: '빈 체크박스',
    checkboxChecked: '체크된 박스',
    checkboxCheck: '체크 표시',
    checkboxCross: 'X 표시',
  },

  // 좌측 도구 팔레트 - 캘린더 도구
  TOOLS_CALENDAR: {
    calendarFull: '전체 캘린더',
    calendarDays: '날짜 선택',
    calendarClock: '시간 선택',
    calendarRange: '기간 선택',
  },

  // 좌측 도구 팔레트 - 서명 도구
  TOOLS_SIGNATURE: {
    signaturePen: '펜 서명',
    signatureText: '텍스트 서명',
    signatureDraw: '자유 그리기',
    signatureStamp: '도장',
  },

  // 좌측 도구 팔레트 - 원형 도구
  TOOLS_CIRCLE: {
    circleOutline: '원형 외곽선',
    circleFilled: '원형 채움',
    circleDot: '점',
    circleRing: '링',
  },

  // 좌측 도구 팔레트 - 안내 메시지
  TOOLS_MESSAGES: {
    overlayDisabledTitle: '⚠️ 주의',
    overlayDisabledDescription:
      '오버레이가 비활성화되어 있습니다. 도구를 사용하려면 헤더의 오버레이 버튼을 클릭하세요.',
    overlayRequiredTooltip: '(오버레이 활성화 필요)',
  },
} as const;
