import React from "react";

interface SummaryCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  variant: "income" | "expense" | "available" | "savings";
}

const variantStyles: Record<string, string> = {
  income: "bg-success/10 border-success/20",
  expense: "bg-destructive/10 border-destructive/20",
  available: "bg-info/10 border-info/20",
  savings: "bg-primary/10 border-primary/20",
};

const labelStyles: Record<string, string> = {
  income: "text-success",
  expense: "text-destructive",
  available: "text-info",
  savings: "text-primary",
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, subValue, icon, variant }) => {
  return (
    <div
      className={`relative p-4 rounded-3xl border overflow-hidden flex flex-col justify-center ${variantStyles[variant]}`}
    >
      <div className={`text-[0.65rem] font-extrabold uppercase tracking-wider mb-1 ${labelStyles[variant]}`}>
        {label}
      </div>
      <div className="text-xl font-extrabold text-foreground tracking-tight">{value}</div>
      {subValue && <div className="text-xs font-semibold mt-1 text-muted-foreground">{subValue}</div>}
      <div className={`absolute -right-3 -bottom-3 w-16 h-16 rounded-full flex items-center justify-center ${variantStyles[variant]}`}>
        <div className="mr-3 mb-3">{icon}</div>
      </div>
    </div>
  );
};

export default SummaryCard;
