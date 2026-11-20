import { useEffect, useRef } from "preact/hooks";
import type { HTMLAttributes, TargetedKeyboardEvent } from "preact";
import "./dialog.css";
import { CloseIcon } from "../icons/CloseIcon.tsx";
import { Button } from "../index.ts";

export type CloseReason = "cancel" | "confirm";

interface DialogProps
  extends Omit<HTMLAttributes<HTMLDialogElement>, "onClose"> {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: (reason: CloseReason) => void;
  canClose?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

const Dialog = (
  {
    isOpen,
    hasCloseBtn = true,
    onClose,
    canClose = true,
    children,
    title = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
  }: DialogProps,
) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleCloseDialog = () => {
    onClose?.("cancel");
  };

  const handleConfirmDialog = () => {
    onClose?.("confirm");
  };

  const handleKeyDown = (event: TargetedKeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseDialog();
    }
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    if (isOpen) {
      modalElement.showModal();
    } else {
      modalElement.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={modalRef} onKeyDown={handleKeyDown} className="dialog">
      <header>
        <h2>{title}</h2>
        {hasCloseBtn && (
          <button
            type="button"
            className="reset-button dialog-close-btn"
            onClick={handleCloseDialog}
          >
            <CloseIcon />
            <span>Close</span>
          </button>
        )}
      </header>
      <div className="dialog-content">{children}</div>
      <footer class="row">
        <Button
          type="button"
          buttonType="secondary"
          onClick={handleCloseDialog}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          disabled={!canClose}
          buttonType="primary"
          onClick={handleConfirmDialog}
        >
          {confirmText}
        </Button>
      </footer>
    </dialog>
  );
};

export default Dialog;
