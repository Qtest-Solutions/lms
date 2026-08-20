import React, { ReactNode, useState } from "react";

type ErrorBoundaryProps = {
  FallbackComponent?: () => ReactNode;
  children?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps, context?: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const { FallbackComponent } = this.props;
      return FallbackComponent ? <FallbackComponent /> : React.Children.toArray(this.props.children);
    }
    return React.Children.toArray(this.props.children);
  }
}