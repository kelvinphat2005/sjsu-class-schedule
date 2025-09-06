import type { ClassRow } from "./ClassSchedulesScraper";
import type { ClassDetails } from "./CourseCatalogScraper";
import type { professorComment, professorRating } from "./RateMyProfessorScraper";

// get all classes from `classes.json`
export async function getClassesAPI(): Promise<ClassRow[]> {
  const res = await fetch("/api/classes");
  if (!res.ok){ 
    throw new Error(`Client HTTP ${res.status}`);
  }
  const { rows } = await res.json();
  return rows as ClassRow[];
}

// get specific class details from `classes.json` using classNumber
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

//get class details from `classDetails.json` using classNumber
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
export async function getProfessor(professorName: string) : Promise<{comments : professorComment[], ratings: professorRating}> {
  const res = await fetch(`/api/professors/${encodeURIComponent(professorName)}`);
  if (!res.ok) {
    throw new Error(`Client HTTP ${res.status}`);
  }
  const { comments, ratings } = await res.json();
  return { comments, ratings } as {comments : professorComment[], ratings: professorRating};
}