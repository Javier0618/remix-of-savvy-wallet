import * as XLSX from "xlsx";
import type { Transaction } from "@/lib/firebase";

interface ExcelData {
  incomes: number;
  expenses: number;
  netSavings: number;
  totalContributions: number;
  goal: number | null;
  transactions: Transaction[];
  profileName: string;
  monthLabel: string;
}

export function generateExcel(data: ExcelData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen
  const summaryRows = [
    ["Reporte Financiero", "", ""],
    ["Periodo", data.monthLabel, ""],
    ["Usuario", data.profileName, ""],
    ["Fecha de generación", new Date().toLocaleDateString("es-CO"), ""],
    ["", "", ""],
    ["Concepto", "Valor", ""],
    ["Ingresos", data.incomes, ""],
    ["Gastos", data.expenses, ""],
    ["Disponible", data.incomes - data.expenses, ""],
    ["Ahorro Neto", data.netSavings, ""],
    ["Aportes a Meta", data.totalContributions, ""],
    ["Meta", data.goal || 0, ""],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

  // Sheet 2: Transacciones
  const txHeaders = ["Fecha", "Tipo", "Categoría", "Descripción", "Monto"];
  const txData = data.transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString("es-CO"),
    tx.type === "income" ? "Ingreso" : "Gasto",
    tx.category,
    tx.desc || "",
    Number(tx.amount),
  ]);
  const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txData]);
  wsTx["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 24 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsTx, "Transacciones");

  // Sheet 3: Por Categoría
  const expenseByCat: Record<string, number> = {};
  const incomeByCat: Record<string, number> = {};

  data.transactions.forEach((t) => {
    const map = t.type === "expense" ? expenseByCat : incomeByCat;
    map[t.category] = (map[t.category] || 0) + Number(t.amount);
  });

  const catHeaders = ["Categoría", "Tipo", "Total", "% del Total"];
  const catData = [
    ...Object.entries(incomeByCat)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, val]) => [cat, "Ingreso", val, data.incomes > 0 ? ((val / data.incomes) * 100).toFixed(1) + "%" : "0%"]),
    ...Object.entries(expenseByCat)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, val]) => [cat, "Gasto", val, data.expenses > 0 ? ((val / data.expenses) * 100).toFixed(1) + "%" : "0%"]),
  ];

  const wsCat = XLSX.utils.aoa_to_sheet([catHeaders, ...catData]);
  wsCat["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsCat, "Por Categoría");

  XLSX.writeFile(wb, `Reporte_${data.monthLabel.replace(/\s/g, "_")}.xlsx`);
}
