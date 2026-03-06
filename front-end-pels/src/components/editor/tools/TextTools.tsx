import type React from 'react';

export interface TextElement {
  id: string;
  type:
    | 'text-input'
    | 'text-bold'
    | 'text-italic'
    | 'text-underline'
    | 'text-align-left'
    | 'text-align-center'
    | 'text-align-right';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface TextToolsProps {
  onElementAdd?: (element: TextElement) => void;
  selectedTool?: string;
}

export class TextToolsManager {
  // 기본 텍스트 입력 생성
  static createTextInput(
    x: number,
    y: number,
    content: string = '텍스트를 입력하세요'
  ): TextElement {
    console.log('📝 [TextTools] 텍스트 입력 생성:', { x, y, content });
    return {
      id: `text-input-${Date.now()}`,
      type: 'text-input',
      x,
      y,
      width: 200,
      height: 30,
      content,
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      color: '#000000',
    };
  }

  // 굵은 텍스트 생성
  static createBoldText(
    x: number,
    y: number,
    content: string = '굵은 텍스트'
  ): TextElement {
    console.log('📝 [TextTools] 굵은 텍스트 생성:', { x, y, content });
    return {
      ...this.createTextInput(x, y, content),
      id: `text-bold-${Date.now()}`,
      type: 'text-bold',
      fontWeight: 'bold',
    };
  }

  // 기울임 텍스트 생성
  static createItalicText(
    x: number,
    y: number,
    content: string = '기울임 텍스트'
  ): TextElement {
    console.log('📝 [TextTools] 기울임 텍스트 생성:', { x, y, content });
    return {
      ...this.createTextInput(x, y, content),
      id: `text-italic-${Date.now()}`,
      type: 'text-italic',
      fontStyle: 'italic',
    };
  }

  // 밑줄 텍스트 생성
  static createUnderlineText(
    x: number,
    y: number,
    content: string = '밑줄 텍스트'
  ): TextElement {
    console.log('📝 [TextTools] 밑줄 텍스트 생성:', { x, y, content });
    return {
      ...this.createTextInput(x, y, content),
      id: `text-underline-${Date.now()}`,
      type: 'text-underline',
      textDecoration: 'underline',
    };
  }

  // 왼쪽 정렬 텍스트 생성
  static createLeftAlignText(
    x: number,
    y: number,
    content: string = '왼쪽 정렬'
  ): TextElement {
    console.log('📝 [TextTools] 왼쪽 정렬 텍스트 생성:', { x, y, content });
    return {
      ...this.createTextInput(x, y, content),
      id: `text-align-left-${Date.now()}`,
      type: 'text-align-left',
      textAlign: 'left',
    };
  }

  // 가운데 정렬 텍스트 생성
  static createCenterAlignText(
    x: number,
    y: number,
    content: string = '가운데 정렬'
  ): TextElement {
    console.log('📝 [TextTools] 가운데 정렬 텍스트 생성:', { x, y, content });
    return {
      ...this.createTextInput(x, y, content),
      id: `text-align-center-${Date.now()}`,
      type: 'text-align-center',
      textAlign: 'center',
    };
  }

  // 오른쪽 정렬 텍스트 생성
  static createRightAlignText(
    x: number,
    y: number,
    content: string = '오른쪽 정렬'
  ): TextElement {
    console.log('📝 [TextTools] 오른쪽 정렬 텍스트 생성:', { x, y, content });
    return {
      ...this.createTextInput(x, y, content),
      id: `text-align-right-${Date.now()}`,
      type: 'text-align-right',
      textAlign: 'right',
    };
  }

  // 텍스트 요소 렌더링
  static renderTextElement(
    element: TextElement,
    isEditing: boolean = false
  ): JSX.Element {
    const style = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      textDecoration: element.textDecoration,
      textAlign: element.textAlign,
      color: element.color,
      border: isEditing ? '2px solid #3b82f6' : '1px solid transparent',
      padding: '4px',
      backgroundColor: isEditing ? '#f0f9ff' : 'transparent',
      cursor: isEditing ? 'text' : 'default',
    };

    if (isEditing) {
      return (
        <input
          key={element.id}
          type="text"
          defaultValue={element.content}
          style={style}
          className="outline-none resize-none"
          placeholder="텍스트를 입력하세요..."
          onBlur={e => {
            element.content = e.target.value;
            console.log('📝 [TextTools] 텍스트 편집 완료:', element.content);
          }}
          autoFocus
        />
      );
    }

    return (
      <div
        key={element.id}
        style={style}
        className="select-none hover:bg-blue-50/30 transition-colors"
        title={`${element.type}: ${element.content}`}
      >
        {element.content}
      </div>
    );
  }
}

// 텍스트 도구 컴포넌트 (테스트용)
export const TextToolsDemo: React.FC<TextToolsProps> = ({
  onElementAdd,
  selectedTool,
}) => {
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !onElementAdd) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let element: TextElement;

    switch (selectedTool) {
      case 'text-input':
        element = TextToolsManager.createTextInput(x, y);
        break;
      case 'text-bold':
        element = TextToolsManager.createBoldText(x, y);
        break;
      case 'text-italic':
        element = TextToolsManager.createItalicText(x, y);
        break;
      case 'text-underline':
        element = TextToolsManager.createUnderlineText(x, y);
        break;
      case 'text-align-left':
        element = TextToolsManager.createLeftAlignText(x, y);
        break;
      case 'text-align-center':
        element = TextToolsManager.createCenterAlignText(x, y);
        break;
      case 'text-align-right':
        element = TextToolsManager.createRightAlignText(x, y);
        break;
      default:
        return;
    }

    onElementAdd(element);
  };

  return (
    <div
      className="absolute inset-0 cursor-text"
      onClick={handleCanvasClick}
      title={`${selectedTool} 도구 - 클릭하여 텍스트 추가`}
    />
  );
};

export default TextToolsManager;
