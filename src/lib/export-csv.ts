import { Submission } from "./constants";

/**
 * Downloads submissions array as a UTF-8 BOM CSV file for Excel compatibility with Thai text.
 */
export function exportSubmissionsToCSV(submissions: Submission[], filename: string = "ai_police_submissions.csv") {
  const headers = [
    "ID",
    "วันที่ส่ง",
    "ยศ",
    "ชื่อ-นามสกุล",
    "หน่วยงาน (สภ.)",
    "หัวข้อบทเรียน",
    "พรอมต์ที่ส่ง",
    "บันทึกเพิ่มเติม",
    "มีภาพแนบ"
  ];

  const rows = submissions.map((sub) => {
    const formattedDate = new Date(sub.created_at).toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    const escapeCsv = (str: string = "") => {
      const clean = str.replace(/"/g, '""').replace(/\n/g, " ");
      return `"${clean}"`;
    };

    return [
      escapeCsv(sub.id),
      escapeCsv(formattedDate),
      escapeCsv(sub.officer_rank || "-"),
      escapeCsv(sub.officer_name || "-"),
      escapeCsv(sub.officer_unit || "-"),
      escapeCsv(sub.lesson_title || "-"),
      escapeCsv(sub.prompt_text),
      escapeCsv(sub.notes || "-"),
      escapeCsv(sub.image_url ? "มีภาพ" : "ไม่มีภาพ")
    ].join(",");
  });

  // \uFEFF is the UTF-8 Byte Order Mark (BOM)
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
