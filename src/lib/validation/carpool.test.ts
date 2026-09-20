import { test } from "node:test";
import assert from "node:assert/strict";
import { tripFormSchema } from "./carpool.ts";

// Ce schéma est la porte d'entrée d'un trajet payant : c'est lui qui décide du
// prix par place et du nombre de places mises en vente. Une valeur aberrante
// qui passerait ici deviendrait une somme réellement prélevée sur une carte
// bancaire.

const trajetValide = {
  originCity: "Saint-Laurent-du-Maroni",
  destinationCity: "Cayenne",
  departureDate: "2026-12-24",
  departureTime: "08:30",
  seatsTotal: "3",
  pricePerSeat: "25",
  description: "",
};

test("un trajet correct est accepté et les nombres sont convertis", () => {
  const r = tripFormSchema.safeParse(trajetValide);
  assert.ok(r.success);
  assert.equal(r.data.seatsTotal, 3);
  assert.equal(r.data.pricePerSeat, 25);
});

test("un prix négatif est refusé", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, pricePerSeat: "-10" });
  assert.equal(r.success, false);
});

test("un prix non numérique est refusé", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, pricePerSeat: "gratuit" });
  assert.equal(r.success, false);
});

test("un trajet gratuit reste autorisé", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, pricePerSeat: "0" });
  assert.ok(r.success);
  assert.equal(r.data.pricePerSeat, 0);
});

test("zéro place est refusé", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, seatsTotal: "0" });
  assert.equal(r.success, false);
});

test("un nombre de places décimal est refusé", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, seatsTotal: "2.5" });
  assert.equal(r.success, false);
});

test("plus de 8 places est refusé : c'est une voiture, pas un autocar", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, seatsTotal: "50" });
  assert.equal(r.success, false);
});

test("une heure mal formée est refusée", () => {
  for (const heure of ["8h30", "0830", "25:00 ", "abc"]) {
    const r = tripFormSchema.safeParse({ ...trajetValide, departureTime: heure });
    assert.equal(r.success, false, `accepté à tort : ${heure}`);
  }
});

test("une ville vide est refusée", () => {
  const r = tripFormSchema.safeParse({ ...trajetValide, originCity: " " });
  assert.equal(r.success, false);
});
