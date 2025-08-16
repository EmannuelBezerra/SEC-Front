export function isAuthenticated() {
  const token = localStorage.getItem("token");
  const expiresAt = localStorage.getItem("expiresAt");

  if (!token || !expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  return now < parseInt(expiresAt, 10); 
}




export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("user");
}

