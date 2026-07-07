import { useEffect } from "react";

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
    <div className="animate-fade-in fixed bottom-5 left-1/2 z-2000 -translate-x-1/2 rounded bg-black/80 px-6 py-3 text-white">
      {message}
    </div>
  );
};
