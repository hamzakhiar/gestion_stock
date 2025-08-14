<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DemandeAchatController;
use App\Http\Controllers\MagasinController;
use App\Http\Controllers\MouvementController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StockMagasinController;
use App\Http\Controllers\Api\TransfertController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User management
    Route::apiResource('users', UserController::class);
    
    // Core resources
    Route::apiResource('produits', ProduitController::class);
    Route::apiResource('magasins', MagasinController::class);
    Route::apiResource('demandes-achat', DemandeAchatController::class);
    Route::apiResource('mouvements', MouvementController::class);
    
    // Stock management
    Route::prefix('stocks')->group(function () {
        Route::get('/', [StockMagasinController::class, 'index']);
        Route::post('/', [StockMagasinController::class, 'store']);
        Route::get('/{id}', [StockMagasinController::class, 'show']);
        Route::put('/{id}', [StockMagasinController::class, 'update']);
        Route::delete('/{id}', [StockMagasinController::class, 'destroy']);
    });
    
    // Transfer management
    Route::prefix('transferts')->group(function () {
        Route::get('/', [TransfertController::class, 'index']);
        Route::post('/', [TransfertController::class, 'store']);
        Route::get('/{id}', [TransfertController::class, 'show']);
        Route::put('/{id}', [TransfertController::class, 'update']);
        Route::delete('/{id}', [TransfertController::class, 'destroy']);
    });
});