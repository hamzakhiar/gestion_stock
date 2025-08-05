<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockMagasinTable extends Migration
{
    public function up(): void
    {
        Schema::create('stock_magasin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magasin_id')->constrained('magasins');
            $table->foreignId('produit_id')->constrained('produits');
            $table->integer('quantite')->default(0);
           
            
            // Unique index
            $table->unique(['magasin_id', 'produit_id'], 'uniq_magasin_produit');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_magasin');
    }
}
