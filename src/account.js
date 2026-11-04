// Accounts (Firebase): log in with an e-mail and a password (old accounts: with their name); your characters and the world's progress are kept online,
// so they can be played from any browser. Without the two settings below the game keeps everything in this browser only.
// The API key is Firebase's public web key: it is meant to be in the page, the database rules only let each player read and write their own save.
export const FIREBASE_API_KEY = "AIzaSyA5wtxtnntoYZwBMcaV7mc-aM0uGHEFPgA";
export const FIREBASE_PROJECT = "rimfrost-a3e1c";

const SESSION = "rimfrost2-session";
let sess = null;                                   // {token, refresh, exp, uid, name, email}
export const accountsOn = () => !!(FIREBASE_API_KEY && FIREBASE_PROJECT);
export const accountName = () => sess ? sess.name : null;
export const accountId = () => sess ? sess.uid : null;
export const accountEmail = () => sess ? sess.email : null;
// Old accounts were made with a name only. Firebase logs in with an e-mail address, so the name was turned into one that is never mailed.
// Names of only a–z, 0–9, _ and - keep the address they always had. Any other letter (å, ä, ö, é …) is written as
// "x" + its 4-digit code, a plain x as "xx", and the address ends in ".u", so every name gets its own address.
const mail = name => { const n = name.trim().toLowerCase();
  const local = /^[a-z0-9_-]+$/.test(n) ? n
    : [...n].map(c => /[a-wyz0-9_-]/.test(c) ? c : c === "x" ? "xx" : [...Array(c.length).keys()].map(i => "x" + c.charCodeAt(i).toString(16).padStart(4, "0")).join("")).join("") + ".u";
  return local + "@players.rimfrost2.game"; };
const ERR = {EMAIL_EXISTS: "That e-mail already has an account", EMAIL_NOT_FOUND: "Wrong e-mail or password", INVALID_PASSWORD: "Wrong e-mail or password", INVALID_LOGIN_CREDENTIALS: "Wrong e-mail or password",
  INVALID_EMAIL: "That is not a valid e-mail address", MISSING_EMAIL: "Enter your e-mail address", USER_DISABLED: "This account has been turned off",
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "Log out and in again, then try once more", TOKEN_EXPIRED: "Log out and in again, then try once more",
  WEAK_PASSWORD: "The password must be at least 6 characters", TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Try again later", OPERATION_NOT_ALLOWED: "Name and password login is not turned on in Firebase"};
async function post(url, body, form = false){
  const r = await fetch(url, {method: "POST", headers: {"Content-Type": form ? "application/x-www-form-urlencoded" : "application/json"}, body: form ? new URLSearchParams(body) : JSON.stringify(body)});
  const j = await r.json().catch(() => ({}));
  if(!r.ok){ const code = ((j.error && j.error.message) || "").split(" ")[0].split(":")[0]; throw new Error(ERR[code] || (code ? code.replace(/_/g, " ").toLowerCase() : "Could not reach the server")); }
  return j; }
const AUTH = path => `https://identitytoolkit.googleapis.com/v1/accounts:${path}?key=${FIREBASE_API_KEY}`;
function keep(token, refresh, expiresIn, uid, name, email){ sess = {token, refresh, exp: Date.now() / 1000 + (+expiresIn || 3600), uid, name, email};
  try{ localStorage.setItem(SESSION, JSON.stringify({refresh, name, email})); }catch(e){} }
// what was typed in the login box: an e-mail address, or the name of an old account
const toMail = id => id.includes("@") ? id.trim() : mail(id);
export async function signUp(email, pw){ email = email.trim(); const j = await post(AUTH("signUp"), {email, password: pw, returnSecureToken: true}); keep(j.idToken, j.refreshToken, j.expiresIn, j.localId, email, email); }
export async function logIn(id, pw){ id = id.trim(); const email = toMail(id); const j = await post(AUTH("signInWithPassword"), {email, password: pw, returnSecureToken: true}); keep(j.idToken, j.refreshToken, j.expiresIn, j.localId, id, email); }
async function refresh(rt, name, email){ const j = await post(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {grant_type: "refresh_token", refresh_token: rt}, true);
  keep(j.id_token, j.refresh_token, j.expires_in, j.user_id, name, email); }
// an old account still has a made-up address: it can add a real one, and only then reset its password
export const needsEmail = () => !!sess && /@players\.rimfrost2\.game$/.test(sess.email || "");
// "Forgot password?": Firebase mails a link for choosing a new password (it says the same whether the address has an account or not)
export async function resetPassword(email){ await post(AUTH("sendOobCode"), {requestType: "PASSWORD_RESET", email: email.trim()}); }
// add a real e-mail to an old account: Firebase mails a link to it, and the account changes to that address once the link is clicked
export async function addEmail(newEmail){ const t = await token(); await post(AUTH("sendOobCode"), {requestType: "VERIFY_AND_CHANGE_EMAIL", idToken: t, newEmail: newEmail.trim()}); }
// log back in with the session saved in this browser
export async function resume(){ let s = null; try{ s = JSON.parse(localStorage.getItem(SESSION)); }catch(e){} if(!s || !s.refresh) return false;
  try{ await refresh(s.refresh, s.name, s.email || toMail(s.name || "")); return true; }catch(e){ try{ localStorage.removeItem(SESSION); }catch(_){} return false; } }
export function logOut(){ sess = null; SID = null; kicked = false; try{ localStorage.removeItem(SESSION); }catch(e){} }
async function token(){ const s = sess; if(s && Date.now() / 1000 > s.exp - 60) await refresh(s.refresh, s.name, s.email); return s ? s.token : (sess && sess.token); }
// the save is one document per player (saves/<player id>) holding {chars, world} as text
const DOC = (uid = sess.uid) => `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/saves/${uid}`;
export async function loadCloud(){ const t = await token(), r = await fetch(DOC(), {headers: {Authorization: "Bearer " + t}});
  if(r.status === 404) return null; if(!r.ok) throw new Error("Could not load your characters");
  const j = await r.json(); try{ return JSON.parse(j.fields.data.stringValue); }catch(e){ return null; } }
// one browser at a time: logging in writes a new session code to the save; a browser whose code has been replaced stops saving and is logged out
let SID = null, kicked = false, onKick = null;
export const setOnKick = f => { onKick = f; };
export async function claimSession(){ SID = Math.random().toString(36).slice(2) + Date.now().toString(36); kicked = false; const t = await token();
  await fetch(DOC() + "?updateMask.fieldPaths=sid", {method: "PATCH", headers: {Authorization: "Bearer " + t, "Content-Type": "application/json"}, body: JSON.stringify({fields: {sid: {stringValue: SID}}})}); }
// is this still the browser that logged in last? (if the server can't be reached, carry on)
export async function checkSession(){ if(!sess || !SID || kicked) return !kicked; try{ const t = await token(), r = await fetch(DOC() + "?mask.fieldPaths=sid", {headers: {Authorization: "Bearer " + t}});
    if(!r.ok) return true; const j = await r.json(), cur = j.fields && j.fields.sid && j.fields.sid.stringValue;
    if(cur && cur !== SID){ kicked = true; if(onKick) onKick(); return false; } }catch(e){} return true; }
// saves go out one after another, in order (only the fields they change, so the session code stays)
let chain = Promise.resolve();
export function saveCloud(data, keepalive = false){ if(!sess || kicked) return chain; const uid = sess.uid;
  chain = chain.then(async () => { try{ if(!keepalive && !(await checkSession())) return; const t = await token(); const r = await fetch(DOC(uid) + "?updateMask.fieldPaths=data&updateMask.fieldPaths=at", {method: "PATCH", keepalive, headers: {Authorization: "Bearer " + t, "Content-Type": "application/json"},
      body: JSON.stringify({fields: {data: {stringValue: JSON.stringify(data)}, at: {timestampValue: new Date().toISOString()}}})}); if(!r.ok) console.warn("Cloud save failed:", r.status); }
    catch(e){ console.warn("Cloud save failed:", e); } });
  return chain; }
