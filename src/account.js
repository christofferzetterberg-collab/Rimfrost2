// Accounts (Firebase): log in with a name and a password; your characters and the world's progress are kept online,
// so they can be played from any browser. Without the two settings below the game keeps everything in this browser only.
// The API key is Firebase's public web key: it is meant to be in the page, the database rules only let each player read and write their own save.
export const FIREBASE_API_KEY = "AIzaSyA5wtxtnntoYZwBMcaV7mc-aM0uGHEFPgA";
export const FIREBASE_PROJECT = "rimfrost-a3e1c";

const SESSION = "rimfrost2-session";
let sess = null;                                   // {token, refresh, exp, uid, name}
export const accountsOn = () => !!(FIREBASE_API_KEY && FIREBASE_PROJECT);
export const accountName = () => sess ? sess.name : null;
export const accountId = () => sess ? sess.uid : null;
// Firebase logs in with an e-mail address: the name is turned into one that is never mailed
const mail = name => name.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") + "@players.rimfrost2.game";
const ERR = {EMAIL_EXISTS: "That name is already taken", EMAIL_NOT_FOUND: "Wrong name or password", INVALID_PASSWORD: "Wrong name or password", INVALID_LOGIN_CREDENTIALS: "Wrong name or password",
  WEAK_PASSWORD: "The password must be at least 6 characters", TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Try again later", OPERATION_NOT_ALLOWED: "Name and password login is not turned on in Firebase"};
async function post(url, body, form = false){
  const r = await fetch(url, {method: "POST", headers: {"Content-Type": form ? "application/x-www-form-urlencoded" : "application/json"}, body: form ? new URLSearchParams(body) : JSON.stringify(body)});
  const j = await r.json().catch(() => ({}));
  if(!r.ok){ const code = ((j.error && j.error.message) || "").split(" ")[0].split(":")[0]; throw new Error(ERR[code] || (code ? code.replace(/_/g, " ").toLowerCase() : "Could not reach the server")); }
  return j; }
const AUTH = path => `https://identitytoolkit.googleapis.com/v1/accounts:${path}?key=${FIREBASE_API_KEY}`;
function keep(token, refresh, expiresIn, uid, name){ sess = {token, refresh, exp: Date.now() / 1000 + (+expiresIn || 3600), uid, name};
  try{ localStorage.setItem(SESSION, JSON.stringify({refresh, name})); }catch(e){} }
export async function signUp(name, pw){ const j = await post(AUTH("signUp"), {email: mail(name), password: pw, returnSecureToken: true}); keep(j.idToken, j.refreshToken, j.expiresIn, j.localId, name); }
export async function logIn(name, pw){ const j = await post(AUTH("signInWithPassword"), {email: mail(name), password: pw, returnSecureToken: true}); keep(j.idToken, j.refreshToken, j.expiresIn, j.localId, name); }
async function refresh(rt, name){ const j = await post(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {grant_type: "refresh_token", refresh_token: rt}, true);
  keep(j.id_token, j.refresh_token, j.expires_in, j.user_id, name); }
// log back in with the session saved in this browser
export async function resume(){ let s = null; try{ s = JSON.parse(localStorage.getItem(SESSION)); }catch(e){} if(!s || !s.refresh) return false;
  try{ await refresh(s.refresh, s.name); return true; }catch(e){ try{ localStorage.removeItem(SESSION); }catch(_){} return false; } }
export function logOut(){ sess = null; try{ localStorage.removeItem(SESSION); }catch(e){} }
async function token(){ const s = sess; if(s && Date.now() / 1000 > s.exp - 60) await refresh(s.refresh, s.name); return s ? s.token : (sess && sess.token); }
// the save is one document per player (saves/<player id>) holding {chars, world} as text
const DOC = (uid = sess.uid) => `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/saves/${uid}`;
export async function loadCloud(){ const t = await token(), r = await fetch(DOC(), {headers: {Authorization: "Bearer " + t}});
  if(r.status === 404) return null; if(!r.ok) throw new Error("Could not load your characters");
  const j = await r.json(); try{ return JSON.parse(j.fields.data.stringValue); }catch(e){ return null; } }
// saves go out one after another, in order
let chain = Promise.resolve();
export function saveCloud(data, keepalive = false){ if(!sess) return chain; const uid = sess.uid;
  chain = chain.then(async () => { try{ const t = await token(); const r = await fetch(DOC(uid), {method: "PATCH", keepalive, headers: {Authorization: "Bearer " + t, "Content-Type": "application/json"},
      body: JSON.stringify({fields: {data: {stringValue: JSON.stringify(data)}, at: {timestampValue: new Date().toISOString()}}})}); if(!r.ok) console.warn("Cloud save failed:", r.status); }
    catch(e){ console.warn("Cloud save failed:", e); } });
  return chain; }
