<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    // ✅ Afficher tous les produits
    public function index()
    {
        return response()->json(Produit::all());
    }

    // ✅ Créer un nouveau produit
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'             => 'required|string|max:100',
            'categorie'       => 'required|string|max:50',
            'fournisseur'     => 'required|string|max:100',
            'date_peremption' => 'nullable|date',
            'seuil_critique'  => 'nullable|integer|min:0',
        ]);

        $produit = Produit::create($validated);

        return response()->json($produit, 201);
    }

    // ✅ Afficher un seul produit
    public function show($id)
    {
        $produit = Produit::findOrFail($id);
        return response()->json($produit);
    }

    // ✅ Mettre à jour un produit
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $validated = $request->validate([
            'nom'             => 'sometimes|required|string|max:100',
            'categorie'       => 'sometimes|required|string|max:50',
            'fournisseur'     => 'sometimes|required|string|max:100',
            'date_peremption' => 'nullable|date',
            'seuil_critique'  => 'nullable|integer|min:0',
        ]);

        $produit->update($validated);

        return response()->json($produit);
    }

    // ✅ Supprimer un produit
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);
        $produit->delete();

        return response()->json(null, 204);
    }
}
