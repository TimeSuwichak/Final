import React from "react";

type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // You could send this to a logging endpoint
    // console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-red-50">
          <div className="max-w-3xl w-full bg-white border border-red-200 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-2 text-red-700">เกิดข้อผิดพลาดในแอป</h2>
            <p className="text-sm text-muted-foreground mb-4">มีข้อผิดพลาดขณะโหลดหน้าเว็บ — ข้อความ:</p>
            <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded border text-red-600 overflow-auto" style={{ maxHeight: 300 }}>
              {String(this.state.error && (this.state.error.stack || this.state.error.message))}
            </pre>
            <div className="mt-4 text-right">
              <button
                onClick={() => this.setState({ error: null })}
                className="px-3 py-1 rounded bg-red-100 text-red-700"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
