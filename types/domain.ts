export type ClassRow = {
  subject: string; // CS, MATH
  course: string; // 47, 151
  section: string; // 01 11
  classNumber: number; // use this as unique class-section identifier/id
  modeOfInstruction: "In Person" | "Online" | "Hybrid";
  courseTitle: string;
  satisfies: string;
  units: number;
  type: "LEC" | "LAB" | "SEM" | "SUP" | "ACT";
  days: string;
  times: string;
  instructor: string;
  location: string;
  dates: string;
  openSeats: number;
  notes?: string;
};

export type ClassDetails = {
    oid: string, // keep track so it can be replaced with a new one
    courseKey: string,
    courseTitle: string,
    credits: string,
    description: string,
    satisfies: string,
    prereq: string,
    grading: string,
    notes?: string,
}