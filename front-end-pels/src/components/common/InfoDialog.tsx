import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog.tsx';

export interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
  variant?: 'default' | 'success' | 'error' | 'warning';
  showLoading?: boolean;
}

export function InfoDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '확인',
  onConfirm,
  variant = 'default',
  showLoading = false,
}: InfoDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 flex items-center gap-2">
            {showLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 whitespace-pre-line">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!showLoading && (
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleConfirm}
              className={getVariantStyles()}
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
