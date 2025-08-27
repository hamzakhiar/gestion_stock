<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produit extends Model
{
    use HasFactory;

    protected $table = 'produits';

    protected $fillable = [
        'nom',
        'categorie',
        'fournisseur',
        'seuil_critique',
    ];

    // Relations

    public function stocks()
    {
        return $this->hasMany(StockMagasin::class, 'produit_id');
    }

    public function mouvements()
    {
        return $this->hasMany(Mouvement::class, 'produit_id');
    }

    public function demandesAchat()
    {
        return $this->hasMany(DemandeAchat::class, 'produit_id');
    }
}
