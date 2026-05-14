import { escapeHTML, validateEmail, validatePhone, validateName, validateDate, validateMessage, formatDate } from './validation.js';

/* ================================================
   EMAILJS — Initialisation depuis config.js (window.*)
================================================ */
const emailjsReady = !!(window.EMAILJS_PUBLIC_KEY && window.EMAILJS_PUBLIC_KEY !== '');
if (emailjsReady) {
  emailjs.init({ publicKey: window.EMAILJS_PUBLIC_KEY });
}

/* ================================================
   NAVBAR — Scroll effect
================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ================================================
   INTERSECTION OBSERVER — Reveals & dividers
================================================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal, .gold-divider[data-divider]').forEach(el => io.observe(el));

/* ================================================
   FORM — Validation & submission
================================================ */
const form      = document.getElementById('reservationForm');
const submitBtn = document.getElementById('submitBtn');
const errorBox  = document.getElementById('formError');
const msgArea   = document.getElementById('message');
const charCount = document.getElementById('charCount');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorBox.style.display = 'none';
}

function markField(id, isValid) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('field-error', !isValid);
}

/* Compteur de caractères pour le message */
if (msgArea && charCount) {
  msgArea.addEventListener('input', () => {
    const len = msgArea.value.length;
    charCount.textContent = `${len}/500`;
    charCount.classList.toggle('over-limit', len > 500);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const v = {
    prenom   : form.prenom.value.trim(),
    nom      : form.nom.value.trim(),
    email    : form.email.value.trim(),
    telephone: form.telephone.value.trim(),
    date     : form.date.value,
    creneau  : form.creneau.value,
    modele   : form.modele.value,
    message  : form.message.value.trim(),
  };

  const required = ['prenom', 'nom', 'email', 'telephone', 'date', 'creneau', 'modele'];
  const missing = required.filter(k => !v[k]);
  if (missing.length) {
    missing.forEach(k => markField(k, false));
    showError('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  if (!validateName(v.prenom)) {
    markField('prenom', false);
    showError('Le prénom ne doit contenir que des lettres (2 à 50 caractères).');
    return;
  }
  markField('prenom', true);

  if (!validateName(v.nom)) {
    markField('nom', false);
    showError('Le nom ne doit contenir que des lettres (2 à 50 caractères).');
    return;
  }
  markField('nom', true);

  if (!validateEmail(v.email)) {
    markField('email', false);
    showError("L'adresse email saisie n'est pas valide.");
    return;
  }
  markField('email', true);

  if (!validatePhone(v.telephone)) {
    markField('telephone', false);
    showError('Format téléphone invalide (ex : 06 12 34 56 78 ou +33 6 12 34 56 78).');
    return;
  }
  markField('telephone', true);

  if (!validateDate(v.date)) {
    markField('date', false);
    showError('Veuillez choisir le 24 ou 25 mai 2026.');
    return;
  }
  markField('date', true);

  if (!validateMessage(v.message)) {
    markField('message', false);
    showError('Le message ne peut pas dépasser 500 caractères.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Envoi en cours…';

  const params = {
    to_email : v.email,
    prenom   : v.prenom,
    nom      : v.nom,
    date     : formatDate(v.date),
    creneau  : v.creneau,
    modele   : v.modele,
    telephone: v.telephone,
    message  : v.message || 'Aucun message.',
  };

  try {
    if (emailjsReady) {
      await emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, params);
    } else {
      await new Promise(r => setTimeout(r, 900));
    }
    showConfirmation(params);
  } catch (err) {
    console.error('EmailJS error:', err);
    showError("Une erreur s'est produite lors de l'envoi. Veuillez réessayer.");
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmer la Réservation';
  }
});

form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
  el.addEventListener('focus', () => el.classList.remove('field-error'));
});

/* ================================================
   CONFIRMATION — Affichage sécurisé (données échappées)
================================================ */
function showConfirmation(data) {
  document.getElementById('reservation').style.display = 'none';

  const conf = document.getElementById('confirmation');
  conf.classList.add('active');

  const rows = [
    ['Client',    `${escapeHTML(data.prenom)} ${escapeHTML(data.nom)}`],
    ['Email',     escapeHTML(data.to_email)],
    ['Date',      escapeHTML(data.date)],
    ['Créneau',   escapeHTML(data.creneau)],
    ['Modèle',    escapeHTML(data.modele)],
    ['Téléphone', escapeHTML(data.telephone)],
  ];

  const recapBody = document.getElementById('recapBody');
  recapBody.innerHTML = '';

  rows.forEach(([lbl, val]) => {
    const row   = document.createElement('div');
    row.className = 'recap-row';
    const lblEl = document.createElement('span');
    lblEl.className = 'recap-lbl';
    lblEl.textContent = lbl;
    const valEl = document.createElement('span');
    valEl.className = 'recap-val';
    valEl.innerHTML = val;
    row.appendChild(lblEl);
    row.appendChild(valEl);
    recapBody.appendChild(row);
  });

  conf.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.resetForm = function() {
  form.reset();
  hideError();
  submitBtn.disabled = false;
  submitBtn.textContent = 'Confirmer la Réservation';
  if (charCount) charCount.textContent = '0/500';
  document.getElementById('confirmation').classList.remove('active');
  document.getElementById('reservation').style.display = '';
  document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
};
