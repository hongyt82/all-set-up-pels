// no imports needed

export interface BanElement {
  id: string;
  type: 'ban-circle' | 'ban-square' | 'ban-line' | 'ban-cross';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

export interface BanToolsProps {
  onElementAdd?: (element: BanElement) => void;
  selectedTool?: string;
}

export class BanToolsManager {
  // 금지 원형 생성
  static createBanCircle(x: number, y: number, size: number = 40): BanElement {
    console.log('🚫 [BanTools] 금지 원형 생성:', { x, y, size });
    return {
      id: `ban-circle-${Date.now()}`,
      type: 'ban-circle',
      x,
      y,
      width: size,
      height: size,
      color: '#dc2626',
      strokeWidth: 3,
    };
  }

  // 금지 사각형 생성
  static createBanSquare(
    x: number,
    y: number,
    width: number = 40,
    height: number = 40
  ): BanElement {
    console.log('🚫 [BanTools] 금지 사각형 생성:', { x, y, width, height });
    return {
      id: `ban-square-${Date.now()}`,
      type: 'ban-square',
      x,
      y,
      width,
      height,
      color: '#dc2626',
      strokeWidth: 3,
    };
  }

  // 금지선 생성
  static createBanLine(x: number, y: number, length: number = 60): BanElement {
    console.log('🚫 [BanTools] 금지선 생성:', { x, y, length });
    return {
      id: `ban-line-${Date.now()}`,
      type: 'ban-line',
      x,
      y,
      width: length,
      height: 3,
      color: '#dc2626',
      strokeWidth: 3,
    };
  }

  // 금지 X표시 생성
  static createBanCross(x: number, y: number, size: number = 30): BanElement {
    console.log('🚫 [BanTools] 금지 X표시 생성:', { x, y, size });
    return {
      id: `ban-cross-${Date.now()}`,
      type: 'ban-cross',
      x,
      y,
      width: size,
      height: size,
      color: '#dc2626',
      strokeWidth: 4,
    };
  }

  // 금지 요소 렌더링
  static renderBanElement(element: BanElement): JSX.Element {
    const commonStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      pointerEvents: 'none' as const,
    };

    switch (element.type) {
      case 'ban-circle':
        return (
          <div
            key={element.id}
            style={commonStyle}
            className="border-2 border-red-600 rounded-full bg-red-100/30"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-red-600 transform rotate-45"
                style={{
                  width: `${element.width * 0.8}px`,
                  height: `${element.strokeWidth}px`,
                }}
              />
            </div>
          </div>
        );

      case 'ban-square':
        return (
          <div
            key={element.id}
            style={commonStyle}
            className="border-2 border-red-600 bg-red-100/30"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-red-600 transform rotate-45"
                style={{
                  width: `${element.width * 0.8}px`,
                  height: `${element.strokeWidth}px`,
                }}
              />
            </div>
          </div>
        );

      case 'ban-line':
        return (
          <div key={element.id} style={commonStyle} className="bg-red-600" />
        );

      case 'ban-cross':
        return (
          <div key={element.id} style={commonStyle} className="relative">
            <div
              className="absolute bg-red-600 transform rotate-45"
              style={{
                left: '50%',
                top: '50%',
                width: `${element.width * 0.8}px`,
                height: `${element.strokeWidth}px`,
                marginLeft: `-${element.width * 0.4}px`,
                marginTop: `-${element.strokeWidth / 2}px`,
              }}
            />
            <div
              className="absolute bg-red-600 transform -rotate-45"
              style={{
                left: '50%',
                top: '50%',
                width: `${element.width * 0.8}px`,
                height: `${element.strokeWidth}px`,
                marginLeft: `-${element.width * 0.4}px`,
                marginTop: `-${element.strokeWidth / 2}px`,
              }}
            />
          </div>
        );

      default:
        return <div key={element.id} />;
    }
  }
}

// 금지 도구 컴포넌트 (테스트용)
export const BanToolsDemo: React.FC<BanToolsProps> = ({
  onElementAdd,
  selectedTool,
}) => {
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !onElementAdd) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let element: BanElement;

    switch (selectedTool) {
      case 'ban-circle':
        element = BanToolsManager.createBanCircle(x, y);
        break;
      case 'ban-square':
        element = BanToolsManager.createBanSquare(x, y);
        break;
      case 'ban-line':
        element = BanToolsManager.createBanLine(x, y);
        break;
      case 'ban-cross':
        element = BanToolsManager.createBanCross(x, y);
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
      title={`${selectedTool} 도구 - 클릭하여 배치`}
    />
  );
};

export default BanToolsManager;
