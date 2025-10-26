# =3 Docker Deployment Guide

## Requisitos Previos

- Docker Desktop instalado en Windows
- Docker Compose (incluido en Docker Desktop)

Descargar Docker Desktop: https://www.docker.com/products/docker-desktop

## =€ Inicio Rápido con Docker

### Opción 1: Usar Docker Compose (Recomendado)

```bash
# Construir y ejecutar con un solo comando
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opción 2: Usar el Script de Windows

```cmd
docker-start.bat
```

### Opción 3: Comandos Docker Manuales

```bash
# Construir la imagen
docker build -t aws-ecs-dashboard:latest .

# Ejecutar el contenedor
docker run -d -p 5000:5000 --name aws-ecs-dashboard aws-ecs-dashboard:latest

# Ver logs
docker logs -f aws-ecs-dashboard

# Detener
docker stop aws-ecs-dashboard

# Eliminar contenedor
docker rm aws-ecs-dashboard
```

## < Acceder a la Aplicación

Una vez que el contenedor esté corriendo, abre tu navegador en:

```
http://localhost:5000
```

## =Ë Comandos Útiles

### Ver estado del contenedor
```bash
docker ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
# o
docker logs -f aws-ecs-dashboard
```

### Reiniciar el contenedor
```bash
docker-compose restart
# o
docker restart aws-ecs-dashboard
```

### Detener y eliminar todo
```bash
docker-compose down
```

### Reconstruir la imagen (después de cambios)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ver uso de recursos
```bash
docker stats aws-ecs-dashboard
```

## <× Arquitectura del Dockerfile

El Dockerfile usa **multi-stage build** para optimizar el tamaño:

1. **Stage 1 (Builder)**:
   - Node.js 18 Alpine
   - Instala dependencias
   - Construye la aplicación React

2. **Stage 2 (Production)**:
   - Nginx Alpine (ligero)
   - Copia archivos built
   - Sirve en puerto 5000

**Tamaño final**: ~25 MB (vs ~1 GB sin multi-stage)

## ™ Configuración de Nginx

El archivo `nginx.conf` incluye:

-  Compresión Gzip
-  Security headers
-  Cache de assets estáticos
-  SPA routing (redirección a index.html)
-  Health check endpoint en `/health`

## = Health Check

El contenedor incluye health checks automáticos:

```bash
# Verificar estado de salud
docker inspect --format='{{.State.Health.Status}}' aws-ecs-dashboard
```

Endpoint: `http://localhost:5000/health`

## =¢ Despliegue en AWS ECS

### 1. Crear repositorio ECR

```bash
# Crear repositorio
aws ecr create-repository --repository-name aws-ecs-dashboard

# Obtener URI del repositorio
aws ecr describe-repositories --repository-names aws-ecs-dashboard
```

### 2. Login en ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### 3. Tag y Push

```bash
# Tag
docker tag aws-ecs-dashboard:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/aws-ecs-dashboard:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/aws-ecs-dashboard:latest
```

### 4. Crear Task Definition (JSON)

```json
{
  "family": "aws-ecs-dashboard",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "dashboard",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/aws-ecs-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      }
    }
  ]
}
```

### 5. Crear servicio ECS

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name aws-ecs-dashboard \
  --task-definition aws-ecs-dashboard \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 6. Configurar Load Balancer (Opcional)

Si quieres exponer el dashboard públicamente:

1. Crea un Application Load Balancer
2. Crea un Target Group apuntando al puerto 5000
3. Asocia el servicio ECS con el Target Group

## = Seguridad en Producción

### Recomendaciones:

1. **No expongas públicamente** sin autenticación
2. **Usa VPN o bastion host** para acceder
3. **Implementa autenticación** (AWS Cognito, OAuth)
4. **Usa HTTPS** con certificados SSL/TLS
5. **Configura WAF** si usas ALB público
6. **Limita IPs** en Security Groups

### Ejemplo con Autenticación Básica en Nginx

Actualiza `nginx.conf`:

```nginx
server {
    listen 5000;

    auth_basic "AWS ECS Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # ... resto de configuración
}
```

## = Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs

# Verificar que el puerto 5000 esté libre
netstat -ano | findstr :5000
```

### Problemas de construcción

```bash
# Limpiar cache y reconstruir
docker-compose build --no-cache
```

### Problemas de memoria

```bash
# Aumentar recursos en Docker Desktop
# Settings ’ Resources ’ Advanced
# Aumentar Memory a 4GB
```

### Ver errores de Nginx

```bash
docker exec aws-ecs-dashboard cat /var/log/nginx/error.log
```

## =Ê Monitoreo

### Logs de acceso Nginx

```bash
docker exec aws-ecs-dashboard tail -f /var/log/nginx/access.log
```

### Estadísticas en tiempo real

```bash
docker stats aws-ecs-dashboard
```

## = Actualización

```bash
# 1. Reconstruir imagen
docker-compose build

# 2. Recrear contenedor
docker-compose up -d --force-recreate

# 3. Limpiar imágenes antiguas
docker image prune -f
```

## =æ Variables de Entorno (Opcional)

Puedes configurar variables de entorno en `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - NGINX_WORKER_PROCESSES=2
  - NGINX_WORKER_CONNECTIONS=1024
```

##  Verificación Final

Checklist después del despliegue:

- [ ] Contenedor corriendo: `docker ps`
- [ ] Health check OK: `curl http://localhost:5000/health`
- [ ] App accesible: `curl http://localhost:5000`
- [ ] Logs sin errores: `docker-compose logs`

---

**¡Listo! Tu dashboard está corriendo en Docker en el puerto 5000** <‰
