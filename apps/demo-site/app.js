const DEFAULT_EMAIL = "demo@password.cluster";
const DEFAULT_PASSWORD = "OldPass!234";
const STORAGE_EMAIL = "pc_demo_email";
const STORAGE_PASSWORD = "pc_demo_password";
const STORAGE_SESSION = "pc_demo_session";

const ensureSeed = () => {
  if (!localStorage.getItem(STORAGE_EMAIL)) {
    localStorage.setItem(STORAGE_EMAIL, DEFAULT_EMAIL);
  }
  if (!localStorage.getItem(STORAGE_PASSWORD)) {
    localStorage.setItem(STORAGE_PASSWORD, DEFAULT_PASSWORD);
  }
};

const getStoredPassword = () => localStorage.getItem(STORAGE_PASSWORD) ?? DEFAULT_PASSWORD;

const setView = (view) => {
  document.body.dataset.view = view;
  const loginPanel = document.getElementById("login-panel");
  const dashboardPanel = document.getElementById("dashboard-panel");
  const settingsPanel = document.getElementById("settings-panel");
  if (!loginPanel || !dashboardPanel || !settingsPanel) return;
  loginPanel.hidden = view !== "login";
  dashboardPanel.hidden = view !== "dashboard";
  settingsPanel.hidden = view !== "settings";
};

const showToast = (id, message) => {
  const toast = document.getElementById(id);
  if (!toast) return;
  if (message) {
    toast.textContent = message;
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
};

const init = () => {
  ensureSeed();

  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const navSettings = document.getElementById("nav-settings");
  const navDashboard = document.getElementById("nav-dashboard");
  const passwordTab = document.getElementById("password-tab");
  const passwordForm = document.getElementById("password-form");
  const passwordError = document.getElementById("password-error");

  const sessionActive = sessionStorage.getItem(STORAGE_SESSION) === "1";
  setView(sessionActive ? "dashboard" : "login");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (loginError) {
        loginError.textContent = "";
        loginError.hidden = true;
      }
      const email = document.getElementById("login-email")?.value?.trim() ?? "";
      const password = document.getElementById("login-password")?.value ?? "";
      const storedEmail = localStorage.getItem(STORAGE_EMAIL) ?? DEFAULT_EMAIL;
      const storedPassword = getStoredPassword();
      if (email !== storedEmail || password !== storedPassword) {
        if (loginError) {
          loginError.textContent = "Invalid email or password.";
          loginError.hidden = false;
        }
        return;
      }
      sessionStorage.setItem(STORAGE_SESSION, "1");
      setView("dashboard");
    });
  }

  if (navSettings) {
    navSettings.addEventListener("click", () => setView("settings"));
  }

  if (navDashboard) {
    navDashboard.addEventListener("click", () => setView("dashboard"));
  }

  if (passwordTab) {
    passwordTab.addEventListener("click", () => {
      const panel = document.getElementById("password-panel");
      if (panel) panel.hidden = false;
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (passwordError) {
        passwordError.textContent = "";
        passwordError.hidden = true;
      }
      const current = document.getElementById("current-password")?.value ?? "";
      const next = document.getElementById("new-password")?.value ?? "";
      const confirm = document.getElementById("confirm-password")?.value ?? "";
      const storedPassword = getStoredPassword();

      if (!current || !next || !confirm) {
        if (passwordError) {
          passwordError.textContent = "All fields are required.";
          passwordError.hidden = false;
        }
        return;
      }

      if (current !== storedPassword) {
        if (passwordError) {
          passwordError.textContent = "Current password is incorrect.";
          passwordError.hidden = false;
        }
        return;
      }

      if (next.length < 10) {
        if (passwordError) {
          passwordError.textContent = "New password must be at least 10 characters.";
          passwordError.hidden = false;
        }
        return;
      }

      if (next !== confirm) {
        if (passwordError) {
          passwordError.textContent = "Passwords do not match.";
          passwordError.hidden = false;
        }
        return;
      }

      localStorage.setItem(STORAGE_PASSWORD, next);
      showToast("toast-success", "Password updated");
    });
  }
};

document.addEventListener("DOMContentLoaded", init);
