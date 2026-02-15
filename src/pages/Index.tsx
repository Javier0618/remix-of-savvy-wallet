import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import AuthScreen from "@/components/AuthScreen";
import Dashboard from "@/components/Dashboard";
import Reports from "@/components/Reports";
import Savings from "@/components/Savings";
import SmartAdvice from "@/components/SmartAdvice";
import ScheduledActions from "@/components/ScheduledActions";
import Profile from "@/components/Profile";
import MethodSelector from "@/components/MethodSelector";
import BottomNav, { type TabId } from "@/components/BottomNav";
import { Home, BarChart3, PiggyBank, Lightbulb, CalendarClock, User, LogOut } from "lucide-react";
import { logout } from "@/lib/firebase";
import { useScheduledExecutor } from "@/hooks/useScheduledExecutor";

const desktopTabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "informe", label: "Informe", icon: BarChart3 },
  { id: "ahorro", label: "Ahorro", icon: PiggyBank },
  { id: "consejos", label: "Consejos", icon: Lightbulb },
  { id: "auto", label: "Automatizaciones", icon: CalendarClock },
  { id: "perfil", label: "Perfil", icon: User },
];

const Index: React.FC = () => {
  const { user, loading: authLoading, isGuest } = useAuth();
  const { loading: finLoading, financialMethod } = useFinance();
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  useScheduledExecutor();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-info">Fin</span><span className="text-success">3</span>
          </h2>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Loading finance data
  if (finLoading && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">
            <span className="text-info">Fin</span><span className="text-success">3</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Cargando tu información...</p>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Show method selector for first-time users or when requested
  const needsMethodSelection = !isGuest && !financialMethod && !showMethodSelector;

  if (needsMethodSelection || showMethodSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <MethodSelector
            currentMethodId={financialMethod}
            onComplete={() => setShowMethodSelector(false)}
          />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "inicio": return <Dashboard onSelectMethod={() => setShowMethodSelector(true)} />;
      case "informe": return <Reports />;
      case "ahorro": return <Savings />;
      case "consejos": return <SmartAdvice />;
      case "auto": return <ScheduledActions />;
      case "perfil": return <Profile onChangeMethod={() => setShowMethodSelector(true)} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Desktop sidebar + content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border p-4 fixed left-0 top-0">
          <div className="mb-8 mt-2">
            <h2 className="text-2xl font-extrabold tracking-tight">
              <span className="text-info">Fin</span><span className="text-success">3</span>
            </h2>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {desktopTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-info/15 text-info"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition mb-4"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-60">
          <div className="container max-w-3xl py-6">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
