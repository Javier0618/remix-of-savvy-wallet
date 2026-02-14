import React from "react";
import { Home, BarChart3, PiggyBank, CalendarClock, User } from "lucide-react";

export type TabId = "inicio" | "informe" | "ahorro" | "auto" | "perfil";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "informe", label: "Informe", icon: BarChart3 },
  { id: "ahorro", label: "Ahorro", icon: PiggyBank },
  { id: "auto", label: "Auto", icon: CalendarClock },
  { id: "perfil", label: "Perfil", icon: User },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-5 left-5 right-5 h-[70px] bg-card/80 backdrop-blur-xl flex justify-around items-center rounded-3xl border border-border shadow-2xl z-50 md:hidden">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-[54px] rounded-2xl transition-all ${
            activeTab === id
              ? "text-foreground bg-info/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className={`w-5 h-5 ${activeTab === id ? "text-info" : ""}`} />
          <span className="text-[0.6rem] font-bold">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
