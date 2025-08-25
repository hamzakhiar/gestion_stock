<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modèle Eloquent pour les demandes d'achat.
 *
 * Représente une demande de réapprovisionnement avec ses relations
 * vers le produit, le magasin et l'utilisateur demandeur.
 */
class DemandeAchat extends Model
{
    use HasFactory;

    protected $table = 'demandes_achat';

    public $timestamps = false;

    protected $fillable = [
        'produit_id',
        'quantite_demandee',
        'priorite',
        'statut',
        'user_id',
        'magasin_id',
        'created_at'
    ];

    // Relations

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function magasin()
    {
        return $this->belongsTo(Magasin::class, 'magasin_id');
    }
}
