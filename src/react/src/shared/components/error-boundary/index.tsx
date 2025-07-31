import * as React from "react";
import {
  Component,
  ReactNode,
  ComponentType,
  ReactElement,
  ErrorInfo,
} from "react";

// Base props that all fallback components will receive
export interface BaseFallbackProps {
  error: Error | null;
}

// Props for the ErrorBoundary component
export interface ErrorBoundaryProps<
  TFallbackProps extends BaseFallbackProps = BaseFallbackProps
> {
  children: ReactNode;
  fallback?: ComponentType<TFallbackProps> | ReactElement | null;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackProps?: Omit<TFallbackProps, "error">;
}

// Combined props type that includes both ErrorBoundary props and pass-through props
type ErrorBoundaryPropsWithPassThrough<
  TFallbackProps extends BaseFallbackProps = BaseFallbackProps
> = ErrorBoundaryProps<TFallbackProps> & Omit<TFallbackProps, "error">;

// State for the ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Generic ErrorBoundary class
export class ErrorBoundary<
  TFallbackProps extends BaseFallbackProps = BaseFallbackProps
> extends Component<
  ErrorBoundaryPropsWithPassThrough<TFallbackProps>,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryPropsWithPassThrough<TFallbackProps>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const {
        fallback: Fallback,
        children,
        onError,
        fallbackProps,
        ...restProps
      } = this.props;

      if (!Fallback) {
        return null;
      }

      if (typeof Fallback === "function") {
        // Type assertion needed because TypeScript can't verify the generic constraint
        const FallbackComponent = Fallback as ComponentType<TFallbackProps>;

        const combinedProps = {
          error: this.state.error,
          ...fallbackProps,
          ...restProps,
        } as unknown as TFallbackProps;

        return <FallbackComponent {...combinedProps} />;
      }

      return Fallback;
    }

    return this.props.children;
  }
}
