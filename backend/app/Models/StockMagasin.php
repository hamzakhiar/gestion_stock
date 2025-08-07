<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockMagasin extends Model
{
    use HasFactory;

    protected $table = 'stock_magasin';

    public $timestamps = false;

    protected $fillable = [
        'magasin_id',
        'produit_id',
        'quantite',
    ];

    // Relations

    public function magasin()
    {
        return $this->belongsTo(Magasin::class, 'magasin_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}
