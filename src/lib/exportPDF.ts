import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/lib/firebase";

interface ReportData {
  incomes: number;
  expenses: number;
  netSavings: number;
  totalContributions: number;
  goal: number | null;
  transactions: Transaction[];
  profileName: string;
  monthLabel: string;
}

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function generatePDF(data: ReportData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 30, 46);
  doc.rect(0, 0, pageW, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte Financiero", 14, 22);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.monthLabel}  •  ${data.profileName}`, 14, 32);

  doc.setFontSize(8);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 14, 40);

  // Summary boxes
  let y = 55;
  const boxW = (pageW - 38) / 4;
  const summaryItems = [
    { label: "Ingresos", value: fmt(data.incomes), color: [16, 185, 129] as [number, number, number] },
    { label: "Gastos", value: fmt(data.expenses), color: [239, 68, 68] as [number, number, number] },
    { label: "Disponible", value: fmt(data.incomes - data.expenses), color: [59, 130, 246] as [number, number, number] },
    { label: "Ahorro Neto", value: fmt(data.netSavings), color: [139, 92, 246] as [number, number, number] },
  ];

  summaryItems.forEach((item, i) => {
    const x = 14 + i * (boxW + 3);
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(x, y, boxW, 28, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 120);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x + 5, y + 10);
    doc.setFontSize(13);
    doc.setTextColor(...item.color);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, x + 5, y + 22);
  });

  y += 38;

  // Goal progress
  if (data.goal && data.goal > 0) {
    const pct = Math.min((data.totalContributions / data.goal) * 100, 100);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 46);
    doc.setFont("helvetica", "bold");
    doc.text("Progreso de Meta", 14, y);
    y += 6;

    doc.setFillColor(230, 230, 240);
    doc.roundedRect(14, y, pageW - 28, 8, 3, 3, "F");
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(14, y, (pageW - 28) * (pct / 100), 8, 3, 3, "F");

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 80);
    doc.text(`${fmt(data.totalContributions)} / ${fmt(data.goal)} (${pct.toFixed(1)}%)`, 14, y + 16);
    y += 24;
  }

  // Expense by category table
  const expenseByCat: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Number(t.amount);
    });

  const catRows = Object.entries(expenseByCat)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => {
      const pct = data.expenses > 0 ? ((val / data.expenses) * 100).toFixed(1) : "0";
      return [cat, fmt(val), `${pct}%`];
    });

  if (catRows.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 46);
    doc.setFont("helvetica", "bold");
    doc.text("Desglose de Gastos por Categoría", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Categoría", "Monto", "% del Total"]],
      body: catRows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 30, 46], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 252] },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Transactions table
  const txRows = data.transactions.slice(0, 50).map((tx) => [
    new Date(tx.date).toLocaleDateString("es-CO"),
    tx.type === "income" ? "Ingreso" : "Gasto",
    tx.category,
    tx.desc || "-",
    (tx.type === "income" ? "+" : "-") + fmt(Number(tx.amount)),
  ]);

  if (txRows.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 46);
    doc.setFont("helvetica", "bold");
    doc.text("Últimas Transacciones", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Tipo", "Categoría", "Descripción", "Monto"]],
      body: txRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 30, 46], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: {
        4: { halign: "right" },
      },
    });
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 180);
    doc.text(
      `Página ${i} de ${pages}  •  Generado automáticamente`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`Reporte_Financiero_${data.monthLabel.replace(/\s/g, "_")}.pdf`);
}
