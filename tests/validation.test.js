import { describe, it, expect } from 'vitest';
import {
  escapeHTML, validateEmail, validatePhone,
  validateName, validateDate, validateMessage, formatDate,
} from '../validation.js';

describe('escapeHTML', () => {
  it('échappe les balises script', () => {
    expect(escapeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
  it('échappe les guillemets doubles', () => {
    expect(escapeHTML('"valeur"')).toBe('&quot;valeur&quot;');
  });
  it('échappe les esperluettes', () => {
    expect(escapeHTML('M&M')).toBe('M&amp;M');
  });
  it('échappe les guillemets simples', () => {
    expect(escapeHTML("c'est")).toBe('c&#39;est');
  });
  it('laisse inchangée une chaîne sans caractères spéciaux', () => {
    expect(escapeHTML('Jean Dupont')).toBe('Jean Dupont');
  });
});

describe('validateEmail', () => {
  it('accepte un email valide', () => {
    expect(validateEmail('jean.dupont@example.com')).toBe(true);
  });
  it('accepte un email avec sous-domaine', () => {
    expect(validateEmail('user@mail.company.fr')).toBe(true);
  });
  it('rejette un email sans @', () => {
    expect(validateEmail('invalide.com')).toBe(false);
  });
  it('rejette un email sans domaine', () => {
    expect(validateEmail('user@')).toBe(false);
  });
  it('rejette une chaîne vide', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepte 06 12 34 56 78', () => {
    expect(validatePhone('06 12 34 56 78')).toBe(true);
  });
  it('accepte +33612345678', () => {
    expect(validatePhone('+33612345678')).toBe(true);
  });
  it('accepte 0033612345678', () => {
    expect(validatePhone('0033612345678')).toBe(true);
  });
  it('accepte un fixe 01 23 45 67 89', () => {
    expect(validatePhone('01 23 45 67 89')).toBe(true);
  });
  it('rejette un numéro trop court', () => {
    expect(validatePhone('0612')).toBe(false);
  });
  it('rejette des lettres', () => {
    expect(validatePhone('abc')).toBe(false);
  });
  it('rejette une chaîne vide', () => {
    expect(validatePhone('')).toBe(false);
  });
});

describe('validateName', () => {
  it('accepte un prénom simple', () => {
    expect(validateName('Jean')).toBe(true);
  });
  it('accepte un prénom composé avec tiret', () => {
    expect(validateName('Jean-Pierre')).toBe(true);
  });
  it("accepte O'Brien avec apostrophe", () => {
    expect(validateName("O'Brien")).toBe(true);
  });
  it('accepte un prénom accentué', () => {
    expect(validateName('Éléonore')).toBe(true);
  });
  it('rejette une seule lettre (trop court)', () => {
    expect(validateName('A')).toBe(false);
  });
  it('rejette un nom avec chiffres', () => {
    expect(validateName('Jean2')).toBe(false);
  });
  it('rejette une chaîne vide', () => {
    expect(validateName('')).toBe(false);
  });
});

describe('validateDate', () => {
  it('accepte le 24 mai 2026', () => {
    expect(validateDate('2026-05-24')).toBe(true);
  });
  it('accepte le 25 mai 2026', () => {
    expect(validateDate('2026-05-25')).toBe(true);
  });
  it('rejette une date hors plage', () => {
    expect(validateDate('2026-05-26')).toBe(false);
  });
  it('rejette une date passée', () => {
    expect(validateDate('2025-01-01')).toBe(false);
  });
  it('rejette une chaîne vide', () => {
    expect(validateDate('')).toBe(false);
  });
});

describe('validateMessage', () => {
  it('accepte un message vide', () => {
    expect(validateMessage('')).toBe(true);
  });
  it('accepte exactement 500 caractères', () => {
    expect(validateMessage('a'.repeat(500))).toBe(true);
  });
  it('rejette 501 caractères', () => {
    expect(validateMessage('a'.repeat(501))).toBe(false);
  });
});

describe('formatDate', () => {
  it('formate le 24 mai 2026', () => {
    expect(formatDate('2026-05-24')).toBe('24 mai 2026');
  });
  it('formate le 25 mai 2026', () => {
    expect(formatDate('2026-05-25')).toBe('25 mai 2026');
  });
  it('retourne — pour une valeur vide', () => {
    expect(formatDate('')).toBe('—');
  });
  it('retourne — pour null', () => {
    expect(formatDate(null)).toBe('—');
  });
});
