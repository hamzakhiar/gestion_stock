<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMagasin;
use Illuminate\Http\Request;

class StockMagasinController extends Controller
{
    /**
     * Lister tous les stocks avec filtres facultatifs par magasin_id et produit_id
     */
    public function index(Request $request)
    {
        $query = StockMagasin::with(['magasin', 'produit']);

        if ($request->filled('magasin_id')) {
            $query->where('magasin_id', $request->magasin_id);
        }

        if ($request->filled('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }

        $stocks = $query->paginate(15);

        return response()->json($stocks);
    }

    /**
     * Créer ou mettre à jour une ligne de stock
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'magasin_id' => 'required|exists:magasins,id',
            'produit_id' => 'required|exists:produits,id',
            'quantite'   => 'required|integer|min:0',
        ]);

        $stock = StockMagasin::where('magasin_id', $validated['magasin_id'])
            ->where('produit_id', $validated['produit_id'])
            ->first();

        if ($stock) {
            $stock->quantite = $validated['quantite'];
            $stock->save();

            return response()->json([
                'message' => 'Stock mis à jour avec succès.',
                'data'    => $stock,
            ], 200);
        }

        $stock = StockMagasin::create($validated);

        return response()->json([
            'message' => 'Stock créé avec succès.',
            'data'    => $stock,
        ], 201);
    }

    /**
     * Afficher un stock spécifique
     */
    public function show($id)
    {
        $stock = StockMagasin::with(['magasin', 'produit'])->find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock non trouvé.'], 404);
        }

        return response()->json($stock);
    }

    /**
     * Mettre à jour un stock existant
     */
    public function update(Request $request, $id)
    {
        $stock = StockMagasin::find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock non trouvé.'], 404);
        }

        $validated = $request->validate([
            'magasin_id' => 'required|exists:magasins,id',
            'produit_id' => 'required|exists:produits,id',
            'quantite'   => 'required|integer|min:0',
        ]);

        $stock->update($validated);

        return response()->json([
            'message' => 'Stock mis à jour avec succès.',
            'data'    => $stock,
        ]);
    }

    /**
     * Supprimer un stock
     */
    public function destroy($id)
    {
        $stock = StockMagasin::find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock non trouvé.'], 404);
        }

        $stock->delete();

        return response()->json(['message' => 'Stock supprimé avec succès.']);
    }
}
