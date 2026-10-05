import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChefHat,
  FileCheck,
  Info,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import {
  CompatibilityAnalysis,
  Diet,
  Food,
  IncompatibilityConflict,
  Patient,
} from '../types';
import {
  checkFoodConflict,
  evaluateSingleDiet,
  getFoodById,
} from '../services/clinicalEngine';
import { foodsData } from '../data/mockData';

interface ModifyDietModalProps {
  diet: Diet;
  patient: Patient;
  initialConflicts: IncompatibilityConflict[];
  onClose: () => void;
  onSaveAdaptedDiet: (adaptedDiet: Diet) => void;
  onPrescribeDirectly?: (adaptedDiet: Diet) => void;
  onResetToOriginal?: (originalDietId: string) => void;
}

export const ModifyDietModal: React.FC<ModifyDietModalProps> = ({
  diet,
  patient,
  initialConflicts,
  onClose,
  onSaveAdaptedDiet,
  onPrescribeDirectly,
  onResetToOriginal,
}) => {
  // Conflicting food IDs based on initial conflicts
  const initialConflictingFoodIds = useMemo(() => {
    return Array.from(new Set(initialConflicts.map((c) => c.foodId)));
  }, [initialConflicts]);

  // Working state of the diet being adapted
  const [dietName, setDietName] = useState<string>(
    diet.isAdapted
      ? diet.name
      : `${diet.name} (Adaptada)`
  );

  // Set of food IDs that are excluded
  const [excludedFoodIds, setExcludedFoodIds] = useState<Set<string>>(() => {
    if (diet.excludedFoods && diet.excludedFoods.length > 0) {
      return new Set(diet.excludedFoods.map((ef) => ef.foodId));
    }
    // By default, initially exclude nothing until user decides or clicks auto-resolve
    return new Set<string>();
  });

  // Map of substitutions: originalFoodId -> replacement description or safe food name
  const [substitutions, setSubstitutions] = useState<
    Record<string, { replacementName: string; notes?: string }>
  >(() => {
    const map: Record<string, { replacementName: string; notes?: string }> = {};
    if (diet.substitutedFoods) {
      diet.substitutedFoods.forEach((s) => {
        map[s.originalFoodId] = {
          replacementName: s.replacementFoodName,
          notes: s.notes,
        };
      });
    }
    return map;
  });

  // Currently open substitute editor for a foodId
  const [substituteEditingId, setSubstituteEditingId] = useState<string | null>(null);
  const [tempSubName, setTempSubName] = useState('');
  const [tempSubNotes, setTempSubNotes] = useState('');

  // Added extra safe foods
  const [extraFoodIds, setExtraFoodIds] = useState<string[]>([]);
  const [selectedExtraFoodId, setSelectedExtraFoodId] = useState<string>('');

  // Clinical adaptation notes
  const [adaptationNotes, setAdaptationNotes] = useState<string>(
    diet.adaptationNotes ||
      `Adaptación dietoterapéutica: eliminación de ingredientes alérgenos e incompatibles para el paciente ${patient.fullName}. Preparación en cocina clínica bajo norma de no contaminación cruzada.`
  );

  // Safe foods from catalog that have 0 conflicts with this patient
  const safeCatalogFoods = useMemo(() => {
    return foodsData.filter((f) => {
      // Must not be in original diet
      if (diet.foodIds.includes(f.id)) return false;
      // Must not conflict with patient
      const conflicts = checkFoodConflict(f, patient);
      return conflicts.length === 0;
    });
  }, [diet.foodIds, patient]);

  // Construct working diet object in real-time
  const workingDiet = useMemo<Diet>(() => {
    // Effective active food IDs: original food IDs minus excluded, plus extra foods
    const activeOriginalFoodIds = diet.foodIds.filter((fId) => !excludedFoodIds.has(fId));
    const allActiveFoodIds = Array.from(new Set([...activeOriginalFoodIds, ...extraFoodIds]));

    const excludedFoodsArray = Array.from(excludedFoodIds).map((id) => {
      const foodObj = getFoodById(id);
      const conflict = initialConflicts.find((c) => c.foodId === id);
      return {
        foodId: id,
        foodName: foodObj?.name || id,
        reason: conflict
          ? `Conflicto con ${conflict.patientRestriction}`
          : 'Exclusión clínica preventiva',
      };
    });

    const substitutedFoodsArray = Object.entries(substitutions).map(([origId, sub]) => {
      const foodObj = getFoodById(origId);
      return {
        originalFoodId: origId,
        originalFoodName: foodObj?.name || origId,
        replacementFoodName: sub.replacementName,
        notes: sub.notes,
      };
    });

    return {
      ...diet,
      id: diet.isAdapted ? diet.id : `adapted-${diet.id}-${patient.id}`,
      name: dietName,
      originalDietId: diet.originalDietId || diet.id,
      originalDietName: diet.originalDietName || diet.name,
      foodIds: allActiveFoodIds,
      foods: allActiveFoodIds.map((id) => {
        const orig = diet.foods.find((f) => f.foodId === id);
        return orig || { foodId: id, portion: '1 porción estándar', notes: 'Alimento seguro complementario' };
      }),
      isAdapted: true,
      adaptationNotes,
      excludedFoods: excludedFoodsArray,
      substitutedFoods: substitutedFoodsArray,
    };
  }, [
    diet,
    dietName,
    excludedFoodIds,
    extraFoodIds,
    substitutions,
    adaptationNotes,
    patient.id,
    initialConflicts,
  ]);

  // Real-time clinical evaluation
  const liveAnalysis: CompatibilityAnalysis = useMemo(() => {
    return evaluateSingleDiet(workingDiet, patient);
  }, [workingDiet, patient]);

  const isResolved = liveAnalysis.status === 'COMPATIBLE';

  // Quick action: auto-resolve all conflicts by excluding all conflicting items
  const handleAutoResolve = () => {
    const newExcluded = new Set(excludedFoodIds);
    initialConflictingFoodIds.forEach((id) => newExcluded.add(id));
    setExcludedFoodIds(newExcluded);

    // Auto-update adaptation notes
    const conflictNames = initialConflicts.map((c) => c.foodName).join(', ');
    setAdaptationNotes(
      `Dieta adaptada: Se excluyeron de forma segura los siguientes alimentos en conflicto: ${conflictNames}. Prescripción libre de alérgenos evaluada.`
    );
  };

  const handleToggleExcludeFood = (foodId: string) => {
    const next = new Set(excludedFoodIds);
    if (next.has(foodId)) {
      next.delete(foodId);
    } else {
      next.add(foodId);
    }
    setExcludedFoodIds(next);
  };

  const handleSaveSubstitution = (originalFoodId: string) => {
    if (!tempSubName.trim()) return;
    setSubstitutions((prev) => ({
      ...prev,
      [originalFoodId]: {
        replacementName: tempSubName.trim(),
        notes: tempSubNotes.trim() || undefined,
      },
    }));
    // When substituting, also ensure the original food is marked as excluded from preparation
    const next = new Set(excludedFoodIds);
    next.add(originalFoodId);
    setExcludedFoodIds(next);

    setSubstituteEditingId(null);
    setTempSubName('');
    setTempSubNotes('');
  };

  const handleRemoveSubstitution = (originalFoodId: string) => {
    setSubstitutions((prev) => {
      const copy = { ...prev };
      delete copy[originalFoodId];
      return copy;
    });
  };

  const handleAddExtraFood = () => {
    if (!selectedExtraFoodId) return;
    if (!extraFoodIds.includes(selectedExtraFoodId)) {
      setExtraFoodIds((prev) => [...prev, selectedExtraFoodId]);
    }
    setSelectedExtraFoodId('');
  };

  const handleRemoveExtraFood = (foodId: string) => {
    setExtraFoodIds((prev) => prev.filter((id) => id !== foodId));
  };

  const handleSave = () => {
    onSaveAdaptedDiet(workingDiet);
    onClose();
  };

  const handlePrescribeDirectly = () => {
    onSaveAdaptedDiet(workingDiet);
    if (onPrescribeDirectly) {
      onPrescribeDirectly(workingDiet);
    }
  };

  const handleReset = () => {
    if (onResetToOriginal) {
      onResetToOriginal(diet.originalDietId || diet.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-teal-400" />
                  Adaptación Dietoterapéutica (EPIC 28)
                </span>
                {diet.isAdapted && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                    Modificación previa activa
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-white mt-1">
                Modificar y Adaptar Dieta al Paciente
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Excluya o sustituya ingredientes incompatibles para transformar esta dieta en una opción 100% segura.
              </p>
            </div>

            <button
              id="btn-close-modify-diet-modal"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Patient context badge */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-300">Paciente:</span>
              <strong className="text-white font-bold">{patient.fullName}</strong>
              <span className="text-slate-400 font-mono">({patient.medicalRecordNumber})</span>
            </div>

            {/* Patient restrictions reminders */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {patient.allergies.map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60"
                >
                  {a.name} ({a.severity})
                </span>
              ))}
              {patient.foodRestrictions.map((r) => (
                <span
                  key={r.id}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Real-time Dynamic Compatibility Bar */}
          <div
            className={`p-4 rounded-2xl border-2 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isResolved
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-amber-50 border-amber-400 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {isResolved ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      isResolved
                        ? 'bg-emerald-200 text-emerald-950'
                        : 'bg-amber-200 text-amber-950'
                    }`}
                  >
                    {isResolved
                      ? '✓ Dieta Adaptada 100% Segura'
                      : `⚠ Incompatibilidad Activa (${liveAnalysis.conflicts.length} conflicto${
                          liveAnalysis.conflicts.length > 1 ? 's' : ''
                        })`}
                  </span>
                  <span className="text-xs font-bold font-mono">
                    Score: {liveAnalysis.compatibilityScore}%
                  </span>
                </div>
                <p className="text-xs mt-1 font-medium">
                  {isResolved
                    ? '¡Excelente! Todos los ingredientes conflictivos han sido excluidos o reemplazados. Esta prescripción no generará reacciones adversas.'
                    : `Se requiere excluir o sustituir: ${liveAnalysis.conflicts
                        .map((c) => c.foodName)
                        .join(', ')}`}
                </p>
              </div>
            </div>

            {/* Quick Auto-Resolve Button */}
            {!isResolved && (
              <button
                type="button"
                id="btn-auto-resolve-conflicts"
                onClick={handleAutoResolve}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 shadow-2xs transition shrink-0 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                <span>Excluir todos los alérgenos en 1 clic</span>
              </button>
            )}
          </div>

          {/* Diet Identification Customization */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nombre de la Dieta Adaptada
            </label>
            <input
              type="text"
              value={dietName}
              onChange={(e) => setDietName(e.target.value)}
              className="w-full text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nombre para la prescripción adaptada..."
            />
          </div>

          {/* Foods Composition and Conflict Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-teal-700" />
                  Composición de Alimentos y Exclusiones
                </h3>
                <p className="text-xs text-slate-500">
                  Gestione cada alimento de la dieta original ({diet.foodIds.length} ingredientes base).
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {diet.foodIds.length - excludedFoodIds.size} incluidos • {excludedFoodIds.size} excluidos
              </span>
            </div>

            {/* Food Items List */}
            <div className="space-y-2.5">
              {diet.foods.map((foodItem) => {
                const foodObj = getFoodById(foodItem.foodId);
                if (!foodObj) return null;

                const isConflicting = initialConflictingFoodIds.includes(foodObj.id);
                const conflict = initialConflicts.find((c) => c.foodId === foodObj.id);
                const isExcluded = excludedFoodIds.has(foodObj.id);
                const substitution = substitutions[foodObj.id];

                return (
                  <div
                    key={foodObj.id}
                    className={`rounded-2xl border p-3.5 transition ${
                      isExcluded
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : isConflicting
                        ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Food details */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-sm font-bold ${
                              isExcluded
                                ? 'text-slate-500 line-through'
                                : isConflicting
                                ? 'text-rose-950 font-extrabold'
                                : 'text-slate-900'
                            }`}
                          >
                            {foodObj.name}
                          </h4>

                          {/* Conflict Badge */}
                          {isConflicting && (
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                isExcluded
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              }`}
                            >
                              {isExcluded
                                ? '✓ Conflicto Resuelto (Excluido)'
                                : `⚠ Conflicto Alergénico (${conflict?.matchedTag || 'Alérgeno'})`}
                            </span>
                          )}

                          {/* Substitution badge */}
                          {substitution && (
                            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                              Sustituido por: {substitution.replacementName}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500">
                          {foodItem.portion} • {foodObj.origin} • {foodObj.mainFunction}
                        </p>

                        {/* Conflict Explanation if active and not excluded */}
                        {isConflicting && !isExcluded && conflict && (
                          <div className="text-[11px] font-semibold text-rose-800 bg-rose-100/70 p-2 rounded-lg border border-rose-200 mt-1">
                            {conflict.clinicalExplanation}
                          </div>
                        )}

                        {/* Substitution notes display */}
                        {substitution?.notes && (
                          <p className="text-[11px] text-teal-700 italic">
                            Nota de sustitución: {substitution.notes}
                          </p>
                        )}
                      </div>

                      {/* Action buttons for this food */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Exclude / Include Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleExcludeFood(foodObj.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isExcluded
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                              : isConflicting
                              ? 'bg-rose-700 text-white hover:bg-rose-800 shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isExcluded ? (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>Restaurar ingrediente</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Excluir de la dieta</span>
                            </>
                          )}
                        </button>

                        {/* Substitute button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (substituteEditingId === foodObj.id) {
                              setSubstituteEditingId(null);
                            } else {
                              setSubstituteEditingId(foodObj.id);
                              setTempSubName(substitution?.replacementName || '');
                              setTempSubNotes(substitution?.notes || '');
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
                            substitution
                              ? 'bg-teal-50 border-teal-300 text-teal-800'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Wrench className="w-3 h-3 text-teal-600" />
                          <span>{substitution ? 'Modificar sustituto' : 'Sustituir'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Substitute Editor */}
                    {substituteEditingId === foodObj.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3 rounded-xl space-y-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-600" />
                            Sustituir "{foodObj.name}" por alternativa segura:
                          </span>
                          <button
                            type="button"
                            onClick={() => setSubstituteEditingId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick suggestions based on allergen */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          <span className="text-slate-500 font-medium">Sugerencias seguras:</span>
                          <button
                            type="button"
                            onClick={() => setTempSubName('Semillas de calabaza / chía toleradas')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold"
                          >
                            Semillas de calabaza
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempSubName('Bebida vegetal de arroz/avena sin gluten')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold"
                          >
                            Bebida vegetal segura
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempSubName('Pechuga de pollo magra al vapor')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold"
                          >
                            Pollo magro al vapor
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempSubName('Arroz blanco vaporizado')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold"
                          >
                            Arroz blanco
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={tempSubName}
                            onChange={(e) => setTempSubName(e.target.value)}
                            placeholder="Nombre del alimento sustituto..."
                            className="text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <input
                            type="text"
                            value={tempSubNotes}
                            onChange={(e) => setTempSubNotes(e.target.value)}
                            placeholder="Indicación de cocina / porción..."
                            className="text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {substitution && (
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveSubstitution(foodObj.id);
                                setSubstituteEditingId(null);
                              }}
                              className="text-xs font-semibold text-rose-600 hover:underline mr-auto"
                            >
                              Eliminar sustitución
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSubstituteEditingId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveSubstitution(foodObj.id)}
                            disabled={!tempSubName.trim()}
                            className="px-3 py-1 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800 disabled:opacity-50"
                          >
                            Guardar sustitución
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Extra Safe Foods Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-teal-700" />
                  Agregar Alimentos Seguros del Catálogo Hospitalario
                </h4>
                <p className="text-[11px] text-slate-500">
                  Puede incorporar alimentos adicionales verificados sin alérgenos para el paciente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedExtraFoodId}
                onChange={(e) => setSelectedExtraFoodId(e.target.value)}
                className="flex-1 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Seleccione un alimento seguro para añadir...</option>
                {safeCatalogFoods.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.origin} ({f.mainFunction})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddExtraFood}
                disabled={!selectedExtraFoodId}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 transition shrink-0"
              >
                Añadir
              </button>
            </div>

            {/* List of extra foods added */}
            {extraFoodIds.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Alimentos adicionales añadidos ({extraFoodIds.length}):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {extraFoodIds.map((fId) => {
                    const foodObj = getFoodById(fId);
                    if (!foodObj) return null;
                    return (
                      <span
                        key={fId}
                        className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        <span>{foodObj.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraFood(fId)}
                          className="text-teal-700 hover:text-rose-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clinical Adaptation Notes for Kitchen and Nursing */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5 text-teal-700" />
              Instrucciones Clínicas para el Servicio de Alimentación y Enfermería
            </label>
            <textarea
              rows={3}
              value={adaptationNotes}
              onChange={(e) => setAdaptationNotes(e.target.value)}
              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              placeholder="Describa indicaciones especiales de preparación, manipulación o higiene..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {diet.isAdapted && onResetToOriginal && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-700 bg-white border border-slate-300 px-3 py-2 rounded-xl transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar dieta original</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              id="btn-cancel-modify-diet"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              id="btn-save-adapted-diet"
              onClick={handleSave}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                isResolved
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Guardar Dieta Adaptada</span>
            </button>

            {onPrescribeDirectly && (
              <button
                type="button"
                id="btn-save-and-prescribe"
                onClick={handlePrescribeDirectly}
                className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-bold hover:bg-teal-800 shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Guardar y Prescribir Directamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
