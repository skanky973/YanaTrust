import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTrustScore, getTrustLevel } from "./score.ts";

// Le défaut que ces tests verrouillent : l'ancien barème réservait 30 points à
// des vérifications qui n'existaient pas, plafonnant le score à 70 alors que le
// niveau "Élevé" commence à 80. Personne ne pouvait l'atteindre.

test("un prestataire irréprochable et expérimenté atteint 100", () => {
  assert.equal(computeTrustScore({ averageRating: 5, reviewCount: 10 }), 100);
});

test("le niveau Élevé est atteignable", () => {
  const score = computeTrustScore({ averageRating: 5, reviewCount: 10 });
  assert.equal(getTrustLevel(score).level, "eleve");
});

test("un seul avis parfait ne suffit pas à être au niveau le plus haut", () => {
  const score = computeTrustScore({ averageRating: 5, reviewCount: 1 });
  assert.equal(score, 73);
  assert.equal(getTrustLevel(score).level, "moyen");
});

test("un prestataire sans aucun avis part de zéro", () => {
  const score = computeTrustScore({ averageRating: null, reviewCount: 0 });
  assert.equal(score, 0);
  assert.equal(getTrustLevel(score).level, "debutant");
});

test("l'expérience est plafonnée : le 11e avis ne rapporte plus rien", () => {
  assert.equal(
    computeTrustScore({ averageRating: 3, reviewCount: 10 }),
    computeTrustScore({ averageRating: 3, reviewCount: 50 }),
  );
});

test("le score ne dépasse jamais 100 ni ne descend sous 0", () => {
  for (const note of [0, 1, 2.5, 4, 5]) {
    for (const avis of [0, 1, 5, 10, 100]) {
      const score = computeTrustScore({ averageRating: note, reviewCount: avis });
      assert.ok(score >= 0 && score <= 100, `score hors bornes : ${score}`);
    }
  }
});

test("une mauvaise note reste au niveau débutant malgré l'expérience", () => {
  const score = computeTrustScore({ averageRating: 1, reviewCount: 50 });
  assert.equal(getTrustLevel(score).level, "debutant");
});
