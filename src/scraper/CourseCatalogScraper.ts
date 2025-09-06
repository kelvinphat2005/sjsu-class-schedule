import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

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


async function getHTML(page : string): Promise<string> {
    const {data: html} = await axios.get(page);
    return html;
}

export async function findCourseLink(subject: string, course: string | number, oid = "17") : Promise<string> {
    const url = `https://catalog.sjsu.edu/search_advanced.php?cur_cat_oid=${oid}&search_database=Search&filter[keyword]=${subject}+${course}&filter[exact_match]=1&filter[3]=1&filter[31]=1`

    const html = await getHTML(url);
    const $ = cheerio.load(html);

    // get the search link
    // then get the link that has "best match"
    const a = $('a:has(strong:contains("Best Match"))');
    if (a.length === 0) throw new Error("no best-match anchor found");

    const href = a.attr("href"); // first element's href
    if (!href) throw new Error("best-match anchor has no href");

    const link = new URL(href, "https://catalog.sjsu.edu").toString();
    console.log("COURSE LINK FOUND: ", {link});
    return link; 
}

/** Collect text after startSel until we hit any stop selector (e.g. "br, strong, hr"). */
function getBetween($: cheerio.CheerioAPI, startSel: string, stopSel = "br, strong, hr"): string {
  const start = $(startSel).first().get(0);
  if (!start) return "";

  let node: any = start.nextSibling;
  let out = "";

  while (node) {
    // stop if this node matches the stop selector
    if (node.type === "tag" && $(node).is(stopSel)) break;

    if (node.type === "text") out += node.data;
    else if (node.type === "tag") out += $(node).text() + " ";

    node = node.nextSibling;
  }

  return out.trim(); // strip leading ":" if present
}

export async function getCourseDetails(url : string, oid : string = "17") : Promise<ClassDetails> {
    const html = await getHTML(url);
    const $ = cheerio.load(html);

    // <td class="block_content"/> contains course details, only 1 exists
    const details = $("td.block_content").first()

    const courseTitle = details.find("#course_preview_title").first().text().trim(); // course title has id=course_preview_title
    const credits = details.find("em").first().text().trim(); // num of credits is in first em elements

    // find description (it has no tag xd)
    // also prereqs and grading ("letter graded")
    const textNodes = details.contents().filter(function() {
        // Check if the node is a text node (nodeType 3)
        return this.nodeType === 3;
    });
    const description = textNodes.eq(4).text().trim(); // may need to changed in the future

    // prereqs
    const prereq = getBetween($, "strong:contains('Prerequisite(s):')", "br").trim();
    const grading = getBetween($, "strong:contains('Grading')", "br").trim();
    const notes = getBetween($, "strong:contains('Note')", "br").trim();    

    // satisfies
    const satisfies = details.find("em:contains('Satisfies')").next().text().trim();

    return {
        oid: oid, // keep track so it can be replaced with a new one
        courseKey: courseTitle.split("-")[0].trim(),
        courseTitle: courseTitle,
        credits: credits,
        description: description,
        satisfies: satisfies,
        prereq: prereq,
        grading: grading,
        notes: notes,
    }
}

console.log(await getCourseDetails(await findCourseLink("AAS", "33A")));
//console.log(await getCourseDetails(await findCourseLink("HUM", 80)));
//console.log(await getCourseDetails(await findCourseLink("CS", 47)));
//console.log(await getCourseDetails(await findCourseLink("ENGL", "1A")));

