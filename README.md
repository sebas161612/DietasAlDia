# Dietas al Día — Asignación de Tratamiento Nutricional

**Dietas al Día** es una aplicación web clínica especializada en el soporte para la toma de decisiones nutricionales en entornos hospitalarios y ambulatorios. Su flujo principal de valor implementa el **EPIC 28 — “Asignación tratamiento nutricional”**, brindando a los profesionales médicos una herramienta ágil, confiable y con seguridad cruzada para prescribir planes dietéticos terapéuticos adaptados a la patología y restricciones de cada paciente.

---

## 🌐 Despliegue en GitHub Pages

La aplicación está configurada para su despliegue automatizado mediante **GitHub Actions**:

- **URL de la aplicación en GitHub Pages:** [https://sebas161612.github.io/DietasAlDia/](https://sebas161612.github.io/DietasAlDia/)
- **Repositorio:** [https://github.com/sebas161612/DietasAlDia](https://github.com/sebas161612/DietasAlDia)
- **Automatización (CI/CD):** `.github/workflows/deploy.yml` compila y publica automáticamente la carpeta `dist` en GitHub Pages en cada push a la rama `main`.

---

## 🎯 Propósito y Capacidades del Sistema

La plataforma permite al médico y al equipo de nutrición clínica:
1. **Consultar pacientes:** Directorio clínico con búsqueda en tiempo real por nombre, número de historia clínica (HC), sala o cama.
2. **Consultar su información clínica integral:** Antropometría (peso, talla, cálculo automatizado de IMC y clasificación nutricional según la OMS), signos vitales y datos basales.
3. **Visualizar enfermedades y requerimientos nutricionales:** Diagnósticos activos codificados (CIE-10), tratamientos en curso y metas calórico-nutricionales prescritas.
4. **Consultar las dietas asociadas a una enfermedad:** Filtrado automático inmediato de planes nutricionales indicados según la patología activa del paciente.
5. **Realizar automáticamente el cruce de seguridad:** Evaluación instantánea entre los alimentos que componen cada dieta y el perfil de alergias, intolerancias y restricciones del paciente.
6. **Identificar dietas compatibles e incompatibles:** Clasificación visual inequívoca con badges de seguridad clínica y cálculo de índice de compatibilidad (*compatibility score*).
7. **Visualizar exactamente qué alimento genera una incompatibilidad:** Desglose del alimento específico causante, la etiqueta alergénica coincidente, el antecedente clínico del paciente y la justificación médica.
8. **Consultar la ficha técnica completa de una dieta:** Composición cualitativa y cuantitativa, macronutrientes, micronutrientes, indicaciones, precauciones y contraindicaciones sin perder el contexto del paciente seleccionado.
9. **Seleccionar y asignar una dieta segura:** Interfaz de confirmación de prescripción con definición de vía de administración, duración, indicaciones clínicas y advertencias de seguridad.
10. **Registrar el tratamiento nutricional:** Incorporación inmediata de la prescripción a la historia clínica del paciente.
11. **Consultar tratamientos asociados al paciente:** Historial consolidado de tratamientos dietéticos prescritos con fechas, duración y vía.
12. **Generar informe clínico para impresión o guardado como PDF:** Documento clínico institucional formateado mediante `@media print`, listo para exportar a PDF o imprimir físicamente en un solo clic.

---

## 🔬 EPIC 28 — Asignación tratamiento nutricional

### Flujo Clínico de Seguridad
El motor de evaluación clínica sigue una secuencia estricta y determinista:

$$\text{Paciente} \longrightarrow \text{Enfermedad Activa} \longrightarrow \text{Dietas Asociadas} \longrightarrow \text{Alimentos de la Dieta (foodIds)} \longrightarrow \text{AllergenTags} \longrightarrow \text{Alergias / Restricciones} \longrightarrow \text{Análisis de Compatibilidad}$$

### Principios Fundamentales del Motor Clínico:
- **Cruce determinista basado en alimentos reales:** Los conflictos de incompatibilidad (`IncompatibilityConflict`) se originan única y exclusivamente a partir de los alimentos estructurados (`diet.foodIds` / `diet.foods`) y sus etiquetas alergénicas registradas (`allergenTags`).
- **Sin falsos alimentos por texto libre:** Las contraindicaciones técnicas (`diet.contraindications`) y las precauciones clínicas (`diet.clinicalPrecaution`) se preservan como información médica de consulta y advertencia profesional, pero **no** se convierten artificialmente en alimentos incompatibles.
- **Sin inferencias sobre alimentos neutros:** Un alimento estructurado sin etiquetas de alérgenos (por ejemplo, el arroz en una dieta para celiaquía) no genera conflictos artificiales por el mero hecho de que la ficha técnica mencione la palabra "gluten" en su texto descriptivo.

---

## 📋 Criterios de Aceptación (EPIC 28)

- **CA1: Consulta automática de dietas asociadas a la enfermedad del paciente:**
  Al seleccionar un paciente con un diagnóstico activo registrado, el sistema despliega de inmediato en un único paso el catálogo de dietas clínicamente vinculadas a su patología (por ejemplo, diabetes mellitus tipo 2, enfermedad celíaca, hipertensión arterial, etc.).
- **CA2: Identificación explícita de alimentos incompatibles antes de la asignación:**
  Si una dieta incluye un alimento en conflicto con una alergia o restricción documentada del paciente, el sistema lo señala de forma destacada e inequívoca antes de permitir cualquier confirmación. El conflicto detalla:
  - Nombre del alimento real causante.
  - Alergia o restricción del paciente que vulnera.
  - Etiqueta alergénica coincidente (*matchedTag*).
  - Explicación fisiopatológica del riesgo.
- **CA3: Acceso a la ficha técnica completa manteniendo el contexto del paciente:**
  El profesional médico puede abrir la ficha técnica detallada de cualquier dieta (ingredientes, aporte calórico, macronutrientes, contraindicaciones, precauciones y bibliografía) mediante un panel modal superpuesto sin perder la barra de contexto superior con los datos clínicos del paciente.
- **CA4: Identificación y selección rápida de dietas seguras:**
  La interfaz provee filtros rápidos para alternar entre *"Todas"*, *"Solo Compatibles"* y *"Con Incompatibilidades"*, además de ordenar por puntuación de seguridad. La acción de prescribir resalta las opciones seguras y restringe o alerta con severidad ante asignaciones con incompatibilidades.

---

## 🚀 Funcionalidades Principales Disponibles

- **Panel de Mando (Dashboard):** Vista general con métricas de pacientes ingresados, tratamientos activos, distribución de dietas y alertas de seguridad nutricional.
- **Directorio de Pacientes:** Búsqueda en tiempo real por nombre, historia clínica, diagnóstico y ubicación hospitalaria.
- **Ficha Clínica del Paciente (Historial):** Datos antropométricos, signos vitales basales, requerimientos calóricos/nutricionales, diagnósticos activos, alergias con grado de severidad y registro histórico de prescripciones.
- **Catálogo de Dietas Terapéuticas:** Listado integral de planes nutricionales clínicos con fichas técnicas descargables e inspeccionables.
- **Motor de Cruce y Detección de Incompatibilidades:** Algoritmo clínico en tiempo real con explicación causal de cada alerta.
- **Modal de Asignación y Prescripción:** Registro formal de vía (oral, asistida, enteral, parenteral), duración del tratamiento e indicaciones complementarias.
- **Generador de Informe Clínico Oficial (PDF / Impresión):** Documento formal con membrete hospitalario, identificación, diagnóstico CIE-10, requerimientos basales, tabla de alergias y tratamientos prescritos con espacio para firma médica.
- **Soporte PWA y Modo Offline:** Instalable como aplicación web progresiva y dotada de almacenamiento local para contingencias de conectividad.

---

## 🏗️ Datos y Arquitectura Tecnológica

La aplicación está diseñada bajo el patrón de arquitectura desacoplada y componentización modular en React:

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) para un tipado clínico robusto y libre de errores en tiempo de ejecución.
- **Bundler & Build Tool:** [Vite 8](https://vite.dev/) para compilaciones ultra rápidas y generación optimizada de bundles de producción.
- **Estilos y Sistema de Diseño:** [Tailwind CSS v4](https://tailwindcss.com/) para una interfaz médica moderna, limpia, accesible y de alto contraste.
- **Iconografía:** [Lucide React](https://lucide.dev/) para símbolos clínicos e indicadores de estado estándar.
- **Animaciones e Interacción:** [Motion](https://motion.dev/) para transiciones suaves entre vistas y apertura de paneles modales.
- **Gestión de Estado y Datos:** Estado reactivo en memoria y local con catálogo clínico estandarizado (`mockData.ts`) que modela pacientes reales, enfermedades CIE-10, requerimientos calóricos, alergias con severidad, alimentos con etiquetas alergénicas y dietas terapéuticas estructuradas.

---

## 💻 Instrucciones para Ejecución Local

Para clonar y ejecutar este proyecto en su entorno de desarrollo local:

1. **Instalación de Dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación se iniciará de inmediato en `http://localhost:3000`.

3. **Compilación para Producción:**
   ```bash
   npm run build
   ```

4. **Verificación de Tipos (Linter):**
   ```bash
   npm run lint
   ```

---

## 📄 Licencia y Propósito Académico
Proyecto desarrollado para fines académicos y de demostración tecnológica en ingeniería de software para el área de la salud. Todas las marcas, códigos CIE-10 y datos de pacientes simulados son utilizados con fines exclusivamente didácticos y de verificación de requerimientos funcionales.
