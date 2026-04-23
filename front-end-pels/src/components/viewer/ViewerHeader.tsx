// import { ZoomIn, ZoomOut, RotateCw, Download, Search } from 'lucide-react';
// import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { useState } from 'react';

// after
import { ZoomIn, ZoomOut, MessageCircle, QrCode } from 'lucide-react';
interface ViewerHeaderProps {
  isDbMode: boolean;
  hasPdf: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onDownload?: () => void;
  onSearch?: () => void;
  zoomLevel?: number;
  onPickPdf?: (file: File) => void;
  onPickJson?: (file: File) => void;
  onSaveJsonWithValues?: () => void;
  onSavePdf?: () => void;
  onPickConstraintJson?: (file: File) => void;
  hasDialog?: boolean;
  hasQrDialog?: boolean;
  onShowDialog?: () => void;
  onShowQrDialog?: () => void;
  hideDialogControls?: boolean;
  hidePdfSave?: boolean;
  hideValueJsonSave?: boolean;
}

export function ViewerHeader({
  isDbMode = false,
  hasPdf = false,

  onZoomIn,
  onZoomOut,
  // onRotate,
  // onDownload,
  // onSearch,
  zoomLevel = 100,
  onPickPdf,
  onPickJson,
  onSaveJsonWithValues,
  onSavePdf,
  onPickConstraintJson,
  hasDialog = false,
  hasQrDialog = false,
  onShowDialog,
  onShowQrDialog,
  hideDialogControls = false,
  hidePdfSave = false,
  hideValueJsonSave = false,
}: ViewerHeaderProps) {
  const [hasPdfLoaded, setHasPdfLoaded] = useState(false);
  const pdfReady = isDbMode ? hasPdf : hasPdfLoaded;

  const pickPdf = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      onPickPdf?.(f);
      setHasPdfLoaded(true);
    };
    input.click();
  };

  const pickJson = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF를 불러온 후 JSON 템플릿을 불러와 주세요.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      onPickJson?.(f);
    };
    input.click();
  };

  const pickConstraintJson = () => {
    if (!hasPdfLoaded) {
      alert('먼저 PDF를 불러온 후 Rule JSON을 불러와 주세요.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      onPickConstraintJson?.(f);
    };
    input.click();
  };

  return (
    <div
      className="viewer-header flex items-center justify-between px-6"
      style={{
        height: '50px',
        background: 'linear-gradient(90deg, #00b894, #00cec9)',
        color: '#ffffff',
      }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-2">
        {!isDbMode && (
          <>
            <Button
              onClick={pickPdf}
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1 rounded-lg"
            >
              PDF 불러오기
            </Button>

            <Button
              onClick={pickJson}
              variant="ghost"
              size="sm"
              className={`text-xs px-3 py-1 rounded-lg ${
                hasPdfLoaded
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-white/10 opacity-40 cursor-not-allowed'
              }`}
              disabled={!hasPdfLoaded}
            >
              JSON 불러오기
            </Button>

            <Button
              onClick={pickConstraintJson}
              variant="ghost"
              size="sm"
              className={`text-xs px-3 py-1 rounded-lg ${
                hasPdfLoaded
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-white/10 opacity-40 cursor-not-allowed'
              }`}
              disabled={!hasPdfLoaded}
              title={
                hasPdfLoaded
                  ? 'Rule JSON 불러오기'
                  : '먼저 PDF를 불러와야 합니다'
              }
            >
              Rule 불러오기
            </Button>
          </>
        )}
      </div>

      {/* RIGHT (Dialog/QR + controls) */}
      <div className="flex items-center gap-3">
        {/* ✅ Dialog/QR: 더 눈에 띄는 스타일 + 오른쪽에 붙임 */}
        {/*버튼 주석처리 - Dialog,QR*/}
        {/*{!hideDialogControls && (onShowDialog || onShowQrDialog) && (
          <div className="flex items-center gap-2">
            {onShowDialog && (
              <Button
                onClick={onShowDialog}
                variant="ghost"
                size="sm"
                disabled={!hasDialog}
                className={`h-9 px-4 rounded-xl text-sm font-semibold shadow-md ring-1 ring-white/30
                ${
                  hasDialog
                    ? 'bg-white text-emerald-700 hover:bg-white/90'
                    : 'bg-white/15 text-white/60 cursor-not-allowed opacity-100'
                }`}
                title={hasDialog ? 'Dialog' : '이 페이지에는 Dialog가 없습니다'}
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                Dialog
              </Button>
            )}

            {onShowQrDialog && (
              <Button
                onClick={onShowQrDialog}
                variant="ghost"
                size="sm"
                disabled={!hasQrDialog}
                className={`h-9 px-4 rounded-xl text-sm font-semibold shadow-md ring-1 ring-white/30
                ${
                  hasQrDialog
                    ? 'bg-white text-emerald-700 hover:bg-white/90'
                    : 'bg-white/15 text-white/60 cursor-not-allowed opacity-100'
                }`}
                title={hasQrDialog ? 'QR' : '이 페이지에는 QR이 없습니다'}
              >
                <QrCode className="h-4 w-4 mr-1.5" />
                QR
              </Button>
            )}
          </div>
        )}*/}

        {/* 기존 오른쪽 컨트롤 */}
        <div className="viewer-controls flex items-center space-x-2 bg-white/10 px-4 py-0.5 rounded-lg">
          <Button onClick={onZoomOut} variant="ghost" size="sm" title="축소">
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-xs text-white px-2 min-w-[60px] text-center">
            {zoomLevel}%
          </span>

          <Button onClick={onZoomIn} variant="ghost" size="sm" title="확대">
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {!isDbMode && !hideValueJsonSave && (
            <Button
              onClick={onSaveJsonWithValues}
              variant="ghost"
              size="sm"
              className={`text-xs px-3 py-1 rounded-lg ${
                pdfReady
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-white/10 opacity-40 cursor-not-allowed'
              }`}
              disabled={!pdfReady}
              title="현재 값 포함 JSON 저장"
            >
              값 JSON
            </Button>
          )}
          {/*버튼 주석처리 - PDF 저장*/}
          {/*{!hidePdfSave && (
            <Button
              onClick={onSavePdf}
              variant="ghost"
              size="sm"
              className={`text-xs px-3 py-1 rounded-lg ${
                isDbMode || pdfReady
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-white/10 opacity-40 cursor-not-allowed'
              }`}
              disabled={!isDbMode && !pdfReady}
              title="서식화된 PDF 저장"
            >
              PDF 저장
            </Button>
          )}*/}
        </div>
      </div>
    </div>
  );
}
