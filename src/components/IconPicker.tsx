import React, { useState, useMemo } from "react";
import {
  ShoppingCart, Coffee, Car, Home, Heart, BookOpen, Zap, Shirt,
  Plane, PiggyBank, Wrench, Briefcase, DollarSign, Monitor, Gift, Package,
  Utensils, Bus, Film, Stethoscope, GraduationCap, Lightbulb,
  CreditCard, Wallet, TrendingUp, TrendingDown, Star, Target,
  Clock, Calendar, Bell, Music, Headphones, Camera, Smartphone,
  Wifi, Cloud, Sun, Moon, Umbrella, Droplets, Flame,
  ShoppingBag, Store, Scissors, Paintbrush, Dumbbell, Baby,
  Dog, Cat, Leaf, Trees, Mountain, Waves,
  Pizza, IceCreamCone, Wine, Beer, Cigarette,
  Fuel, ParkingCircle, Building2, Key, Hammer,
  Printer, Tv, Gamepad2, Trophy, Medal,
  Gem, Crown, BadgeDollarSign, Receipt, Calculator,
  Search, X
} from "lucide-react";

export const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShoppingCart, Coffee, Car, Home, Heart, BookOpen, Zap, Shirt,
  Plane, PiggyBank, Wrench, Briefcase, DollarSign, Monitor, Gift, Package,
  Utensils, Bus, Film, Stethoscope, GraduationCap, Lightbulb,
  CreditCard, Wallet, TrendingUp, TrendingDown, Star, Target,
  Clock, Calendar, Bell, Music, Headphones, Camera, Smartphone,
  Wifi, Cloud, Sun, Moon, Umbrella, Droplets, Flame,
  ShoppingBag, Store, Scissors, Paintbrush, Dumbbell, Baby,
  Dog, Cat, Leaf, Trees, Mountain, Waves,
  Pizza, IceCreamCone, Wine, Beer, Cigarette,
  Fuel, ParkingCircle, Building2, Key, Hammer,
  Printer, Tv, Gamepad2, Trophy, Medal,
  Gem, Crown, BadgeDollarSign, Receipt, Calculator,
};

const iconEntries = Object.entries(ICON_MAP);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return iconEntries;
    const q = search.toLowerCase();
    return iconEntries.filter(([name]) => name.toLowerCase().includes(q));
  }, [search]);

  const SelectedIcon = value ? ICON_MAP[value] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-16 h-11 bg-secondary/50 border border-border rounded-xl flex items-center justify-center hover:border-primary transition"
      >
        {SelectedIcon ? (
          <SelectedIcon className="w-5 h-5 text-foreground" />
        ) : (
          <span className="text-muted-foreground text-xs">Ícono</span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-3 animate-fade-in-up">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ícono..."
              className="w-full bg-secondary/50 border border-border rounded-lg pl-8 pr-8 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
            {filtered.map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                className={`p-2 rounded-lg transition-all ${
                  value === name
                    ? "bg-primary/20 border border-primary"
                    : "hover:bg-secondary/50 border border-transparent"
                }`}
                title={name}
              >
                <Icon className="w-4 h-4 text-foreground mx-auto" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-7 text-center text-xs text-muted-foreground py-4">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
