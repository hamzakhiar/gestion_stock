<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mouvement extends Model
{
    use HasFactory;

    protected $table = 'mouvements';

    

    protected $fillable = [
        'type',
        'produit_id',
        'quantite',
        'user_id',
        'magasin_id',
        'reference_id',
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
