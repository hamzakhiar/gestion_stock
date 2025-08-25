<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('demandes_achat', 'priorite')) {
            Schema::table('demandes_achat', function (Blueprint $table) {
                $table->enum('priorite', ['basse','normale','haute','urgente'])
                    ->default('normale')
                    ->after('quantite_demandee');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('demandes_achat', 'priorite')) {
            Schema::table('demandes_achat', function (Blueprint $table) {
                $table->dropColumn('priorite');
            });
        }
    }
};




