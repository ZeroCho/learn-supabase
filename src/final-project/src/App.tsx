import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import Home from "./pages/Home";
import { Loader2 } from "lucide-react";
import "./index.css";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader2
          className="spinner"
          style={{ color: "#2563eb", width: "2rem", height: "2rem" }}
        />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={session ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!session ? <Auth /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
