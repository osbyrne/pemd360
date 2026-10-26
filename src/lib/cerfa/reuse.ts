/** Classify CERFA inventory using the explicit flag or a known, positive reuse potential. */
export function isCerfaReuseItem(item: {
  reemploi: number | null;
  potentielReemploi: string | null;
}): boolean {
  if (item.reemploi === 1) return true;

  const potential = item.potentielReemploi?.trim().toLowerCase() ?? "";
  // These are the positive choices offered by the inventory creation form.
  if (["fort", "moyen", "faible"].includes(potential)) return true;

  // Accept legacy decimal coefficients (including tabs, percentages and a trailing dot),
  // while rejecting unknown labels and partially numeric text instead of treating them as true.
  if (!/^\+?(?:\d+(?:[.,]\d*)?|[.,]\d+)\s*%?$/.test(potential)) return false;
  const coefficient = Number(potential.replace(/\s*%$/, "").replace(",", "."));
  return Number.isFinite(coefficient) && coefficient > 0;
}
