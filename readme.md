# 🏋️ Trainify API

Sistema backend para una **aplicación de seguimiento de entrenamientos**, donde los usuarios pueden registrarse, iniciar sesión, crear planes de entrenamiento y monitorear su progreso a lo largo del tiempo.

El proyecto está orientado a simular un **caso real de backend profesional**, aplicando buenas prácticas de arquitectura, seguridad y documentación.

---

## 🚀 Funcionalidades principales

### 🔐 Autenticación y autorización

* Registro de usuarios
* Inicio y cierre de sesión
* Autenticación mediante **JWT**
* Acceso restringido a recursos propios del usuario

---

### 🏃 Gestión de entrenamientos

* Crear planes de entrenamiento personalizados
* Actualizar entrenamientos y agregar comentarios
* Eliminar entrenamientos
* Programar entrenamientos por fecha y hora
* Listar entrenamientos activos o pendientes
* Generar informes de entrenamientos y progreso previo

---

### 🏋️ Datos de ejercicios

* Base de datos precargada (seed) con ejercicios
* Cada ejercicio incluye:

  * Nombre
  * Descripción
  * Categoría (cardio, fuerza, flexibilidad)
  * Grupo muscular (pecho, espalda, piernas, etc.)
* Los ejercicios se utilizan para construir planes de entrenamiento

---

## 🧱 Arquitectura y stack

* **API:** RESTful
* **Base de datos:** Relacional (ej. PostgreSQL / MySQL)
* **Autenticación:** JSON Web Tokens (JWT)
* **Seguridad:** Headers de seguridad y control de acceso
* **Testing:** Pruebas unitarias
* **Documentación:** OpenAPI / Swagger

> El lenguaje, framework y base de datos pueden adaptarse según la implementación elegida.

---

## 🗄️ Esquema de base de datos (alto nivel)

* **Users**
* **Exercises**
* **Workouts**
* **WorkoutExercises**
* **WorkoutSchedules**
* **WorkoutReports**

---

## 📡 Endpoints principales (ejemplo)

### Auth

* `POST /auth/register`
* `POST /auth/login`

### Exercises

* `GET /exercises`

### Workouts

* `POST /workouts`
* `GET /workouts`
* `PUT /workouts/:id`
* `DELETE /workouts/:id`

### Reports

* `GET /reports/progress`

---

## 🧪 Testing

* Pruebas unitarias para:

  * Autenticación
  * Operaciones CRUD
  * Validaciones
  * Seguridad y permisos

---

## 📘 Documentación

* API documentada con **OpenAPI (Swagger)**
* Ejemplos de requests y responses
* Autenticación documentada paso a paso

---

## 🎯 Objetivo del proyecto

Este proyecto sirve para practicar y demostrar:

* Diseño de APIs RESTful
* Modelado de bases de datos relacionales
* Autenticación y autorización segura
* Testing backend
* Documentación profesional de APIs

---

## 🧑‍💻 Autor

**Vitt**
Backend Developer | Web & Systems

---

💡 *Feel free to fork, extend or adapt this project to your own needs.*
