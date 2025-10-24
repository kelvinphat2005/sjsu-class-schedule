import type { ClassRow } from "../../server/ClassSchedulesScraper.ts";
import type { ClassDetails } from "../../server/CourseCatalogScraper.ts";
import type { professorComment, professorRating } from "../../server/RateMyProfessorScraper.ts";

// get all classes from `classes.json`
export async function getClassesAPI(): Promise<ClassRow[]> {
  const res = await fetch("/api/classes");
  if (!res.ok){ 
    throw new Error(`Client HTTP ${res.status}`);
  }
  const { rows } = await res.json();
  return rows as ClassRow[];
}

// get specific class details from `classes.json` using classNumber (prof, section, dates, times, rooms, etc)
export async function getClass(classNumber : number): Promise<ClassRow> {
  const res = await fetch(`/api/classes/${classNumber}`);
  if (!res.ok) {
    throw new Error(`Client HTTP ${res.status}`);
  }
  console.log("GetClass res: ", res);
  const { row } = await res.json();
  console.log("GetClass row: ", row);
  return row as ClassRow;
}

//get class details from `classDetails.json` using classNumber (course description, prereqs, ge, etc)
export async function getClassDetails(classNumber: number): Promise<ClassDetails> {
  const res = await fetch(`/api/classes/${classNumber}/details`);
  if (!res.ok) {
    throw new Error(`Client HTTP ${res.status}`);
  }
  const { course } = await res.json();
  console.log("getClassDetails, ", course);
  return course as ClassDetails;
}

// get all professor reviews using professor full name
export async function getProfessor(professorName: string, signal?: AbortSignal) : Promise<{comments : professorComment[], ratings: professorRating}> {
  const res = await fetch(`/api/professors/${encodeURIComponent(professorName)}`, {signal});
  if (!res.ok) {
    throw new Error(`Client HTTP ${res.status}`);
  }
  const { comments, ratings } = await res.json();
  return { comments, ratings } as {comments : professorComment[], ratings: professorRating};
}