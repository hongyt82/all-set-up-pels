// no imports needed

export interface CircleElement {
  id: string;
  type: 'circle-outline' | 'circle-filled' | 'circle-dot' | 'circle-ring';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  opacity: number;
}

export interface CircleToolsProps {
  onElementAdd?: (element: CircleElement) => void;
  selectedTool?: string;
}

export class CircleToolsManager {
  // 원형 외곽선 생성
  static createCircleOutline(
    x: number,
    y: number,
    radius: number = 30
  ): CircleElement {
    console.log('⭕ [CircleTools] 원형 외곽선 생성:', { x, y, radius });
    return {
      id: `circle-outline-${Date.now()}`,
      type: 'circle-outline',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      radius,
      strokeColor: '#374151',
      strokeWidth: 2,
      fillColor: 'transparent',
      opacity: 1,
    };
  }

  // 원형 채움 생성
  static createCircleFilled(
    x: number,
    y: number,
    radius: number = 30
  ): CircleElement {
    console.log('🔵 [CircleTools] 원형 채움 생성:', { x, y, radius });
    return {
      id: `circle-filled-${Date.now()}`,
      type: 'circle-filled',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      radius,
      strokeColor: '#3b82f6',
      strokeWidth: 1,
      fillColor: '#3b82f6',
      opacity: 0.8,
    };
  }

  // 점 생성
  static createCircleDot(
    x: number,
    y: number,
    radius: number = 8
  ): CircleElement {
    console.log('🔴 [CircleTools] 점 생성:', { x, y, radius });
    return {
      id: `circle-dot-${Date.now()}`,
      type: 'circle-dot',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      radius,
      strokeColor: '#dc2626',
      strokeWidth: 0,
      fillColor: '#dc2626',
      opacity: 1,
    };
  }

  // 링 생성
  static createCircleRing(
    x: number,
    y: number,
    radius: number = 25
  ): CircleElement {
    console.log('⚪ [CircleTools] 링 생성:', { x, y, radius });
    return {
      id: `circle-ring-${Date.now()}`,
      type: 'circle-ring',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      radius,
      strokeColor: '#059669',
      strokeWidth: 5,
      fillColor: 'transparent',
      opacity: 1,
    };
  }

  // 원형 크기 조정
  static resizeCircle(
    element: CircleElement,
    newRadius: number
  ): CircleElement {
    console.log('🔄 [CircleTools] 원형 크기 조정:', {
      id: element.id,
      이전반지름: element.radius,
      새반지름: newRadius,
    });

    return {
      ...element,
      radius: newRadius,
      width: newRadius * 2,
      height: newRadius * 2,
    };
  }

  // 원형 색상 변경
  static changeCircleColor(
    element: CircleElement,
    strokeColor?: string,
    fillColor?: string
  ): CircleElement {
    const updatedElement = { ...element };

    if (strokeColor) updatedElement.strokeColor = strokeColor;
    if (fillColor) updatedElement.fillColor = fillColor;

    console.log('🎨 [CircleTools] 원형 색상 변경:', {
      id: element.id,
      strokeColor: updatedElement.strokeColor,
      fillColor: updatedElement.fillColor,
    });

    return updatedElement;
  }

  // 원형 요소 렌더링
  static renderCircleElement(element: CircleElement): JSX.Element {
    const containerStyle = {
      position: 'absolute' as const,
      left: element.x - element.radius,
      top: element.y - element.radius,
      width: element.width,
      height: element.height,
      opacity: element.opacity,
      cursor: 'pointer',
    };

    const svgStyle = {
      width: '100%',
      height: '100%',
      overflow: 'visible',
    };

    const circleProps = {
      cx: element.radius,
      cy: element.radius,
      r: element.radius - element.strokeWidth / 2,
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      fill: element.fillColor,
    };

    // 특별한 타입별 처리
    const getCircleSpecificProps = () => {
      switch (element.type) {
        case 'circle-outline':
          return {
            ...circleProps,
            fill: 'transparent',
          };

        case 'circle-filled':
          return {
            ...circleProps,
            stroke: element.strokeColor,
            fill: element.fillColor,
          };

        case 'circle-dot':
          return {
            ...circleProps,
            stroke: 'none',
            fill: element.fillColor,
          };

        case 'circle-ring':
          return {
            ...circleProps,
            fill: 'transparent',
            strokeWidth: Math.max(3, element.strokeWidth),
          };

        default:
          return circleProps;
      }
    };

    return (
      <div
        key={element.id}
        style={containerStyle}
        className="hover:opacity-80 transition-opacity"
        title={`${element.type} - 반지름: ${element.radius}px`}
      >
        <svg style={svgStyle}>
          <circle {...getCircleSpecificProps()} />

          {/* 링 타입의 경우 내부 하이라이트 추가 */}
          {element.type === 'circle-ring' && (
            <circle
              cx={element.radius}
              cy={element.radius}
              r={element.radius - element.strokeWidth - 2}
              fill="none"
              stroke={element.strokeColor}
              strokeWidth={1}
              opacity={0.3}
            />
          )}
        </svg>

        {/* 채움 타입의 경우 그라데이션 효과 추가 */}
        {element.type === 'circle-filled' && (
          <svg style={svgStyle} className="absolute inset-0">
            <defs>
              <radialGradient id={`gradient-${element.id}`}>
                <stop
                  offset="0%"
                  stopColor={element.fillColor}
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor={element.fillColor}
                  stopOpacity={1}
                />
              </radialGradient>
            </defs>
            <circle
              cx={element.radius}
              cy={element.radius}
              r={element.radius - element.strokeWidth / 2}
              fill={`url(#gradient-${element.id})`}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
            />
          </svg>
        )}
      </div>
    );
  }
}

// 원형 도구 컴포넌트 (테스트용)
export const CircleToolsDemo: React.FC<CircleToolsProps> = ({
  onElementAdd,
  selectedTool,
}) => {
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !onElementAdd) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let element: CircleElement;

    switch (selectedTool) {
      case 'circle-outline':
        element = CircleToolsManager.createCircleOutline(x, y);
        break;
      case 'circle-filled':
        element = CircleToolsManager.createCircleFilled(x, y);
        break;
      case 'circle-dot':
        element = CircleToolsManager.createCircleDot(x, y);
        break;
      case 'circle-ring':
        element = CircleToolsManager.createCircleRing(x, y);
        break;
      default:
        return;
    }

    onElementAdd(element);
  };

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onClick={handleCanvasClick}
      title={`${selectedTool} 도구 - 클릭하여 원형 배치`}
    />
  );
};

export default CircleToolsManager;
