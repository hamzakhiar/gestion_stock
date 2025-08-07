<?php

namespace App\Http\Controllers;

use App\Models\Magasin;
use Illuminate\Http\Request;

class MagasinController extends Controller
{
    // Lister tous les magasins
    public function index()
    {
        return response()->json(Magasin::all());
    }

    // Créer un nouveau magasin
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'localisation' => 'required|string|max:255', // Champ correct selon la table
        ]);

        $magasin = Magasin::create($validated);

        return response()->json($magasin, 201);
    }

    // Afficher un magasin spécifique
    public function show($id)
    {
        $magasin = Magasin::findOrFail($id);
        return response()->json($magasin);
    }

    // Mettre à jour un magasin
    public function update(Request $request, $id)
    {
        $magasin = Magasin::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:100',
            'localisation' => 'sometimes|required|string|max:255',
        ]);

        $magasin->update($validated);

        return response()->json($magasin);
    }

    // Supprimer un magasin
    public function destroy($id)
    {
        $magasin = Magasin::findOrFail($id);
        $magasin->delete();

        return response()->json(null, 204);
    }
}
