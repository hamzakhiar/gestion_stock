<?php

namespace App\Http\Controllers;

use App\Models\Mouvement;
use Illuminate\Http\Request;

/**
 * Contrôleur des mouvements de stock.
 *
 * Fournit des endpoints REST pour lister, créer, consulter, mettre à jour
 * et supprimer des mouvements. La création et la mise à jour incluent une
 * validation métier pour empêcher les sorties avec stock insuffisant.
 */
class MouvementController extends Controller
{
    /**
     * Lister tous les mouvements avec leurs relations.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        return response()->json(
            Mouvement::with(['produit', 'user', 'magasin'])->get()
        );
    }

    /**
     * Créer un nouveau mouvement.
     *
     * Règle métier: refuser une sortie si le stock disponible n'est pas suffisant.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'         => 'required|in:entrée,sortie,transfert',
            'produit_id'   => 'required|exists:produits,id',
            'quantite'     => 'required|integer|min:1',
            'user_id'      => 'required|exists:users,id',
            'magasin_id'   => 'required|exists:magasins,id', // ❗ pas nullable selon ton schéma
            'reference_id' => 'nullable|integer',
            'created_at'   => 'nullable|date',
        ]);

        // Validation stock: empêcher une sortie si stock insuffisant
        if ($validated['type'] === 'sortie') {
            $stock = Mouvement::where('produit_id', $validated['produit_id'])
                ->where('magasin_id', $validated['magasin_id'])
                ->get()
                ->reduce(function ($total, $m) {
                    $delta = in_array($m->type, ['entrée', 'transfert']) ? (int)$m->quantite : -(int)$m->quantite;
                    return $total + $delta;
                }, 0);

            if ((int)$validated['quantite'] > $stock) {
                return response()->json([
                    'message' => 'Stock insuffisant pour effectuer la sortie.',
                    'details' => [
                        'disponible' => $stock,
                        'demande' => (int)$validated['quantite'],
                    ],
                ], 422);
            }
        }

        $mouvement = Mouvement::create($validated);

        return response()->json($mouvement, 201);
    }

    /**
     * Afficher un mouvement spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $mouvement = Mouvement::with(['produit', 'user', 'magasin'])->findOrFail($id);
        return response()->json($mouvement);
    }

    /**
     * Mettre à jour un mouvement.
     *
     * Règle métier: s'assurer que la mise à jour ne rend pas le stock négatif.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $mouvement = Mouvement::findOrFail($id);

        $validated = $request->validate([
            'type'         => 'sometimes|required|in:entrée,sortie,transfert',
            'produit_id'   => 'sometimes|required|exists:produits,id',
            'quantite'     => 'sometimes|required|integer|min:1',
            'user_id'      => 'sometimes|required|exists:users,id',
            'magasin_id'   => 'sometimes|required|exists:magasins,id', // ❗ required car NOT NULL
            'reference_id' => 'nullable|integer',
            'created_at'   => 'nullable|date',
        ]);

        // Validation stock lors de la mise à jour: s'assurer que le stock ne devient pas négatif
        if (isset($validated['type']) || isset($validated['quantite']) || isset($validated['magasin_id']) || isset($validated['produit_id'])) {
            $newType = $validated['type'] ?? $mouvement->type;
            $newQuantite = isset($validated['quantite']) ? (int)$validated['quantite'] : (int)$mouvement->quantite;
            $newMagasinId = $validated['magasin_id'] ?? $mouvement->magasin_id;
            $newProduitId = $validated['produit_id'] ?? $mouvement->produit_id;

            // Stock actuel en excluant ce mouvement
            $stockSansCourant = Mouvement::where('produit_id', $newProduitId)
                ->where('magasin_id', $newMagasinId)
                ->where('id', '<>', $mouvement->id)
                ->get()
                ->reduce(function ($total, $m) {
                    $delta = in_array($m->type, ['entrée', 'transfert']) ? (int)$m->quantite : -(int)$m->quantite;
                    return $total + $delta;
                }, 0);

            $deltaNouveau = in_array($newType, ['entrée', 'transfert']) ? $newQuantite : -$newQuantite;
            if (($stockSansCourant + $deltaNouveau) < 0) {
                return response()->json([
                    'message' => 'Stock insuffisant après mise à jour du mouvement.',
                    'details' => [
                        'disponible' => $stockSansCourant,
                        'demande' => $newQuantite,
                    ],
                ], 422);
            }
        }

        $mouvement->update($validated);

        return response()->json($mouvement);
    }

    /**
     * Supprimer un mouvement.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $mouvement = Mouvement::findOrFail($id);
        $mouvement->delete();

        return response()->json(null, 204);
    }
}
