import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ViewPackage from "@/pages/dashboard/viewPackage";
import AddPackage from "./pages/dashboard/addPackage";
import { SignIn } from "./pages/auth";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/auth/sign-in" element={<SignIn/>} />
      <Route path="/" element={<Navigate to="/auth/sign-in" />} />
      {/* Authenticated Routes */}
      
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }/>
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/view-package/:id" element={<ViewPackage />} />
        <Route path="/add-package" element={<AddPackage />} />
        <Route path="/edit-package/:packageId" element={<AddPackage />} 
      />
       <Route path="/*" element={<Navigate to="/login" /> } />
    </Routes>
  );
}

export default App;
