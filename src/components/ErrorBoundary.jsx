import React from "react";

import Icon from "./Icon";
import { GLASS_PANEL } from "../constants/glass";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`${GLASS_PANEL} p-6 flex flex-col items-center justify-center text-center !bg-red-50/60 !border-red-200`}
        >
          <Icon
            name="Info"
            size={34}
            className="text-red-500 mb-3"
          />

          <h2 className="text-lg font-bold">
            Visualizer Crashed
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            This module encountered an unexpected error.
            The rest of the application will continue
            functioning normally.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}