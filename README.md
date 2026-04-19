# 📦 GestiStock - Sistema de Gestión de Inventario

Sistema moderno de gestión de inventario y productos desarrollado con React.js y TailwindCSS. Permite administrar productos, controlar stock, gestionar precios y mantener un registro completo de tu catálogo.

---

## ✨ Características

- 📱 **Diseño Responsive** - Interfaz adaptable a todos los dispositivos  
- 🔍 **Búsqueda en Tiempo Real** - Filtra productos por nombre o SKU  
- 🏷️ **Filtrado por Categorías** - Organiza y encuentra productos rápidamente  
- 📄 **Paginación** - Navegación eficiente en listados extensos  
- ✏️ **CRUD Completo** - Crear, leer, actualizar y eliminar productos  
- 💰 **Control de Precios** - Gestión de precios de compra y venta  
- 📊 **Alertas de Stock** - Visualización de productos con stock bajo  
- 🎨 **UI Moderna** - Diseño limpio con animaciones suaves  

---

## 🚀 Cómo Ejecutar el Proyecto

### 🔧 Backend
```bash
cd backend
npm run dev
```

### 🔧 Frontend
```bash
cd frontend
npm start
```

🌐 Acceso a la Aplicación
La aplicación estará disponible en:
http://localhost:3000



Para llevarlo de PC a PC:
### 1. Instalar Node.js
Descargar e instalar Node.js desde https://nodejs.org/ (versión 18 o superior)

### 2. Abrir terminal en la carpeta del proyecto

### 3. Instalar dependencias del backend
```bash
cd backend
npm install
npm run dev
```

### 3. Instalar dependencias del Frontend
```bash
cd frontend
npm install
npm start
```


---

## Usar docker en cualquier PC
```bash
# 1. Clonar el repo
git clone tu-repo

# 2. Crear su propio .env basado en el ejemplo
cp .env.example .env
# (editar .env con sus credenciales)

# 3. Levantar todo
docker compose up -d

# 4. Ver logs
docker compose logs -f

# 5. Bajar todo (sin borrar datos)
docker compose down

# 6. Bajar todo Y borrar la base de datos
docker compose down -v
```