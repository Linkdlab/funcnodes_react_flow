export type ToastStatus = 'default' | 'success' | 'error';
export type ToastType = 'foreground' | 'background';

export interface ToastPayload {
  title?: string;
  description: string;
  status?: ToastStatus;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    altText: string;
    onClick: () => void;
  };
}

export interface ToastData extends ToastPayload {
  open: boolean;
}

export type ToastDispatcher = {
  (payload: ToastPayload): void;
  success: (payload: ToastPayload) => void;
  error: (payload: ToastPayload) => void;
};

export interface ToastContextValue {
  toastElementsMapRef: React.MutableRefObject<Map<string, HTMLElement>>;
  sortToasts: () => void;
}

export interface ToastsProps {
  children: React.ReactNode;
  fixedHeight?: number;
  duration?: number;
  maxVisible?: number;
}
