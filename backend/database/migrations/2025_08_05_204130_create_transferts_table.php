<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransfertsTable extends Migration
{
    public function up()
    {
        Schema::create('transferts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mouvement_sortie_id')->constrained('mouvements')->onDelete('cascade');
            $table->foreignId('mouvement_entree_id')->constrained('mouvements')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent(); // Only created_at
            
            
            $table->unique('mouvement_sortie_id', 'idx_sortie');
            $table->unique('mouvement_entree_id', 'idx_entree');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transferts');
    }
}
