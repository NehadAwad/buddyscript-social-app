"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      JSON.stringify({
        level: "error",
        event: "react_error_boundary",
        message: error.message,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      })
    );
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="_login_area">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="_login_form_content _b_radious6 _padd_t48 _padd_b48 _padd_l24 _padd_r24 text-center">
                  <h1 className="_title3 _mar_b16">Something went wrong</h1>
                  <p className="_mar_b24">
                    An unexpected error occurred. Please try again.
                  </p>
                  <button
                    type="button"
                    className="_btn1 _dis_inline_block"
                    onClick={this.handleRetry}
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
