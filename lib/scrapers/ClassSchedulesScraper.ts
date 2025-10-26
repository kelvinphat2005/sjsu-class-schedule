import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import type { ClassRow } from "@/types/domain";

const URL: string = "https://www.sjsu.edu/classes/schedules/spring-2026.php";


async function getHTML(page: string): Promise<string> {
  const { data: html } = await axios.get(page);
  return html;
}

// retrieves classes from the set URL
export async function getClasses(): Promise<ClassRow[]> {
  const html = await getHTML(URL);
  const $ = cheerio.load(html);

  const rows: ClassRow[] = [];

  // select each row <tr>
  $("tbody tr").each((_, c) => {
    const raw = $(c).find("td").eq(0).text().trim();
    const { subject, course, sectionText } = splitSubjectCourseSection(raw);

    const row: ClassRow = {
      subject,
      course,
      section: sectionText ?? "",
      classNumber: parseInt($(c).find("td").eq(1).text(), 10),

      modeOfInstruction: $(c).find("td").eq(2).text().trim() as
        | "In Person"
        | "Online"
        | "Hybrid",
      courseTitle: $(c).find("td").eq(3).text().trim(),
      satisfies: $(c).find("td").eq(4).text().trim(),
      units: parseFloat($(c).find("td").eq(5).text().trim()),
      type: $(c).find("td").eq(6).text().trim() as
        | "LEC"
        | "LAB"
        | "SEM"
        | "SUP"
        | "ACT",
      days: $(c).find("td").eq(7).text().trim(),
      times: $(c).find("td").eq(8).text().trim(),
      instructor: $(c).find("td").eq(9).text().trim(),
      location: $(c).find("td").eq(10).text().trim(),
      dates: $(c).find("td").eq(11).text().trim(),
      openSeats: parseInt($(c).find("td").eq(12).text().trim()),
      notes: $(c).find("td").eq(13).text().trim() || undefined,
    };

    rows.push(row);
  });

  return rows;
}

export async function saveToJson(
  classes: ClassRow[],
) {
  const filePath = path.resolve(process.cwd(), ".cache", "classes.json");
  await mkdir(path.dirname(filePath), { recursive: true });   // ✅ options recognized
  await writeFile(filePath, JSON.stringify(classes, null, 2), "utf8");
}

// todo: just save as json, skip csv
export async function saveToCSV(classes: ClassRow[]) {
  const header = Object.keys(classes[0]).join(",") + "\n";

  const escape = (val: any) => {
    const str = String(val ?? "");
    // if the field contains quotes, replace " with ""
    const escaped = str.replace(/"/g, '""');
    // if the field contains a comma, newline, or quote, wrap in quotes
    if (/[",\n]/.test(str)) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const csv = classes
    .map((c) => Object.values(c).map(escape).join(","))
    .join("\n");

  await fs.writeFileSync("classes.csv", header + csv);
  console.log("Saved to classes.csv");
}

export function splitSubjectCourseSection(input: string) {
  // normalize spaces & NBSP
  let s = input
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // --- remove trailing section notation ---
  // (Section 80), (80), Sec 80 / Section 80, -80
  s = s
    .replace(/\(\s*Section\s*[^)]+\)\s*$/i, "")
    .replace(/\(\s*[A-Za-z0-9-]+\s*\)\s*$/i, "")
    .replace(/\bSec(?:tion)?\.?\s*[A-Za-z0-9-]+\s*$/i, "")
    .replace(/[-–]\s*[A-Za-z0-9-]+\s*$/i, "")
    .trim();

  // now s should look like: "BUS4 91L", "CS 147", "ENGR10", "AAS 33A", etc.

  // primary path: "SUBJECT COURSE" (two tokens)
  let subject = "";
  let course = "";
  const toks = s.split(/\s+/);
  if (toks.length >= 2) {
    subject = toks[0];
    course = toks[1];
  } else {
    // fallback: single token like "ENGR10" -> split at first digit boundary
    const m = s.match(/^([A-Za-z]+)(\d+[A-Za-z]*)$/);
    if (m) {
      subject = m[1];
      course = m[2];
    } else {
      subject = s;
      course = "";
    }
  }

  subject = subject.toUpperCase();
  course = course.toUpperCase();

  // section text (keep leading zeros if you already parsed it elsewhere)
  const sectionTextMatch =
    input.match(/\(\s*Section\s*([^)]+)\)\s*$/i) ||
    input.match(/\bSec(?:tion)?\.?\s*([A-Za-z0-9-]+)\s*$/i) ||
    input.match(/[-–]\s*([A-Za-z0-9-]+)\s*$/i) ||
    input.match(/\(\s*([A-Za-z0-9-]+)\s*\)\s*$/i);

  const sectionText = sectionTextMatch?.[1]?.trim() ?? null;

  return { subject, course, sectionText };
}