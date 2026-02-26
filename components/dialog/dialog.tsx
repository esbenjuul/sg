import { useEffect, useRef } from "preact/hooks";
import { HTMLAttributes } from "preact";
import "./dialog.css";
interface DialogProps extends HTMLAttributes<HTMLDialogElement> {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
}
const Dialog = (
  { isOpen, hasCloseBtn = true, onClose, children }: DialogProps,
) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleCloseDialog = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      handleCloseD();
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
      {hasCloseBtn && (
        <button className="dialog-close-btn" onClick={handleCloseDialog}>
          Close
        </button>
      )}
      {children}
    </dialog>
  );
};

export default Dialog;
