import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f5f5f5;
    color: #1a1a1a;
  }
  #root {
    min-height: 100vh;
  }
`;
