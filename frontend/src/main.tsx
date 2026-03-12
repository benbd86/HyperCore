import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter } from "react-router-dom";
import { client } from "./apolloClient";
import App from "./App";
import { GlobalStyles } from "./globalStyles";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <GlobalStyles />
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
