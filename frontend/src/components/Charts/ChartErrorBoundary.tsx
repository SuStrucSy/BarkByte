import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  chartName?: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(
      `Chart error in ${this.props.chartName || "Unknown"}:`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-100 gap-4 text-muted-foreground">
          <AlertCircle className="h-12 w-12" />
          <div className="text-center">
            <div className="font-semibold">Failed to render chart</div>
            {this.state.error && (
              <div className="text-xs mt-2 max-w-md">
                {this.state.error.message}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
