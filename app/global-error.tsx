"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Something went wrong! (Global Error)</h2>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{error.message}</p>
          <pre style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', overflowX: 'auto' }}>
            {error.stack}
          </pre>
          <button
            onClick={() => reset()}
            style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
