import { getFundProfile } from "./platformData";

export type WorkspaceListType = "shortlist" | "watchlist" | "portfolio_candidate";
export type DecisionStatus = "researching" | "shortlisted" | "watching" | "rejected" | "archived";
type UserFundRow = { id: string; fund_id: string; list_type: WorkspaceListType; note: string | null; created_at: string; updated_at: string };
type JournalRow = { id: string; fund_id: string | null; title: string; thesis: string | null; risks: string | null; decision_status: DecisionStatus; evidence_snapshot: Record<string, unknown>; created_at: string; updated_at: string };
type AlertRow = { id: string; fund_id: string; metric_key: string; operator: string; threshold: number | string; cadence: string; active: boolean; last_evaluated_at: string | null; last_triggered_at: string | null; created_at: string };
type FundNameRow = { fund_id: string; canonical_name: string };

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL; const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { apikey:secret, Authorization:`Bearer ${secret}`, "Content-Type":"application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0,300)}`);
  const body = await response.text(); return (body ? JSON.parse(body) : null) as T;
}

const safeOwner = (openId: string) => encodeURIComponent(openId);

export async function getWorkspace(openId: string) {
  const owner = safeOwner(openId);
  const [lists, journal, alerts, funds] = await Promise.all([
    supabaseRequest<UserFundRow[]>(`/rest/v1/platform_user_funds?select=id,fund_id,list_type,note,created_at,updated_at&owner_open_id=eq.${owner}&order=updated_at.desc&limit=500`),
    supabaseRequest<JournalRow[]>(`/rest/v1/platform_decision_journal?select=id,fund_id,title,thesis,risks,decision_status,evidence_snapshot,created_at,updated_at&owner_open_id=eq.${owner}&order=updated_at.desc&limit=200`),
    supabaseRequest<AlertRow[]>(`/rest/v1/platform_alert_rules?select=id,fund_id,metric_key,operator,threshold,cadence,active,last_evaluated_at,last_triggered_at,created_at&owner_open_id=eq.${owner}&order=created_at.desc&limit=200`),
    supabaseRequest<FundNameRow[]>("/rest/v1/funds?select=fund_id,canonical_name&limit=500"),
  ]);
  const names = new Map(funds.map(fund => [fund.fund_id,fund.canonical_name]));
  return {
    lists:lists.map(row=>({id:row.id,fundId:row.fund_id,canonicalName:names.get(row.fund_id)??row.fund_id,listType:row.list_type,note:row.note,createdAt:row.created_at,updatedAt:row.updated_at})),
    journal:journal.map(row=>({id:row.id,fundId:row.fund_id,canonicalName:row.fund_id?names.get(row.fund_id)??row.fund_id:null,title:row.title,thesis:row.thesis,risks:row.risks,decisionStatus:row.decision_status,evidenceSnapshot:row.evidence_snapshot,createdAt:row.created_at,updatedAt:row.updated_at})),
    alerts:alerts.map(row=>({id:row.id,fundId:row.fund_id,canonicalName:names.get(row.fund_id)??row.fund_id,metricKey:row.metric_key,operator:row.operator,threshold:Number(row.threshold),cadence:row.cadence,active:row.active,lastEvaluatedAt:row.last_evaluated_at,lastTriggeredAt:row.last_triggered_at,createdAt:row.created_at})),
  };
}

export async function addWorkspaceFund(openId: string, fundId: string, listType: WorkspaceListType, note?: string | null) {
  const rows = await supabaseRequest<UserFundRow[]>("/rest/v1/platform_user_funds?on_conflict=owner_open_id,fund_id,list_type", { method:"POST", headers:{Prefer:"resolution=merge-duplicates,return=representation"}, body:JSON.stringify({owner_open_id:openId,fund_id:fundId,list_type:listType,note:note?.trim()||null,updated_at:new Date().toISOString()}) });
  return { id:rows[0]?.id ?? null, success:true as const };
}

export async function removeWorkspaceFund(openId: string, id: string) {
  await supabaseRequest(`/rest/v1/platform_user_funds?id=eq.${encodeURIComponent(id)}&owner_open_id=eq.${safeOwner(openId)}`, {method:"DELETE",headers:{Prefer:"return=minimal"}});
  return { success:true as const };
}

export async function createDecisionEntry(openId:string,input:{fundId?:string|null;title:string;thesis?:string|null;risks?:string|null;decisionStatus:DecisionStatus}) {
  const profile = input.fundId ? await getFundProfile(input.fundId) : null;
  const evidenceSnapshot = profile ? { fund_id:profile.overview.fundId,report_date:profile.overview.reportDate,smartscore:profile.overview.smartScore,evidence_score:profile.overview.evidenceScore,data_confidence:profile.overview.dataConfidence,data_tier:profile.overview.dataTier,track_record:profile.overview.trackRecord,components:profile.overview.components,warnings:profile.overview.warnings } : {};
  const rows = await supabaseRequest<JournalRow[]>("/rest/v1/platform_decision_journal",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({owner_open_id:openId,fund_id:input.fundId||null,title:input.title.trim(),thesis:input.thesis?.trim()||null,risks:input.risks?.trim()||null,decision_status:input.decisionStatus,evidence_snapshot:evidenceSnapshot})});
  return {id:rows[0]?.id??null,success:true as const};
}

export async function updateDecisionStatus(openId:string,id:string,status:DecisionStatus){
  await supabaseRequest(`/rest/v1/platform_decision_journal?id=eq.${encodeURIComponent(id)}&owner_open_id=eq.${safeOwner(openId)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({decision_status:status,updated_at:new Date().toISOString()})});
  return {success:true as const};
}
