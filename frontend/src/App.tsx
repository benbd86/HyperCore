import { Routes, Route, Navigate } from "react-router-dom";
import { LoansPage } from "./pages/LoansPage";
import { LoanDetailPage } from "./pages/LoanDetailPage";
import { Layout } from "./components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/loans" replace />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loan/:id" element={<LoanDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
