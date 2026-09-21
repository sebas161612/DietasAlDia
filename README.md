# Dietas al Día — Asignación de Tratamiento Nutricional

> **🌐 Acceso al Prototipo en Vivo:**  
> 👉 [https://dietas-al-dia-tau.vercel.app/](https://dietas-al-dia-tau.vercel.app/)

---

## 📌 ¿De qué se trata este prototipo?

**Dietas al Día** es un prototipo interactivo de aplicación web clínica diseñado para asistir a médicos, nutricionistas y personal hospitalario en la toma de decisiones nutricionales seguras. 

Su flujo principal de valor implementa el **EPIC 28 — “Asignación tratamiento nutricional”**, cuyo objetivo es evitar eventos adversos derivados de la alimentación en pacientes hospitalizados. El sistema permite:

1. **Seleccionar un paciente** y consultar de inmediato sus diagnósticos activos (CIE-10), datos antropométricos (IMC) y antecedentes de alergias o intolerancias.
2. **Consultar automáticamente las dietas** asociadas a su enfermedad.
3. **Ejecutar un cruce de seguridad en tiempo real:** el motor clínico evalúa los ingredientes de cada dieta frente a las restricciones del paciente, señalando con precisión qué alimento causa conflicto y por qué.
4. **Prescribir el tratamiento dietético:** confirmar la asignación con vía de administración, duración y notas médicas, registrándolo en la historia clínica.
5. **Generar un informe clínico institucional:** listo para imprimir o guardar en formato PDF con firma médica.

---

## 🎯 Capacidades del Sistema

- **Directorio de Pacientes:** Búsqueda en tiempo real por nombre, historia clínica (HC), sala o cama.
- **Ficha Clínica Integral:** Visualización de peso, talla, IMC clasificado (OMS), signos vitales y requerimientos calóricos.
- **Catálogo de Dietas Terapéuticas:** Fichas técnicas completas con composición cualitativa/cuantitativa, macronutrientes, indicaciones, precauciones y contraindicaciones sin perder de vista los datos del paciente.
- **Motor Clínico de Compatibilidad:** Cálculo de índice de compatibilidad (*compatibility score*) y desglose específico del alimento conflictivo (`foodId`), etiqueta alergénica coincidente y justificación médica.
- **Prescripción y Registro:** Configuración de vía (oral, asistida, enteral, parenteral) y duración del tratamiento con actualización inmediata en el historial.
- **Exportación e Impresión:** Generador de informe formal formateado mediante `@media print` para exportación a PDF en un clic.
- **PWA & Offline:** Soporte para instalación como aplicación web progresiva y navegación continua.

---

## 🔬 EPIC 28 — Asignación tratamiento nutricional

### Flujo Clínico de Seguridad
El motor de evaluación clínica sigue una secuencia estricta y determinista:

$$\text{Paciente} \longrightarrow \text{Enfermedad Activa} \longrightarrow \text{Dietas Asociadas} \longrightarrow \text{Alimentos de la Dieta (foodIds)} \longrightarrow \text{AllergenTags} \longrightarrow \text{Alergias / Restricciones} \longrightarrow \text{Análisis de Compatibilidad}$$

### Principios Fundamentales del Motor Clínico:
- **Cruce determinista basado en alimentos reales:** Los conflictos de incompatibilidad (`IncompatibilityConflict`) se originan única y exclusivamente a partir de los alimentos estructurados (`diet.foodIds` / `diet.foods`) y sus etiquetas alergénicas registradas (`allergenTags`).
- **Sin falsos alimentos por texto libre:** Las contraindicaciones técnicas (`diet.contraindications`) y las precauciones clínicas (`diet.clinicalPrecaution`) se preservan como información médica de consulta y advertencia profesional, pero **no** se convierten artificialmente en alimentos incompatibles.
- **Sin inferencias sobre alimentos neutros:** Un alimento estructurado sin etiquetas de alérgenos no genera conflictos artificiales por el mero hecho de que la ficha técnica mencione palabras clave en su texto descriptivo.

---

## 📋 Criterios de Aceptación (EPIC 28)

- **CA1: Consulta automática de dietas asociadas a la enfermedad del paciente:**  
  Al seleccionar un paciente con un diagnóstico activo registrado, el sistema despliega de inmediato las dietas clínicamente vinculadas a su patología (diabetes mellitus tipo 2, enfermedad celíaca, hipertensión arterial, insuficiencia renal, etc.).
- **CA2: Identificación explícita de alimentos incompatibles antes de la asignación:**  
  Si una dieta contiene un alimento en conflicto con una alergia o restricción documentada del paciente, el sistema detalla:
  - Nombre del alimento específico causante.
  - Alergia o restricción del paciente que vulnera.
  - Etiqueta alergénica coincidente (*matchedTag*).
  - Explicación fisiopatológica del riesgo.
- **CA3: Acceso a la ficha técnica completa manteniendo el contexto del paciente:**  
  El profesional médico puede abrir la ficha técnica detallada de cualquier dieta mediante un panel modal superpuesto sin perder la barra de contexto superior con los datos clínicos del paciente.
- **CA4: Identificación y selección rápida de dietas seguras:**  
  La interfaz provee filtros rápidos para alternar entre *"Todas"*, *"Solo Compatibles"* y *"Con Incompatibilidades"*, además de ordenar por puntuación de seguridad y alertar severamente ante asignaciones riesgosas.

---

## 🏗️ Arquitectura Tecnológica

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) para tipado clínico estricto y componentes modulares.
- **Build Tool:** [Vite 8](https://vite.dev/) con configuración optimizada para producción.
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) para una interfaz clínica accesible y de alto contraste.
- **Iconografía:** [Lucide React](https://lucide.dev/).
- **Animaciones:** [Motion](https://motion.dev/).
- **PWA:** [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) con Service Worker y soporte offline.
- **Despliegue:** Alojado en [Vercel](https://vercel.com/) en [https://dietas-al-dia-tau.vercel.app/](https://dietas-al-dia-tau.vercel.app/).

---

## 📄 Licencia y Propósito Académico
Proyecto desarrollado para fines académicos y de demostración tecnológica en ingeniería de software para el área de la salud. Todas las marcas, códigos CIE-10 y datos de pacientes simulados son utilizados con fines exclusivamente didácticos y de verificación de requerimientos funcionales.
