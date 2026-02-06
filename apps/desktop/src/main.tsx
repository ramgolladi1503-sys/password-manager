import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { App } from "./App";
import { AgentProvider } from "./state/agentContext";
import { VaultProvider } from "./state/vaultContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AgentProvider>
      <VaultProvider>
        <App />
      </VaultProvider>
    </AgentProvider>
  </React.StrictMode>
);
