<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transfert;
use App\Models\Mouvement;
use Illuminate\Http\Request;

class TransfertController extends Controller
{
    /**
     * Lister tous les transferts avec leurs mouvements associés.
     */
    public function index(Request $request)
    {
        $transferts = Transfert::with(['mouvementSortie', 'mouvementEntree'])->paginate(15);

        return response()->json($transferts);
    }

    /**
     * Créer un nouveau transfert entre deux mouvements.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mouvement_sortie_id' => 'required|exists:mouvements,id',
            'mouvement_entree_id' => 'required|exists:mouvements,id',
            'created_at' => 'nullable|date',
        ]);

        $sortie = Mouvement::find($validated['mouvement_sortie_id']);
        $entree = Mouvement::find($validated['mouvement_entree_id']);

        if (!$sortie || !$entree) {
            return response()->json(['message' => 'Mouvement(s) introuvable(s).'], 404);
        }

        // Vérifie que les deux mouvements concernent le même produit et la même quantité
        if (
            $sortie->produit_id !== $entree->produit_id ||
            $sortie->quantite !== $entree->quantite
        ) {
            return response()->json(['message' => 'Les mouvements ne correspondent pas (produit ou quantité différents).'], 422);
        }

        $transfert = Transfert::create($validated);

        return response()->json([
            'message' => 'Transfert créé avec succès.',
            'data' => $transfert,
        ], 201);
    }

    /**
     * Afficher un transfert spécifique.
     */
    public function show($id)
    {
        $transfert = Transfert::with(['mouvementSortie', 'mouvementEntree'])->find($id);

        if (!$transfert) {
            return response()->json(['message' => 'Transfert non trouvé.'], 404);
        }

        return response()->json($transfert);
    }

    /**
     * Mettre à jour un transfert existant.
     */
    public function update(Request $request, $id)
    {
        $transfert = Transfert::find($id);

        if (!$transfert) {
            return response()->json(['message' => 'Transfert non trouvé.'], 404);
        }

        $validated = $request->validate([
            'mouvement_sortie_id' => 'required|exists:mouvements,id',
            'mouvement_entree_id' => 'required|exists:mouvements,id',
            'created_at' => 'nullable|date',
        ]);

        $sortie = Mouvement::find($validated['mouvement_sortie_id']);
        $entree = Mouvement::find($validated['mouvement_entree_id']);

        if (
            $sortie->produit_id !== $entree->produit_id ||
            $sortie->quantite !== $entree->quantite
        ) {
            return response()->json(['message' => 'Les mouvements ne correspondent pas.'], 422);
        }

        $transfert->update($validated);

        return response()->json([
            'message' => 'Transfert mis à jour avec succès.',
            'data' => $transfert,
        ]);
    }

    /**
     * Supprimer un transfert.
     */
    public function destroy($id)
    {
        $transfert = Transfert::find($id);

        if (!$transfert) {
            return response()->json(['message' => 'Transfert non trouvé.'], 404);
        }

        $transfert->delete();

        return response()->json(['message' => 'Transfert supprimé avec succès.']);
    }
}
