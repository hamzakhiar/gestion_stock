<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDemandesAchatTable extends Migration
{
    public function up()
    {
        Schema::create('demandes_achat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->integer('quantite_demandee');
            $table->enum('priorite', ['basse','normale','haute','urgente'])->default('normale');
            $table->string('statut', 20)->default('en_attente');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('magasin_id')->constrained('magasins')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();

            $table->index('statut', 'idx_statut');
        });
    }

    public function down()
    {
        Schema::dropIfExists('demandes_achat');
    }
}
