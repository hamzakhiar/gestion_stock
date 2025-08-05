<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProduitsTable extends Migration
{
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('categorie', 50);
            $table->string('fournisseur', 100);
            $table->date('date_peremption')->nullable();
            $table->integer('seuil_critique')->default(5);
            $table->timestamps();
            
            // Indexes
            $table->index('nom', 'idx_nom');
            $table->index('categorie', 'idx_categorie');
        });
    }

    public function down()
    {
        Schema::dropIfExists('produits');
    }
}
