import type React from 'react';
import { Calendar, CalendarDays, Clock, Plus } from 'lucide-react';
import { devLog } from '../../../utils/devConsole';

export interface CalendarElement {
  id: string;
  type: 'calendar-full' | 'calendar-days' | 'calendar-clock' | 'calendar-range';
  x: number;
  y: number;
  width: number;
  height: number;
  selectedDate?: Date;
  selectedTime?: string;
  startDate?: Date;
  endDate?: Date;
  format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'HH:mm';
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface CalendarToolsProps {
  onElementAdd?: (element: CalendarElement) => void;
  selectedTool?: string;
}

export class CalendarToolsManager {
  // 전체 캘린더 생성
  static createFullCalendar(x: number, y: number): CalendarElement {
    devLog('📅 [CalendarTools] 전체 캘린더 생성:', { x, y });
    return {
      id: `calendar-full-${Date.now()}`,
      type: 'calendar-full',
      x,
      y,
      width: 280,
      height: 240,
      selectedDate: new Date(),
      format: 'YYYY-MM-DD',
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      textColor: '#374151',
    };
  }

  // 날짜 선택기 생성
  static createDatePicker(x: number, y: number): CalendarElement {
    devLog('📅 [CalendarTools] 날짜 선택기 생성:', { x, y });
    return {
      id: `calendar-days-${Date.now()}`,
      type: 'calendar-days',
      x,
      y,
      width: 150,
      height: 35,
      selectedDate: new Date(),
      format: 'YYYY-MM-DD',
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb',
      textColor: '#374151',
    };
  }

  // 시간 선택기 생성
  static createTimePicker(x: number, y: number): CalendarElement {
    devLog('🕐 [CalendarTools] 시간 선택기 생성:', { x, y });
    return {
      id: `calendar-clock-${Date.now()}`,
      type: 'calendar-clock',
      x,
      y,
      width: 120,
      height: 35,
      selectedTime: '12:00',
      format: 'HH:mm',
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb',
      textColor: '#374151',
    };
  }

  // 기간 선택기 생성
  static createDateRange(x: number, y: number): CalendarElement {
    devLog('📅 [CalendarTools] 기간 선택기 생성:', { x, y });
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      id: `calendar-range-${Date.now()}`,
      type: 'calendar-range',
      x,
      y,
      width: 300,
      height: 35,
      startDate: now,
      endDate: nextWeek,
      format: 'YYYY-MM-DD',
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb',
      textColor: '#374151',
    };
  }

  // 날짜 포맷팅
  static formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  // 캘린더 요소 렌더링
  static renderCalendarElement(element: CalendarElement): JSX.Element {
    const containerStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: `1px solid ${element.borderColor}`,
      backgroundColor: element.backgroundColor,
      color: element.textColor,
      borderRadius: '4px',
      padding: '8px',
      fontSize: '14px',
    };

    switch (element.type) {
      case 'calendar-full':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            title="전체 캘린더"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {element.selectedDate
                  ? element.selectedDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                    })
                  : '날짜 선택'}
              </span>
              <Calendar size={16} />
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div
                  key={day}
                  className="text-center p-1 font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
              {/* 간단한 캘린더 그리드 (데모용) */}
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 6; // 임시 계산
                const isCurrentDate =
                  dayNum === new Date().getDate() && dayNum > 0 && dayNum <= 31;
                return (
                  <div
                    key={i}
                    className={`text-center p-1 hover:bg-blue-100 rounded ${
                      isCurrentDate
                        ? 'bg-blue-500 text-white'
                        : dayNum > 0 && dayNum <= 31
                          ? 'hover:bg-gray-100'
                          : 'text-gray-300'
                    }`}
                  >
                    {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'calendar-days':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            title="날짜 선택기"
          >
            <span>
              {element.selectedDate
                ? this.formatDate(element.selectedDate, element.format)
                : '날짜 선택'}
            </span>
            <CalendarDays size={16} />
          </div>
        );

      case 'calendar-clock':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            title="시간 선택기"
          >
            <span>{element.selectedTime || '시간 선택'}</span>
            <Clock size={16} />
          </div>
        );

      case 'calendar-range':
        return (
          <div
            key={element.id}
            style={containerStyle}
            className="flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            title="기간 선택기"
          >
            <span>
              {element.startDate && element.endDate
                ? `${this.formatDate(element.startDate, element.format)} ~ ${this.formatDate(element.endDate, element.format)}`
                : '기간 선택'}
            </span>
            <Plus size={16} />
          </div>
        );

      default:
        return <div key={element.id} />;
    }
  }
}

// 캘린더 도구 컴포넌트 (테스트용)
export const CalendarToolsDemo: React.FC<CalendarToolsProps> = ({
  onElementAdd,
  selectedTool,
}) => {
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !onElementAdd) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let element: CalendarElement;

    switch (selectedTool) {
      case 'calendar-full':
        element = CalendarToolsManager.createFullCalendar(x, y);
        break;
      case 'calendar-days':
        element = CalendarToolsManager.createDatePicker(x, y);
        break;
      case 'calendar-clock':
        element = CalendarToolsManager.createTimePicker(x, y);
        break;
      case 'calendar-range':
        element = CalendarToolsManager.createDateRange(x, y);
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
      title={`${selectedTool} 도구 - 클릭하여 캘린더 배치`}
    />
  );
};

export default CalendarToolsManager;
