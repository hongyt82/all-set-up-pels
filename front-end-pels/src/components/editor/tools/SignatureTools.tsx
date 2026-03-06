import React, { useRef, useEffect, useState } from 'react';
import { PenTool, Pen } from 'lucide-react';

export interface SignatureElement {
  id: string;
  type:
    | 'signature-pen'
    | 'signature-text'
    | 'signature-draw'
    | 'signature-stamp';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  paths?: string[];
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  borderColor: string;
}

export interface SignatureToolsProps {
  onElementAdd?: (element: SignatureElement) => void;
  selectedTool?: string;
}

export class SignatureToolsManager {
  // 펜 서명 생성
  static createPenSignature(x: number, y: number): SignatureElement {
    console.log('✒️ [SignatureTools] 펜 서명 생성:', { x, y });
    return {
      id: `signature-pen-${Date.now()}`,
      type: 'signature-pen',
      x,
      y,
      width: 200,
      height: 80,
      paths: [],
      strokeColor: '#1f2937',
      strokeWidth: 2,
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
    };
  }

  // 텍스트 서명 생성
  static createTextSignature(
    x: number,
    y: number,
    name: string = '홍길동'
  ): SignatureElement {
    console.log('📝 [SignatureTools] 텍스트 서명 생성:', { x, y, name });
    return {
      id: `signature-text-${Date.now()}`,
      type: 'signature-text',
      x,
      y,
      width: 150,
      height: 40,
      content: name,
      strokeColor: '#1f2937',
      strokeWidth: 1,
      backgroundColor: 'transparent',
      borderColor: '#d1d5db',
    };
  }

  // 자유 그리기 서명 생성
  static createDrawSignature(x: number, y: number): SignatureElement {
    console.log('🎨 [SignatureTools] 자유 그리기 서명 생성:', { x, y });
    return {
      id: `signature-draw-${Date.now()}`,
      type: 'signature-draw',
      x,
      y,
      width: 250,
      height: 100,
      paths: [],
      strokeColor: '#1f2937',
      strokeWidth: 3,
      backgroundColor: '#f9fafb',
      borderColor: '#d1d5db',
    };
  }

  // 도장 서명 생성
  static createStampSignature(
    x: number,
    y: number,
    text: string = '인'
  ): SignatureElement {
    console.log('🔴 [SignatureTools] 도장 서명 생성:', { x, y, text });
    return {
      id: `signature-stamp-${Date.now()}`,
      type: 'signature-stamp',
      x,
      y,
      width: 60,
      height: 60,
      content: text,
      strokeColor: '#dc2626',
      strokeWidth: 3,
      backgroundColor: '#ffffff',
      borderColor: '#dc2626',
    };
  }

  // 서명 요소 렌더링
  static renderSignatureElement(element: SignatureElement): JSX.Element {
    const containerStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: `1px solid ${element.borderColor}`,
      backgroundColor: element.backgroundColor,
      borderRadius: element.type === 'signature-stamp' ? '50%' : '4px',
      padding: '4px',
      cursor: 'pointer',
    };

    switch (element.type) {
      case 'signature-pen':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="shadow-sm hover:shadow-md transition-shadow"
            title="펜 서명 영역"
          >
            <div className="w-full h-full relative bg-white rounded">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                {element.paths && element.paths.length > 0 ? (
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {element.paths.map((path, index) => (
                      <path
                        key={index}
                        d={path}
                        stroke={element.strokeColor}
                        strokeWidth={element.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
                ) : (
                  <div className="flex flex-col items-center">
                    <PenTool size={20} />
                    <span className="text-xs mt-1">서명하기</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'signature-text':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
            title="텍스트 서명"
          >
            <span
              style={{
                color: element.strokeColor,
                fontSize: '18px',
                fontFamily: 'serif',
                fontStyle: 'italic',
              }}
            >
              {element.content || '서명'}
            </span>
          </div>
        );

      case 'signature-draw':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="shadow-sm hover:shadow-md transition-shadow"
            title="자유 그리기 영역"
          >
            <div className="w-full h-full relative">
              {element.paths && element.paths.length > 0 ? (
                <svg width="100%" height="100%" className="absolute inset-0">
                  {element.paths.map((path, index) => (
                    <path
                      key={index}
                      d={path}
                      stroke={element.strokeColor}
                      strokeWidth={element.strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  <div className="flex flex-col items-center">
                    <Pen size={24} />
                    <span className="text-xs mt-1">그리기</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'signature-stamp':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
            title="도장"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="absolute inset-1 rounded-full"
                style={{ border: `2px solid ${element.strokeColor}` }}
              />
              <span
                style={{
                  color: element.strokeColor,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'serif',
                }}
              >
                {element.content || '인'}
              </span>
            </div>
          </div>
        );

      default:
        return <div key={element.id} />;
    }
  }
}

// 서명 캔버스 컴포넌트
export const SignatureCanvas: React.FC<{
  element: SignatureElement;
}> = ({ element }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = element.strokeColor;
    ctx.lineWidth = element.strokeWidth;
  }, [element.strokeColor, element.strokeWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // 실제 구현에서는 경로를 SVG path로 변환하여 저장
    console.log('서명 그리기 완료');
  };

  return (
    <canvas
      ref={canvasRef}
      width={element.width - 8}
      height={element.height - 8}
      className="cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

// 서명 도구 컴포넌트 (테스트용)
export const SignatureToolsDemo: React.FC<SignatureToolsProps> = ({
  onElementAdd,
  selectedTool,
}) => {
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !onElementAdd) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let element: SignatureElement;

    switch (selectedTool) {
      case 'signature-pen':
        element = SignatureToolsManager.createPenSignature(x, y);
        break;
      case 'signature-text':
        element = SignatureToolsManager.createTextSignature(x, y);
        break;
      case 'signature-draw':
        element = SignatureToolsManager.createDrawSignature(x, y);
        break;
      case 'signature-stamp':
        element = SignatureToolsManager.createStampSignature(x, y);
        break;
      default:
        return;
    }

    onElementAdd(element);
  };

  return (
    <div
      className="absolute inset-0 cursor-pointer"
      onClick={handleCanvasClick}
      title={`${selectedTool} 도구 - 클릭하여 서명 영역 배치`}
    />
  );
};

export default SignatureToolsManager;
