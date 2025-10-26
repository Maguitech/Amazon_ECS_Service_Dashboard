# =3 Docker Deployment Guide

## Requisitos Previos

- Docker Desktop instalado en Windows
- Docker Compose (incluido en Docker Desktop)

Descargar Docker Desktop: https://www.docker.com/products/docker-desktop

## =� Inicio R�pido con Docker

### Opci�n 1: Usar Docker Compose (Recomendado)

```bash
# Construir y ejecutar con un solo comando
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opci�n 2: Usar el Script de Windows

```cmd
docker-start.bat
```

### Opci�n 3: Comandos Docker Manuales

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

## < Acceder a la Aplicaci�n

Una vez que el contenedor est� corriendo, abre tu navegador en:

```
http://localhost:5000
```

## =� Comandos �tiles

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

### Reconstruir la imagen (despu�s de cambios)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ver uso de recursos
```bash
docker stats aws-ecs-dashboard
```

## <� Arquitectura del Dockerfile

El Dockerfile usa **multi-stage build** para optimizar el tama�o:

1. **Stage 1 (Builder)**:
   - Node.js 18 Alpine
   - Instala dependencias
   - Construye la aplicaci�n React

2. **Stage 2 (Production)**:
   - Nginx Alpine (ligero)
   - Copia archivos built
   - Sirve en puerto 5000

**Tama�o final**: ~25 MB (vs ~1 GB sin multi-stage)

## � Configuraci�n de Nginx

El archivo `nginx.conf` incluye:

-  Compresi�n Gzip
-  Security headers
-  Cache de assets est�ticos
-  SPA routing (redirecci�n a index.html)
-  Health check endpoint en `/health`

## = Health Check

El contenedor incluye health checks autom�ticos:

```bash
# Verificar estado de salud
docker inspect --format='{{.State.Health.Status}}' aws-ecs-dashboard
```

Endpoint: `http://localhost:5000/health`

## =� Despliegue en AWS ECS

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

Si quieres exponer el dashboard p�blicamente:

1. Crea un Application Load Balancer
2. Crea un Target Group apuntando al puerto 5000
3. Asocia el servicio ECS con el Target Group

## = Seguridad en Producci�n

### Recomendaciones:

1. **No expongas p�blicamente** sin autenticaci�n
2. **Usa VPN o bastion host** para acceder
3. **Implementa autenticaci�n** (AWS Cognito, OAuth)
4. **Usa HTTPS** con certificados SSL/TLS
5. **Configura WAF** si usas ALB p�blico
6. **Limita IPs** en Security Groups

### Ejemplo con Autenticaci�n B�sica en Nginx

Actualiza `nginx.conf`:

```nginx
server {
    listen 5000;

    auth_basic "AWS ECS Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # ... resto de configuraci�n
}
```

## = Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs

# Verificar que el puerto 5000 est� libre
netstat -ano | findstr :5000
```

### Problemas de construcci�n

```bash
# Limpiar cache y reconstruir
docker-compose build --no-cache
```

### Problemas de memoria

```bash
# Aumentar recursos en Docker Desktop
# Settings � Resources � Advanced
# Aumentar Memory a 4GB
```

### Ver errores de Nginx

```bash
docker exec aws-ecs-dashboard cat /var/log/nginx/error.log
```

## =� Monitoreo

### Logs de acceso Nginx

```bash
docker exec aws-ecs-dashboard tail -f /var/log/nginx/access.log
```

### Estad�sticas en tiempo real

```bash
docker stats aws-ecs-dashboard
```

## = Actualizaci�n

```bash
# 1. Reconstruir imagen
docker-compose build

# 2. Recrear contenedor
docker-compose up -d --force-recreate

# 3. Limpiar im�genes antiguas
docker image prune -f
```

## =� Variables de Entorno (Opcional)

Puedes configurar variables de entorno en `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - NGINX_WORKER_PROCESSES=2
  - NGINX_WORKER_CONNECTIONS=1024
```

##  Verificaci�n Final

Checklist despu�s del despliegue:

- [ ] Contenedor corriendo: `docker ps`
- [ ] Health check OK: `curl http://localhost:5000/health`
- [ ] App accesible: `curl http://localhost:5000`
- [ ] Logs sin errores: `docker-compose logs`

---

**�Listo! Tu dashboard est� corriendo en Docker en el puerto 5000** <�
