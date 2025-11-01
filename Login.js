const res = await axios.post("http://localhost:5000/api/auth/login", {
  email,
  password
});

localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.user.role);

navigate("/dashboard");
