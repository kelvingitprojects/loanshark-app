import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './pages/Admin';
import { ThemeProvider } from './components/ThemeProvider';
// FIX: Module '"@apollo/client"' has no exported member 'ApolloProvider'.
// `ApolloProvider` is now imported from '@apollo/client/react' to fix module resolution issues.
// `createHttpLink` is imported to configure the Apollo Client link.
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import BorrowerDashboard from './pages/BorrowerDashboard';

// FIX: Object literal may only specify known properties, and 'uri' does not exist in type 'Options'.
// The client now uses `createHttpLink` to set up the connection to the GraphQL server.
// In production on Vercel, set `VITE_GRAPHQL_URL` to your Render backend URL.
const httpLink = createHttpLink({
  uri: (import.meta as any).env?.VITE_GRAPHQL_URL || '/graphql'
});
const authLink = setContext((_, { headers }) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Prefer admin API key on admin routes (override forceBorrowerMode)
  let adminKey: string | undefined;
  try {
    const stored = window.localStorage.getItem('adminApiKey');
    adminKey = stored || (import.meta.env.VITE_API_KEY as string | undefined);
  } catch (_) {
    adminKey = import.meta.env.VITE_API_KEY as string | undefined;
  }
  if (pathname.startsWith('/admin') && adminKey) {
    return { headers: { ...headers, 'x-api-key': adminKey } };
  }

  // Respect forceBorrowerMode for non-admin routes
  try {
    const fb = window.localStorage.getItem('forceBorrowerMode');
    if (fb === 'true') {
      try {
        const raw = window.localStorage.getItem('borrowerAuth');
        const auth = raw ? JSON.parse(raw) : null;
        if (auth?.id && auth?.csrfToken) {
          return { headers: { ...headers, 'x-borrower-id': auth.id, 'x-csrf-token': auth.csrfToken } };
        }
      } catch (_) {}
      return { headers: { ...headers } };
    }
  } catch (_) {}

  // Otherwise attach borrower if available
  try {
    const raw = window.localStorage.getItem('borrowerAuth');
    const auth = raw ? JSON.parse(raw) : null;
    if (auth?.id && auth?.csrfToken) {
      return { headers: { ...headers, 'x-borrower-id': auth.id, 'x-csrf-token': auth.csrfToken } };
    }
  } catch (_) {}

  // Fallback to admin key if present
  if (adminKey) {
    return { headers: { ...headers, 'x-api-key': adminKey } };
  }
  return { headers: { ...headers } };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/borrower" element={<BorrowerDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/" element={(() => {
              try {
                const raw = window.localStorage.getItem('borrowerAuth');
                const auth = raw ? JSON.parse(raw) : null;
                if (auth?.id && auth?.csrfToken) return <Navigate to="/borrower" replace />;
              } catch (_) {}
              return <Navigate to="/admin" replace />;
            })()} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>
);
