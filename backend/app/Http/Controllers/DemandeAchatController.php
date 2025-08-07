<?php

namespace App\Http\Controllers;

use App\Models\DemandeAchat;
use Illuminate\Http\Request;

class DemandeAchatController extends Controller
{
    // Afficher toutes les demandes d'achat
    public function index()
    {
        return response()->json(DemandeAchat::all());
    }

    // Créer une nouvelle demande d'achat
    public function store(Request $request)
    {
        $validated = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'quantite_demandee' => 'required|integer|min:1',
            'statut' => 'nullable|string|max:20',
            'user_id' => 'required|exists:users,id',
            'magasin_id' => 'required|exists:magasins,id',
            'created_at' => 'nullable|date',
        ]);

        $demande = DemandeAchat::create($validated);
        return response()->json($demande, 201);
    }

    // Afficher une demande d'achat spécifique
    public function show($id)
    {
        $demande = DemandeAchat::findOrFail($id);
        return response()->json($demande);
    }

    // Mettre à jour une demande d'achat
    public function update(Request $request, $id)
    {
        $demande = DemandeAchat::findOrFail($id);

        $validated = $request->validate([
            'produit_id' => 'sometimes|required|exists:produits,id',
            'quantite_demandee' => 'sometimes|required|integer|min:1',
            'statut' => 'sometimes|string|max:20',
            'user_id' => 'sometimes|required|exists:users,id',
            'magasin_id' => 'sometimes|required|exists:magasins,id',
            'created_at' => 'sometimes|date',
        ]);

        $demande->update($validated);

        return response()->json($demande);
    }

    // Supprimer une demande d'achat
    public function destroy($id)
    {
        $demande = DemandeAchat::findOrFail($id);
        $demande->delete();

        return response()->json(null, 204);
    }
}
