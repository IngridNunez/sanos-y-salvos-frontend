# React + Vite

## Panel de administración

El panel está disponible en `/admin` para cuentas del grupo de Cognito
`Administradores`. Desde allí se revisan los reportes pendientes, se aprueban
para publicarlos, se rechazan (quedan guardados y ocultos) o se eliminan
definitivamente. El backend vuelve a validar el grupo en cada operación; ocultar
la ruta en la interfaz no es la protección de acceso.

Los reportes nuevos no aparecen en la búsqueda pública ni se pueden contactar
hasta que un administrador los apruebe. Los reportes históricos, creados antes
del flujo de moderación, se conservan como aprobados.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
