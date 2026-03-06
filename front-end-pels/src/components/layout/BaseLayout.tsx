// src/components/layout/BaseLayout.tsx
import React from 'react';

interface BaseLayoutProps {
  children: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    // ✅ 다시 고정(fullscreen) + 밝은 배경으로 원복
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
      {children}
    </div>
  );
}

// 아래 두 개는 손대지 말고 그대로 두면 됨
interface MainContainerProps {
  children: React.ReactNode;
}

export function MainContainer({ children }: MainContainerProps) {
  return (
    <main className="bg-white flex items-center justify-center overflow-hidden flex-1">
      <div className="w-full bg-white shadow-lg flex items-center justify-center h-full">
        <div className="flex items-center justify-center w-full h-full">
          {children}
        </div>
      </div>
    </main>
  );
}

interface PDFContainerProps {
  children: React.ReactNode;
}

export function PDFContainer({ children }: PDFContainerProps) {
  return (
    <div
      className="bg-white border-2 border-gray-300 shadow-md flex items-center justify-center"
      style={{
        width: '520px',
        height: '736px',
      }}
    >
      {children}
    </div>
  );
}
