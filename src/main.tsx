import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Viewer from "./viewer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>
);
