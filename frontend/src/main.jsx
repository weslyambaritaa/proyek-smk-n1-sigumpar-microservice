import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./keycloak";
import "./index.css";

function AppWrapper() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        checkLoginIframe: false,
        pkceMethod: "S256",
      })
      .then(() => {
        setReady(true);
      })
      .catch((err) => {
        console.error("Keycloak init failed", err);
      });
  }, []);

  if (!ready) {
    return <div>Loading authentication...</div>;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
);
