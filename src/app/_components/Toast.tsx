import { useEffect } from "react";
import { css } from "styled-system/css";

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
};

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={css({
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "12px 24px",
        borderRadius: "4px",
        zIndex: 2000,
        animation: "fadeIn 0.3s ease-in-out",
      })}
    >
      {message}
    </div>
  );
};
