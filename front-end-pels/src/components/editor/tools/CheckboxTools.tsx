import type React from 'react';
import { Check, X } from 'lucide-react';

export interface CheckboxElement {
  id: string;
  type:
    | 'checkbox-empty'
    | 'checkbox-checked'
    | 'checkbox-check'
    | 'checkbox-cross';
  x: number;
  y: number;
  width: number;
  height: number;
  checked: boolean;
  checkType: 'none' | 'checkmark' | 'cross';
  borderColor: string;
  fillColor: string;
  checkColor: string;
}

export interface CheckboxToolsProps {
  onElementAdd?: (element: CheckboxElement) => void;
  selectedTool?: string;
}

export class CheckboxToolsManager {
  // 빈 체크박스 생성
  static createEmptyCheckbox(
    x: number,
    y: number,
    size: number = 20
  ): CheckboxElement {
    console.log('☐ [CheckboxTools] 빈 체크박스 생성:', { x, y, size });
    return {
      id: `checkbox-empty-${Date.now()}`,
      type: 'checkbox-empty',
      x,
      y,
      width: size,
      height: size,
      checked: false,
      checkType: 'none',
      borderColor: '#374151',
      fillColor: '#ffffff',
      checkColor: '#059669',
    };
  }

  // 체크된 체크박스 생성
  static createCheckedCheckbox(
    x: number,
    y: number,
    size: number = 20
  ): CheckboxElement {
    console.log('☑ [CheckboxTools] 체크된 체크박스 생성:', { x, y, size });
    return {
      id: `checkbox-checked-${Date.now()}`,
      type: 'checkbox-checked',
      x,
      y,
      width: size,
      height: size,
      checked: true,
      checkType: 'checkmark',
      borderColor: '#059669',
      fillColor: '#d1fae5',
      checkColor: '#059669',
    };
  }

  // 체크 표시만 생성
  static createCheckMark(
    x: number,
    y: number,
    size: number = 16
  ): CheckboxElement {
    console.log('✓ [CheckboxTools] 체크 표시 생성:', { x, y, size });
    return {
      id: `checkbox-check-${Date.now()}`,
      type: 'checkbox-check',
      x,
      y,
      width: size,
      height: size,
      checked: true,
      checkType: 'checkmark',
      borderColor: 'transparent',
      fillColor: 'transparent',
      checkColor: '#059669',
    };
  }

  // X 표시만 생성
  static createCrossMark(
    x: number,
    y: number,
    size: number = 16
  ): CheckboxElement {
    console.log('✗ [CheckboxTools] X 표시 생성:', { x, y, size });
    return {
      id: `checkbox-cross-${Date.now()}`,
      type: 'checkbox-cross',
      x,
      y,
      width: size,
      height: size,
      checked: false,
      checkType: 'cross',
      borderColor: 'transparent',
      fillColor: 'transparent',
      checkColor: '#dc2626',
    };
  }

  // 체크박스 상태 토글
  static toggleCheckbox(element: CheckboxElement): CheckboxElement {
    const newElement = { ...element };

    if (
      element.type === 'checkbox-empty' ||
      element.type === 'checkbox-checked'
    ) {
      newElement.checked = !element.checked;
      newElement.checkType = newElement.checked ? 'checkmark' : 'none';
      newElement.borderColor = newElement.checked ? '#059669' : '#374151';
      newElement.fillColor = newElement.checked ? '#d1fae5' : '#ffffff';

      console.log('🔄 [CheckboxTools] 체크박스 토글:', {
        id: element.id,
        이전상태: element.checked,
        새상태: newElement.checked,
      });
    }

    return newElement;
  }

  // 체크박스 요소 렌더링
  static renderCheckboxElement(
    element: CheckboxElement,
    onClick?: (element: CheckboxElement) => void
  ): JSX.Element {
    const containerStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: onClick ? 'pointer' : 'default',
    };

    const boxStyle = {
      width: '100%',
      height: '100%',
      border:
        element.borderColor !== 'transparent'
          ? `2px solid ${element.borderColor}`
          : 'none',
      backgroundColor: element.fillColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '2px',
    };

    const renderCheckIcon = () => {
      const iconSize = Math.max(12, element.width * 0.6);

      switch (element.checkType) {
        case 'checkmark':
          return (
            <Check size={iconSize} color={element.checkColor} strokeWidth={3} />
          );
        case 'cross':
          return (
            <X size={iconSize} color={element.checkColor} strokeWidth={3} />
          );
        default:
          return null;
      }
    };

    return (
      <div
        key={element.id}
        style={containerStyle}
        className="hover:opacity-80 transition-opacity"
        onClick={() => onClick?.(element)}
        title={`${element.type} - ${element.checked ? '체크됨' : '체크 안됨'}`}
      >
        <div style={boxStyle}>{renderCheckIcon()}</div>
      </div>
    );
  }
}

// 체크박스 도구 컴포넌트 (테스트용)
export const CheckboxToolsDemo: React.FC<CheckboxToolsProps> = ({
  onElementAdd,
  selectedTool,
}) => {
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !onElementAdd) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let element: CheckboxElement;

    switch (selectedTool) {
      case 'checkbox-empty':
        element = CheckboxToolsManager.createEmptyCheckbox(x, y);
        break;
      case 'checkbox-checked':
        element = CheckboxToolsManager.createCheckedCheckbox(x, y);
        break;
      case 'checkbox-check':
        element = CheckboxToolsManager.createCheckMark(x, y);
        break;
      case 'checkbox-cross':
        element = CheckboxToolsManager.createCrossMark(x, y);
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
      title={`${selectedTool} 도구 - 클릭하여 체크박스 배치`}
    />
  );
};

export default CheckboxToolsManager;
