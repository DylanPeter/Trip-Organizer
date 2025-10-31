import { useAuth0 } from "@auth0/auth0-react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  if (isLoading) return null; // or a spinner
  if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: window.location.pathname } });
    return null;
  }
  return children;
}