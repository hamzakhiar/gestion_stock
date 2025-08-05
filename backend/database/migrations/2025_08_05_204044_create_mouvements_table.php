<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMouvementsTable extends Migration
{
    public function up(): void
    {
        Schema::create('mouvements', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['entrée', 'sortie', 'transfert']);
            $table->foreignId('produit_id')->constrained('produits');
            $table->integer('quantite');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('magasin_id')->constrained('magasins');
            $table->unsignedBigInteger('reference_id')->nullable(); // For transferts/demandes
            $table->timestamp('created_at')->useCurrent(); // Only created_at
            
            // Indexes
            $table->index('type', 'idx_type');
            $table->index('created_at', 'idx_created_at');
            $table->index('magasin_id', 'idx_magasin');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mouvements');
    }
}
