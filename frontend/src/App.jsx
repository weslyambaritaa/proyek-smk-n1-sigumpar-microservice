import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import TodosPage from "./pages/TodosPage";
import keycloak from "./keycloak"; // Import ini untuk fungsi logout

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-bold text-blue-600">
              🚀 Microservices App
            </h1>
            
            <div className="flex items-center gap-4">
              <NavLink to="/users" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>
                👥 Users
              </NavLink>
              <NavLink to="/todos" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>
                ✅ Todos
              </NavLink>
              
              {/* --- BAGIAN USER INFO & LOGOUT --- */}
              <div className="pl-4 border-l border-gray-300 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Halo, {keycloak.tokenParsed?.preferred_username || 'User'}!
                </span>
                <button 
                  onClick={() => {
                    localStorage.removeItem("kc_token");
                    keycloak.logout();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<UsersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/todos" element={<TodosPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;