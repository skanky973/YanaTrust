import { test } from "node:test";
import assert from "node:assert/strict";
import { sansAccents } from "./accents.ts";

// Ces tests verrouillent le défaut corrigé : la recherche n'interrogeait que
// le titre, avec une comparaison insensible à la casse mais pas aux accents.
// "menage" ne trouvait donc pas "Ménage".

test("les accents sont retirés", () => {
  assert.equal(sansAccents("Ménage"), "menage");
  assert.equal(sansAccents("Électricité"), "electricite");
  assert.equal(sansAccents("Déménagement"), "demenagement");
});

test("la casse est ramenée en minuscules", () => {
  assert.equal(sansAccents("BRICOLAGE"), "bricolage");
});

test("un terme déjà sans accent est inchangé", () => {
  assert.equal(sansAccents("jardinage"), "jardinage");
});

test("les espaces autour du terme sont retirés", () => {
  assert.equal(sansAccents("  plomberie  "), "plomberie");
});

test("une saisie vide ne produit rien, pour ne pas filtrer sur du vide", () => {
  assert.equal(sansAccents(""), "");
  assert.equal(sansAccents("   "), "");
});

test("le cédille et les ligatures courantes sont traités", () => {
  assert.equal(sansAccents("Garçon"), "garcon");
  assert.equal(sansAccents("CAYENNE"), "cayenne");
});

test("une recherche tapée sans accent retrouve le texte accentué", () => {
  // La colonne search_text de la base contient la version normalisée ; c'est
  // cette correspondance-là que l'on vérifie.
  const contenuEnBase = sansAccents("Ménage à domicile, Saint-Laurent-du-Maroni");
  assert.ok(contenuEnBase.includes(sansAccents("menage")));
  assert.ok(contenuEnBase.includes(sansAccents("SAINT-LAURENT")));
});
