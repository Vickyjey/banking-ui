import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const USERNAME_KEY = "username";

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function isTokenValid(token) {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) {
      return false;
    }

    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
}

export function getRoleFromToken(token) {
  if (!token) {
    return "";
  }

  try {
    const decoded = jwtDecode(token);
    return decoded?.role ?? "";
  } catch (error) {
    return "";
  }
}

export function setAuth(token) {
  if (!isTokenValid(token)) {
    clearAuth();
    return null;
  }

  const decoded = jwtDecode(token);
  const role = decoded?.role ?? "";
  const username = decoded?.sub ?? "";

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USERNAME_KEY, username);

  return { token, role, username };
}

export function getAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!isTokenValid(token)) {
    clearAuth();
    return null;
  }

  const role = localStorage.getItem(ROLE_KEY) || getRoleFromToken(token);
  const username =
    localStorage.getItem(USERNAME_KEY) || (() => {
      try {
        return jwtDecode(token)?.sub ?? "";
      } catch (error) {
        return "";
      }
    })();

  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  }
  if (username) {
    localStorage.setItem(USERNAME_KEY, username);
  }

  return { token, role, username };
}
