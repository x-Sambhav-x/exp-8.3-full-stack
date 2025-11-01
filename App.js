<Routes>
  <Route path="/login" element={<Login />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute roles={["user", "moderator", "admin"]}>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute roles={["admin"]}>
        <AdminPage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/moderator"
    element={
      <ProtectedRoute roles={["moderator", "admin"]}>
        <ModeratorPage />
      </ProtectedRoute>
    }
  />
</Routes>
