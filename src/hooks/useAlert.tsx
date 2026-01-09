import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    isConfirm: boolean;
  }>({
    open: false,
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    isConfirm: false,
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      open: true,
      title: options.title || "Información",
      message: options.message,
      confirmText: options.confirmText || "Aceptar",
      cancelText: options.cancelText || "Cancelar",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      isConfirm: false,
    });
  }, []);

  const showConfirm = useCallback((options: AlertOptions) => {
    setAlertState({
      open: true,
      title: options.title || "Confirmar",
      message: options.message,
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      isConfirm: true,
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    setAlertState((prev) => ({ ...prev, open: false }));
  }, [alertState.onConfirm]);

  const handleCancel = useCallback(() => {
    if (alertState.onCancel) {
      alertState.onCancel();
    }
    setAlertState((prev) => ({ ...prev, open: false }));
  }, [alertState.onCancel]);

  const AlertComponent = () => (
    <AlertDialog open={alertState.open} onOpenChange={(open) => {
      if (!open) {
        handleCancel();
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
          <AlertDialogDescription>{alertState.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {alertState.isConfirm && (
            <AlertDialogCancel onClick={handleCancel}>
              {alertState.cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleConfirm}>
            {alertState.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    showAlert,
    showConfirm,
    AlertComponent,
  };
}

