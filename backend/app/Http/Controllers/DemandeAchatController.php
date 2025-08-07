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
            'produit_id'     => 'required|exists:produits,id',
            'quantite'       => 'required|integer|min:1',
            'date_demande'   => 'required|date',
            'etat'           => 'nullable|string|max:50',
            'demande_par'    => 'nullable|string|max:100',
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
            'produit_id'     => 'sometimes|required|exists:produits,id',
            'quantite'       => 'sometimes|required|integer|min:1',
            'date_demande'   => 'sometimes|required|date',
            'etat'           => 'nullable|string|max:50',
            'demande_par'    => 'nullable|string|max:100',
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
