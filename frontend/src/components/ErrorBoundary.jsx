import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("=== RENDER CRASH ===");
    console.error("Error:", error);
    console.error("Component stack:", info.componentStack);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", background: "#fff0f0", border: "2px solid red", margin: 16, borderRadius: 8 }}>
          <h2 style={{ color: "red" }}>Something crashed during render</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#333" }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, color: "#666", marginTop: 8 }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
