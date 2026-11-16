export const CBT_API_BASE = process.env.NEXT_PUBLIC_CBT_API_URL || "http://localhost:4000";

function token(){return typeof window !== "undefined" ? localStorage.getItem("sfi_cusat_token") : null}

export function setCbtToken(value:string){localStorage.setItem("sfi_cusat_token",value)}
export function clearCbtToken(){localStorage.removeItem("sfi_cusat_token")}

export async function cbtFetch<T>(path:string,options:RequestInit={}) {
  const headers=new Headers(options.headers);
  headers.set("Content-Type","application/json");
  const t=token(); if(t) headers.set("Authorization",`Bearer ${t}`);
  const res=await fetch(`${CBT_API_BASE}${path}`,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || "CBT API request failed");
  return data as T;
}

export type Exam={id:string;title:string;description?:string;instructions?:string;starts_at:string;ends_at:string;duration_minutes:number;attempts_allowed:number;negative_marking_enabled:boolean;access_type:string;status:string;department_name?:string;question_count?:number;registrations?:number};

export type CbtQuestion={id:string;question_type:string;question_text:string;marks:number;negative_marks:number;position:number;options:{key:string;text:string}[];selected_option?:string|null;is_marked_for_review?:boolean};

export type Attempt={id:string;startedAt:string;expiresAt:string};

export type Result={id:string;attempt_id:string;exam_id:string;user_id?:string;full_name?:string|null;email?:string;candidate_identifier?:string|null;score:number;total_marks:number;correct_count:number;wrong_count:number;skipped_count:number;time_taken_seconds:number;released_at?:string|null};

export async function listExams(){return cbtFetch<{exams:Exam[]}>("/api/academic/exams")}
export async function createExam(body:unknown){return cbtFetch<{exam:Exam}>("/api/cbt/exams",{method:"POST",body:JSON.stringify(body)})}
export async function registerExam(id:string,accessCode?:string){return cbtFetch<{registration:unknown}>(`/api/cbt/exams/${id}/register`,{method:"POST",body:JSON.stringify({accessCode})})}
export async function startExam(id:string){return cbtFetch<{attempt:Attempt;serverTime:string}>(`/api/cbt/exams/${id}/start`,{method:"POST",body:"{}"})}
export async function getAttemptQuestions(id:string){return cbtFetch<{attempt:Attempt;questions:CbtQuestion[]}>(`/api/cbt/attempts/${id}/questions`)}
export async function saveAnswer(attemptId:string,body:{questionId:string;selectedOption:string|null;markedForReview:boolean}){return cbtFetch(`/api/cbt/attempts/${attemptId}/answers`,{method:"PUT",body:JSON.stringify(body)})}
export async function submitAttempt(id:string){return cbtFetch<{submitted:boolean;result:Result}>(`/api/cbt/attempts/${id}/submit`,{method:"POST",body:"{}"})}
export async function getResults(id:string){return cbtFetch<{results:Result[]}>(`/api/cbt/exams/${id}/results`)}
export async function releaseResults(id:string){return cbtFetch(`/api/cbt/exams/${id}/release-results`,{method:"POST",body:"{}"})}
