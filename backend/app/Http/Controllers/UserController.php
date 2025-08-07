<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Lister tous les utilisateurs.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Liste des utilisateurs récupérée avec succès.',
            'data' => User::all()
        ]);
    }

    /**
     * Créer un nouvel utilisateur.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'nullable|string|max:20'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'data' => $user
        ], 201);
    }

    /**
     * Afficher un utilisateur spécifique.
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        return response()->json([
            'message' => 'Utilisateur récupéré avec succès.',
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour un utilisateur.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:100',
            'email'    => 'sometimes|required|string|email|max:100|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role'     => 'sometimes|required|string|max:20'
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'data' => $user
        ]);
    }

    /**
     * Supprimer un utilisateur.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.'], 200);
    }
}
