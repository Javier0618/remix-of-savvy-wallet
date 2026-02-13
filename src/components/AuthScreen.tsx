import React, { useState } from "react";
import { createUser, login, loginAnonymously } from "@/lib/firebase";
import { Mail, Lock, User, ArrowRight, UserPlus } from "lucide-react";

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Completa ambos campos.");
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name) return setError("Nombre obligatorio.");
    if (!email || !password) return setError("Correo y contraseña requeridos.");
    if (password !== password2) return setError("Contraseñas no coinciden.");
    setLoading(true);
    setError("");
    try {
      await createUser(email, password, name);
    } catch (e: any) {
      setError(e.message || "Error registrando.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await loginAnonymously();
    } catch {
      setError("No se pudo iniciar como invitado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-info">Fin</span>
            <span className="text-success">3</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona tus finanzas personales</p>
        </div>

        {mode === "login" ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="usuario@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-primary text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Entrar"} <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes cuenta?{" "}
              <button onClick={() => { setMode("register"); setError(""); }} className="text-primary font-semibold hover:underline">
                Registrarse
              </button>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="usuario@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Repetir contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="••••••"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-primary text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear cuenta"} <UserPlus className="w-4 h-4" />
            </button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-primary font-semibold hover:underline">
                Iniciar sesión
              </button>
            </p>
          </div>
        )}

        {error && <p className="text-destructive text-sm mt-3 text-center font-medium">{error}</p>}

        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full bg-secondary border border-border text-foreground font-semibold py-3 rounded-xl hover:bg-secondary/80 transition disabled:opacity-50"
          >
            Continuar como Invitado
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
