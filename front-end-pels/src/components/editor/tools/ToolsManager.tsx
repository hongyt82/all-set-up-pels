import type React from 'react';
import type { ToolCategory } from '../EditorHeader.tsx';

// 각 도구별 매니저 import
import BanToolsManager, { BanToolsDemo } from './BanTools.tsx';
import type { BanElement } from './BanTools.tsx';
import TextToolsManager, { TextToolsDemo } from './TextTools.tsx';
import type { TextElement } from './TextTools.tsx';
import CheckboxToolsManager, { CheckboxToolsDemo } from './CheckboxTools.tsx';
import type { CheckboxElement } from './CheckboxTools.tsx';
import CalendarToolsManager, { CalendarToolsDemo } from './CalendarTools.tsx';
import type { CalendarElement } from './CalendarTools.tsx';
import SignatureToolsManager, {
  SignatureToolsDemo,
} from './SignatureTools.tsx';
import type { SignatureElement } from './SignatureTools.tsx';
import CircleToolsManager, { CircleToolsDemo } from './CircleTools.tsx';
import type { CircleElement } from './CircleTools.tsx';

// 옵션 타입 정의: 각 도구에서 사용하는 속성의 합집합
type CreateOptions = {
  // ban
  size?: number;
  width?: number;
  height?: number;
  length?: number;
  // text
  content?: string;
  // signature
  name?: string;
  text?: string;
  // circle
  radius?: number;
};

// 통합 요소 타입
export type PDFElement =
  | BanElement
  | TextElement
  | CheckboxElement
  | CalendarElement
  | SignatureElement
  | CircleElement;

export interface ToolsManagerProps {
  selectedCategory: ToolCategory;
  selectedTool?: string;
  onElementAdd?: (element: PDFElement) => void;
  elements?: PDFElement[];
}

// 통합 도구 매니저 클래스
export class ToolsManager {
  // 카테고리별 요소 생성
  static createElement(
    category: ToolCategory,
    tool: string,
    x: number,
    y: number,
    options?: CreateOptions
  ): PDFElement | null {
    console.log('🔧 [ToolsManager] 요소 생성:', {
      category,
      tool,
      x,
      y,
      options,
    });

    switch (category) {
      case 'ban':
        switch (tool) {
          case 'ban-circle':
            return BanToolsManager.createBanCircle(x, y, options?.size);
          case 'ban-square':
            return BanToolsManager.createBanSquare(
              x,
              y,
              options?.width,
              options?.height
            );
          case 'ban-line':
            return BanToolsManager.createBanLine(x, y, options?.length);
          case 'ban-cross':
            return BanToolsManager.createBanCross(x, y, options?.size);
          default:
            return null;
        }

      case 'textbox':
        switch (tool) {
          case 'text-input':
            return TextToolsManager.createTextInput(x, y, options?.content);
          case 'text-bold':
            return TextToolsManager.createBoldText(x, y, options?.content);
          case 'text-italic':
            return TextToolsManager.createItalicText(x, y, options?.content);
          case 'text-underline':
            return TextToolsManager.createUnderlineText(x, y, options?.content);
          case 'text-align-left':
            return TextToolsManager.createLeftAlignText(x, y, options?.content);
          case 'text-align-center':
            return TextToolsManager.createCenterAlignText(
              x,
              y,
              options?.content
            );
          case 'text-align-right':
            return TextToolsManager.createRightAlignText(
              x,
              y,
              options?.content
            );
          default:
            return null;
        }

      case 'checkbox':
        switch (tool) {
          case 'checkbox-empty':
            return CheckboxToolsManager.createEmptyCheckbox(
              x,
              y,
              options?.size
            );
          case 'checkbox-checked':
            return CheckboxToolsManager.createCheckedCheckbox(
              x,
              y,
              options?.size
            );
          case 'checkbox-check':
            return CheckboxToolsManager.createCheckMark(x, y, options?.size);
          case 'checkbox-cross':
            return CheckboxToolsManager.createCrossMark(x, y, options?.size);
          default:
            return null;
        }

      case 'calendar':
        switch (tool) {
          case 'calendar-full':
            return CalendarToolsManager.createFullCalendar(x, y);
          case 'calendar-days':
            return CalendarToolsManager.createDatePicker(x, y);
          case 'calendar-clock':
            return CalendarToolsManager.createTimePicker(x, y);
          case 'calendar-range':
            return CalendarToolsManager.createDateRange(x, y);
          default:
            return null;
        }

      case 'signature':
        switch (tool) {
          case 'signature-pen':
            return SignatureToolsManager.createPenSignature(x, y);
          case 'signature-text':
            return SignatureToolsManager.createTextSignature(
              x,
              y,
              options?.name
            );
          case 'signature-draw':
            return SignatureToolsManager.createDrawSignature(x, y);
          case 'signature-stamp':
            return SignatureToolsManager.createStampSignature(
              x,
              y,
              options?.text
            );
          default:
            return null;
        }

      case 'circle':
        switch (tool) {
          case 'circle-outline':
            return CircleToolsManager.createCircleOutline(
              x,
              y,
              options?.radius
            );
          case 'circle-filled':
            return CircleToolsManager.createCircleFilled(x, y, options?.radius);
          case 'circle-dot':
            return CircleToolsManager.createCircleDot(x, y, options?.radius);
          case 'circle-ring':
            return CircleToolsManager.createCircleRing(x, y, options?.radius);
          default:
            return null;
        }

      default:
        return null;
    }
  }

  // 요소 렌더링
  static renderElement(element: PDFElement): JSX.Element {
    switch (element.type) {
      // Ban 요소들
      case 'ban-circle':
      case 'ban-square':
      case 'ban-line':
      case 'ban-cross':
        return BanToolsManager.renderBanElement(element as BanElement);

      // Text 요소들
      case 'text-input':
      case 'text-bold':
      case 'text-italic':
      case 'text-underline':
      case 'text-align-left':
      case 'text-align-center':
      case 'text-align-right':
        return TextToolsManager.renderTextElement(element as TextElement);

      // Checkbox 요소들
      case 'checkbox-empty':
      case 'checkbox-checked':
      case 'checkbox-check':
      case 'checkbox-cross':
        return CheckboxToolsManager.renderCheckboxElement(
          element as CheckboxElement
        );

      // Calendar 요소들
      case 'calendar-full':
      case 'calendar-days':
      case 'calendar-clock':
      case 'calendar-range':
        return CalendarToolsManager.renderCalendarElement(
          element as CalendarElement
        );

      // Signature 요소들
      case 'signature-pen':
      case 'signature-text':
      case 'signature-draw':
      case 'signature-stamp':
        return SignatureToolsManager.renderSignatureElement(
          element as SignatureElement
        );

      // Circle 요소들
      case 'circle-outline':
      case 'circle-filled':
      case 'circle-dot':
      case 'circle-ring':
        return CircleToolsManager.renderCircleElement(element as CircleElement);

      default:
        return <div />;
    }
  }

  // 요소 타입별 통계
  static getElementStats(elements: PDFElement[]) {
    const stats = {
      ban: 0,
      textbox: 0,
      checkbox: 0,
      calendar: 0,
      signature: 0,
      circle: 0,
      total: elements.length,
    };

    elements.forEach(element => {
      if (element.type.startsWith('ban-')) stats.ban++;
      else if (element.type.startsWith('text-')) stats.textbox++;
      else if (element.type.startsWith('checkbox-')) stats.checkbox++;
      else if (element.type.startsWith('calendar-')) stats.calendar++;
      else if (element.type.startsWith('signature-')) stats.signature++;
      else if (element.type.startsWith('circle-')) stats.circle++;
    });

    console.log('📊 [ToolsManager] 요소 통계:', stats);
    return stats;
  }
}

// 통합 도구 컴포넌트
export const ToolsManagerDemo: React.FC<ToolsManagerProps> = ({
  selectedCategory,
  selectedTool,
  onElementAdd,
  elements = [],
}) => {
  if (!selectedCategory || !selectedTool) return null;

  const demoProps = {
    onElementAdd,
    selectedTool,
  };

  // 현재 선택된 카테고리에 따라 적절한 도구 컴포넌트 렌더링
  const renderToolDemo = () => {
    switch (selectedCategory) {
      case 'ban':
        return <BanToolsDemo {...demoProps} />;
      case 'textbox':
        return <TextToolsDemo {...demoProps} />;
      case 'checkbox':
        return <CheckboxToolsDemo {...demoProps} />;
      case 'calendar':
        return <CalendarToolsDemo {...demoProps} />;
      case 'signature':
        return <SignatureToolsDemo {...demoProps} />;
      case 'circle':
        return <CircleToolsDemo {...demoProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0">
      {/* 기존 요소들 렌더링 */}
      {elements.map(element => ToolsManager.renderElement(element))}

      {/* 현재 선택된 도구의 데모 컴포넌트 */}
      {renderToolDemo()}

      {/* 개발용 정보 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/75 text-white p-2 rounded text-xs">
          <div>카테고리: {selectedCategory}</div>
          <div>도구: {selectedTool}</div>
          <div>요소 수: {elements.length}</div>
        </div>
      )}
    </div>
  );
};

export default ToolsManager;
