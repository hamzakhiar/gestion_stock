<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transfert extends Model
{
    use HasFactory;

    protected $table = 'transferts';

    public $timestamps = false;

    protected $fillable = [
        'mouvement_sortie_id',
        'mouvement_entree_id',
        'created_at' 
    ];

    // Relations

    public function mouvementSortie()
    {
        return $this->belongsTo(Mouvement::class, 'mouvement_sortie_id');
    }

    public function mouvementEntree()
    {
        return $this->belongsTo(Mouvement::class, 'mouvement_entree_id');
    }
}
