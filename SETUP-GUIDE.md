# AWS ECS Dashboard - Gu�a de Configuraci�n

## Requisitos Previos

1. **Node.js 18 o superior**
   - Descargar desde: https://nodejs.org/
   - Verificar instalaci�n: `node --version`

2. **Cuenta de AWS con credenciales**
   - Access Key ID
   - Secret Access Key

## Instalaci�n Paso a Paso (Windows)

### 1. Instalar Dependencias

```cmd
cd aws-ecs-dashboard
npm install
```

### 2. Iniciar la Aplicaci�n

**Opci�n A: Usando el script de inicio**
```cmd
start.bat
```

**Opci�n B: Comando manual**
```cmd
npm run dev
```

La aplicaci�n se abrir� autom�ticamente en `http://localhost:5173`

### 3. Configurar Credenciales AWS

1. Al abrir la aplicaci�n, ver�s un modal de configuraci�n
2. Ingresa tus credenciales:
   - **Access Key ID**: Tu clave de acceso de AWS
   - **Secret Access Key**: Tu clave secreta de AWS
   - **Region**: Selecciona la regi�n donde est�n tus recursos (ej: us-east-1)
3. Haz clic en "Save Configuration"

## Permisos IAM Necesarios

Tu usuario de AWS necesita los siguientes permisos. Crea una pol�tica con este JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:ListClusters",
        "ecs:DescribeClusters",
        "ecs:ListServices",
        "ecs:DescribeServices",
        "ecs:ListTasks",
        "ecs:DescribeTasks",
        "ecs:StopTask",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetHealth",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Crear Usuario IAM para el Dashboard

### Paso 1: Crear Pol�tica IAM

1. Ve a AWS Console � IAM � Policies
2. Haz clic en "Create Policy"
3. Selecciona la pesta�a "JSON"
4. Pega el JSON de permisos de arriba
5. Haz clic en "Next: Tags" y luego "Next: Review"
6. Nombre: `ECS-Dashboard-Policy`
7. Haz clic en "Create Policy"

### Paso 2: Crear Usuario IAM

1. Ve a IAM � Users
2. Haz clic en "Add User"
3. Nombre de usuario: `ecs-dashboard-user`
4. Tipo de acceso: Selecciona "Programmatic access"
5. Haz clic en "Next: Permissions"
6. Selecciona "Attach existing policies directly"
7. Busca y selecciona `ECS-Dashboard-Policy`
8. Haz clic en "Next: Tags" � "Next: Review" � "Create User"
9. **IMPORTANTE**: Descarga el CSV con las credenciales o c�pialas. No podr�s verlas de nuevo.

## Uso del Dashboard

### Monitorear Clusters
- En la secci�n "ECS Clusters", ver�s todos tus clusters
- Haz clic en un cluster para ver sus servicios

### Ver Servicios
- Despu�s de seleccionar un cluster, ver�s todos sus servicios
- Los servicios muestran:
  - Estado (ACTIVE, DRAINING, etc.)
  - Tareas deseadas vs tareas en ejecuci�n
  - Si est�n asociadas a un Load Balancer

### Gestionar Tareas
- Haz clic en "View Tasks" en cualquier servicio
- Ver�s todas las tareas en ejecuci�n
- Puedes reiniciar tareas con el bot�n "Restart"
- ECS iniciar� autom�ticamente una nueva tarea

### Monitorear Load Balancers
- La secci�n "Load Balancers" muestra todos los ALB/NLB
- Haz clic para expandir y ver:
  - Target Groups
  - Health checks
  - Estado de los targets (healthy/unhealthy)

### Ver Logs
- Haz clic en "View Logs" en la barra superior
- Ingresa el nombre del Log Group (ej: `/ecs/my-app`)
- Selecciona un Log Stream para ver los eventos
- Los logs se muestran en tiempo real con timestamps

### Auto-Refresh
- Activa "Auto-refresh (30s)" para actualizar datos autom�ticamente
- �til para monitoreo en tiempo real

## Construcci�n para Producci�n

```cmd
npm run build
```

Los archivos se generar�n en la carpeta `dist/`

### Previsualizar Build de Producci�n

```cmd
npm run preview
```

## Soluci�n de Problemas

### Error: "Access Denied"
- Verifica que tu usuario IAM tenga todos los permisos necesarios
- Revisa que las credenciales sean correctas

### No se muestran clusters
- Confirma que est�s en la regi�n correcta
- Verifica que tienes clusters creados en esa regi�n

### Error al cargar logs
- El Log Group debe existir en CloudWatch
- El formato correcto es `/ecs/nombre-del-servicio`
- Verifica permisos de CloudWatch Logs

### La aplicaci�n no se inicia
- Verifica que Node.js est� instalado: `node --version`
- Elimina node_modules y reinstala: `rmdir /s node_modules && npm install`

## Seguridad

- **Nunca compartas tus credenciales de AWS**
- Las credenciales se almacenan localmente en tu navegador
- Considera usar credenciales temporales con AWS STS
- Para producci�n, usa AWS Cognito o IAM roles
- Cierra sesi�n cuando no uses el dashboard

## Soporte

Si encuentras problemas:
1. Revisa esta gu�a
2. Verifica los permisos IAM
3. Revisa la consola del navegador (F12) para errores
4. Abre un issue en el repositorio de GitHub

## Comandos �tiles

```cmd
# Iniciar en modo desarrollo
npm run dev

# Construir para producci�n
npm run build

# Previsualizar build
npm run preview

# Limpiar e reinstalar
rmdir /s node_modules
del /f package-lock.json
npm install
```
