<?php

namespace App\Http\Controllers;

use App\Models\Mouvement;
use Illuminate\Http\Request;

class MouvementController extends Controller
{
    // Lister tous les mouvements avec leurs relations
    public function index()
    {
        return response()->json(
            Mouvement::with(['produit', 'user', 'magasin'])->get()
        );
    }

    // Créer un nouveau mouvement
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

        $mouvement = Mouvement::create($validated);

        return response()->json($mouvement, 201);
    }

    // Afficher un mouvement spécifique
    public function show($id)
    {
        $mouvement = Mouvement::with(['produit', 'user', 'magasin'])->findOrFail($id);
        return response()->json($mouvement);
    }

    // Mettre à jour un mouvement
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

        $mouvement->update($validated);

        return response()->json($mouvement);
    }

    // Supprimer un mouvement
    public function destroy($id)
    {
        $mouvement = Mouvement::findOrFail($id);
        $mouvement->delete();

        return response()->json(null, 204);
    }
}
