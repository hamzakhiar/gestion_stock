<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Magasin extends Model
{
    use HasFactory;

    protected $table = 'magasins';

    protected $fillable = [
        'nom',
        'localisation',
    ];

    // Relations

    public function stocks()
    {
        return $this->hasMany(StockMagasin::class, 'magasin_id');
    }

    public function mouvements()
    {
        return $this->hasMany(Mouvement::class, 'magasin_id');
    }

    public function demandesAchat()
    {
        return $this->hasMany(DemandeAchat::class, 'magasin_id');
    }
}
