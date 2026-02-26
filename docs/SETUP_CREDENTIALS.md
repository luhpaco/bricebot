# Obtener Credenciales de Google Cloud

## Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Inicia sesión con tu cuenta de Google

## Paso 2: Seleccionar el Proyecto

1. En la parte superior, haz clic en el selector de proyectos
2. Selecciona el proyecto donde creaste tu agente de Dialogflow ES
3. Si no recuerdas el nombre, busca el proyecto con el nombre similar a tu agente

## Paso 3: Crear Service Account

1. En el menú lateral, navega a: **IAM y administración > Cuentas de servicio**
2. Haz clic en **+ CREAR CUENTA DE SERVICIO**
3. Completa los datos:
   - **Nombre**: `chatbot-fulfillment`
   - **ID**: (se genera automáticamente)
   - **Descripción**: Cuenta de servicio para el webhook del chatbot CBRICENHO
4. Haz clic en **CREAR Y CONTINUAR**

## Paso 4: Asignar Roles

En la sección "Otorgar a esta cuenta de servicio acceso al proyecto":

1. Busca y selecciona el rol: **Dialogflow API Client**
2. Haz clic en **CONTINUAR**
3. Haz clic en **LISTO**

## Paso 5: Generar la Clave JSON

1. En la lista de cuentas de servicio, busca la que acabas de crear
2. Haz clic en los tres puntos (⋮) al final de la fila
3. Selecciona **Administrar claves**
4. Haz clic en **AGREGAR CLAVE > Crear clave nueva**
5. Selecciona formato **JSON**
6. Haz clic en **CREAR**
7. Se descargará automáticamente un archivo JSON

## Paso 6: Colocar el Archivo en el Proyecto

1. Renombra el archivo descargado a: `service-account.json`
2. Mueve el archivo a la raíz del proyecto: `f:\folder-luispazcode\lupaco-grado-unp\tesis\bricebot\service-account.json`

## IMPORTANTE - Seguridad

- **NUNCA** compartas este archivo
- **NUNCA** lo subas a Git (ya está en .gitignore)
- Si lo pierdes, puedes generar una nueva clave desde la consola
- Si crees que fue comprometido, elimina la clave desde la consola y genera una nueva

## Verificar el Archivo

El contenido del archivo debe tener esta estructura:

```json
{
	"type": "service_account",
	"project_id": "tu-project-id",
	"private_key_id": "...",
	"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
	"client_email": "chatbot-fulfillment@tu-project-id.iam.gserviceaccount.com",
	"client_id": "...",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "..."
}
```

## Siguiente Paso

Una vez tengas el archivo `service-account.json` en la raíz del proyecto, actualiza el archivo `.env` con el `project_id` correcto.
