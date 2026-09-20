import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCity } from "./city.ts";

test("une ville saisie en majuscules redevient lisible", () => {
  assert.equal(formatCity("SAINT LAURENT DU MARONI"), "Saint Laurent du Maroni");
});

test("les traits d'union sont préservés", () => {
  assert.equal(formatCity("SAINT-LAURENT-DU-MARONI"), "Saint-Laurent-du-Maroni");
});

test("les particules restent en minuscules, sauf en tête de nom", () => {
  assert.equal(formatCity("LE LAMENTIN"), "Le Lamentin");
  assert.equal(formatCity("SAINT-GEORGES-DE-L-OYAPOCK"), "Saint-Georges-de-l-Oyapock");
});

test("une ville déjà bien écrite n'est pas abîmée", () => {
  assert.equal(formatCity("Cayenne"), "Cayenne");
});

test("les valeurs absentes ne provoquent pas d'erreur", () => {
  assert.equal(formatCity(null), "");
  assert.equal(formatCity(undefined), "");
  assert.equal(formatCity(""), "");
  assert.equal(formatCity("   "), "");
});

test("les espaces superflus sont retirés", () => {
  assert.equal(formatCity("  cayenne  "), "Cayenne");
});
