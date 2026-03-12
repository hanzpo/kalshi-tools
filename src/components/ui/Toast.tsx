interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[1000] -translate-x-1/2 animate-toast-up rounded-md bg-brand px-5 py-3 text-sm font-medium text-white shadow-[0_4px_12px_rgba(5,150,105,0.3)]">
      {message}
    </div>
  );
}
