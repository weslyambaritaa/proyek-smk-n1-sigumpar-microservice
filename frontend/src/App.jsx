import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import TodosPage from "./pages/TodosPage";

/**
 * Komponen App — root komponen aplikasi
 * Mengatur layout utama dan routing antar halaman
 */
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-bold text-blue-600">
              🚀 Microservices App
            </h1>
            <div className="flex gap-1">
              {/* NavLink secara otomatis menambahkan class 'active' saat route cocok */}
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                👥 Users
              </NavLink>
              <NavLink
                to="/todos"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                ✅ Todos
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto py-6 px-4">
          <Routes>
            {/* Redirect root ke /users */}
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