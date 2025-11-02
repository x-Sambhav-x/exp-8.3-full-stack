// ======================================================
// app.js — Complete Role-Based Access Control (Single File)
// ======================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "super_secret_key";

// Dummy Users Database
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "mod", password: "mod123", role: "moderator" },
  { id: 3, username: "user", password: "user123", role: "user" },
];

// ======================================================
// FRONTEND (React served by Express)
// ======================================================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Role-Based Access Control</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      body { font-family: Arial; background:#f4f4f4; display:flex; align-items:center; justify-content:center; height:100vh; }
      .container { background:white; padding:30px; border-radius:12px; box-shadow:0 0 10px rgba(0,0,0,0.1); width:350px; text-align:center; }
      input, button { width:100%; padding:10px; margin:8px 0; border-radius:5px; border:1px solid #ccc; }
      button { background:#007bff; color:white; border:none; font-weight:bold; cursor:pointer; }
      button:hover { background:#0056b3; }
      .message { margin-top:10px; font-weight:bold; }
      .role { margin-top:10px; padding:8px; background:#eef; border-radius:5px; }
    </style>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel">
      const { useState, useEffect } = React;

      function App() {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [token, setToken] = useState(localStorage.getItem("token") || "");
        const [message, setMessage] = useState("");
        const [role, setRole] = useState("");

        const login = async (e) => {
          e.preventDefault();
          setMessage("Logging in...");
          const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setMessage("✅ Login successful!");
          } else {
            setMessage("❌ " + data.message);
          }
        };

        const logout = () => {
          localStorage.removeItem("token");
          setToken("");
          setMessage("Logged out successfully.");
          setRole("");
        };

        const getDashboard = async () => {
          const res = await fetch("/dashboard", {
            headers: { Authorization: "Bearer " + token }
          });
          const data = await res.json();
          if (res.ok) {
            setMessage(data.message);
            setRole(data.role);
          } else {
            setMessage("❌ " + data.message);
          }
        };

        useEffect(() => {
          if (token) getDashboard();
        }, [token]);

        return (
          <div className="container">
            {!token ? (
              <>
                <h2>🔐 Login</h2>
                <form onSubmit={login}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit">Login</button>
                </form>
                <div className="message">{message}</div>
              </>
            ) : (
              <>
                <h2>🎯 Dashboard</h2>
                <div className="message">{message}</div>
                <div className="role">
                  <strong>Role:</strong> {role}
                </div>

                {role === "admin" && (
                  <div style={{marginTop:10}}>
                    <p>🧑‍💼 Admin Access: Manage Users & System</p>
                  </div>
                )}
                {role === "moderator" && (
                  <div style={{marginTop:10}}>
                    <p>🛠️ Moderator Access: Review Content</p>
                  </div>
                )}
                {role === "user" && (
                  <div style={{marginTop:10}}>
                    <p>👤 User Access: View Own Data</p>
                  </div>
                )}
                <button onClick={logout}>Logout</button>
              </>
            )}
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
  `);
});

// ======================================================
// BACKEND ROUTES (Express + JWT)
// ======================================================

// Login & generate token
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const found = users.find((u) => u.username === username && u.password === password);
  if (!found) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ id: found.id, username: found.username, role: found.role }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// Middleware: verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Middleware: check role
function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
}

// Protected dashboard route
app.get("/dashboard", verifyToken, (req, res) => {
  const role = req.user.role;
  let message;
  if (role === "admin") message = "Welcome Admin! You have full system access.";
  else if (role === "moderator") message = "Welcome Moderator! You can review and manage user content.";
  else message = "Welcome User! You can view your profile and content.";
  res.json({ message, role });
});

// Example of role-based API route
app.get("/admin-panel", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome to the Admin Control Panel" });
});

app.get("/mod-panel", verifyToken, authorizeRoles("admin", "moderator"), (req, res) => {
  res.json({ message: "Moderator Section: Access granted" });
});

// ======================================================
// START SERVER
// ======================================================
const PORT = 5000;
app.listen(PORT, () => console.log("✅ RBAC Server running at http://localhost:" + PORT));
