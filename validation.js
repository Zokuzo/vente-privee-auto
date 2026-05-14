/* ================================================
   VALIDATION & SANITIZATION — Fonctions pures
================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+33|0033|0)[1-9](\s?\d{2}){4}$/;
const NAME_RE  = /^[a-zA-ZÀ-ÿ'\-\s]{2,50}$/;
const VALID_DATES = ['2026-05-24', '2026-05-25'];

export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function validateEmail(email) {
  return EMAIL_RE.test(String(email).trim());
}

export function validatePhone(phone) {
  return PHONE_RE.test(String(phone).replace(/[\s.\-]/g, ''));
}

export function validateName(name) {
  return NAME_RE.test(String(name).trim());
}

export function validateDate(date) {
  return VALID_DATES.includes(String(date));
}

export function validateMessage(msg) {
  return String(msg).length <= 500;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const months = ['janvier','février','mars','avril','mai','juin',
                  'juillet','août','septembre','octobre','novembre','décembre'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}
