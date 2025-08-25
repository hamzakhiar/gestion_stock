<?php

namespace App\Http\Controllers;

use App\Models\DemandeAchat;
use Illuminate\Http\Request;

/**
 * Contrôleur des demandes d'achat (réapprovisionnement).
 *
 * Permet de lister, créer, consulter, mettre à jour et supprimer des demandes.
 * Supporte le chargement conditionnel des relations via le paramètre `with`.
 */
class DemandeAchatController extends Controller
{
    /**
     * Afficher toutes les demandes d'achat.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = DemandeAchat::query();
        
        // Load relationships if requested
        if ($request->has('with')) {
            $relations = explode(',', $request->get('with'));
            $query->with($relations);
        }
        
        return response()->json($query->get());
    }

    /**
     * Créer une nouvelle demande d'achat.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'quantite_demandee' => 'required|integer|min:1',
            'priorite' => 'nullable|in:basse,normale,haute,urgente',
            'statut' => 'nullable|string|max:20',
            'user_id' => 'required|exists:users,id',
            'magasin_id' => 'required|exists:magasins,id',
            'created_at' => 'nullable|date',
        ]);

        $demande = DemandeAchat::create($validated);
        return response()->json($demande, 201);
    }

    /**
     * Afficher une demande d'achat spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $demande = DemandeAchat::findOrFail($id);
        return response()->json($demande);
    }

    /**
     * Mettre à jour une demande d'achat.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $demande = DemandeAchat::findOrFail($id);

        $validated = $request->validate([
            'produit_id' => 'sometimes|required|exists:produits,id',
            'quantite_demandee' => 'sometimes|required|integer|min:1',
            'priorite' => 'sometimes|in:basse,normale,haute,urgente',
            'statut' => 'sometimes|string|max:20',
            'user_id' => 'sometimes|required|exists:users,id',
            'magasin_id' => 'sometimes|required|exists:magasins,id',
            'created_at' => 'sometimes|date',
        ]);

        $demande->update($validated);

        return response()->json($demande);
    }

    /**
     * Supprimer une demande d'achat.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $demande = DemandeAchat::findOrFail($id);
        $demande->delete();

        return response()->json(null, 204);
    }
}
