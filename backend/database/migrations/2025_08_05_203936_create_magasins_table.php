<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMagasinsTable extends Migration
{
    public function up()
    {
        Schema::create('magasins', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('localisation', 255);
            $table->timestamps();

            $table->index('nom', 'idx_magasin_nom');
        });
    }

    public function down()
    {
        Schema::dropIfExists('magasins');
    }
}
