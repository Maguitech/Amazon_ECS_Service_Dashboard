# =3 Verificación de Docker - Checklist

##  Pre-requisitos

Antes de construir la imagen Docker, verifica:

- [ ] Docker Desktop está instalado y corriendo
- [ ] Tienes conexión a internet (para descargar imágenes base)
- [ ] Tienes al menos 2 GB de espacio libre en disco

Verificar Docker:
```cmd
docker --version
docker info
```

## >ê Pruebas de Construcción

### Test 1: Build Simple

```bash
cd aws-ecs-dashboard
docker build -t aws-ecs-dashboard:test .
```

**Resultado esperado:**
```
Successfully built <image-id>
Successfully tagged aws-ecs-dashboard:test
```

**Tiempo estimado**: 2-3 minutos

### Test 2: Inspeccionar la Imagen

```bash
docker images aws-ecs-dashboard
```

**Verificar:**
- Tamaño: ~20-30 MB (gracias a multi-stage build)
- Tag: latest o test

### Test 3: Ejecutar el Contenedor

```bash
docker run -d -p 5000:5000 --name test-dashboard aws-ecs-dashboard:test
```

**Verificar:**
```bash
docker ps
```

Deberías ver el contenedor corriendo.

### Test 4: Health Check

```bash
# Espera 10 segundos para que el contenedor inicie
timeout /t 10

# Verificar health
docker inspect --format='{{.State.Health.Status}}' test-dashboard
```

**Resultado esperado**: `healthy`

### Test 5: Acceso HTTP

```bash
# Test con curl o en navegador
curl http://localhost:5000/health
```

**Resultado esperado**: `healthy`

Navegador: http://localhost:5000
**Resultado esperado**: Se carga la aplicación

### Test 6: Logs del Contenedor

```bash
docker logs test-dashboard
```

**Verificar:** No hay errores, solo logs de Nginx iniciando.

### Test 7: Performance

```bash
docker stats test-dashboard --no-stream
```

**Verificar:**
- CPU: < 5%
- Memoria: < 50 MB

## >ù Limpieza después de Tests

```bash
# Detener y eliminar contenedor de prueba
docker stop test-dashboard
docker rm test-dashboard

# Eliminar imagen de prueba
docker rmi aws-ecs-dashboard:test

# Limpiar imágenes no usadas
docker image prune -f
```

## =Ë Checklist de Producción

Antes de desplegar en producción:

- [ ] El build completa sin errores
- [ ] La imagen es < 50 MB
- [ ] El health check responde
- [ ] La aplicación carga en el navegador
- [ ] No hay errores en logs
- [ ] CPU y memoria están dentro de límites

## = Troubleshooting

### Error: "Cannot connect to Docker daemon"

**Solución:**
1. Abre Docker Desktop
2. Espera a que inicie completamente
3. Verifica: `docker info`

### Error: "Failed to fetch"

**Solución:**
1. Verifica conexión a internet
2. Intenta de nuevo: `docker build --no-cache -t aws-ecs-dashboard .`

### Error: "Port 5000 already in use"

**Solución:**
```bash
# Encuentra qué usa el puerto
netstat -ano | findstr :5000

# Usa otro puerto
docker run -d -p 5001:5000 --name test-dashboard aws-ecs-dashboard
```

### Contenedor inicia pero no responde

**Solución:**
```bash
# Ver logs detallados
docker logs test-dashboard

# Entrar al contenedor
docker exec -it test-dashboard sh

# Verificar nginx
ps aux | grep nginx

# Ver configuración
cat /etc/nginx/conf.d/default.conf
```

### Build muy lento

**Solución:**
1. Usa `.dockerignore` (ya incluido)
2. Aumenta recursos en Docker Desktop (Settings ’ Resources)

## ( Resultado Esperado Final

Si todos los tests pasan:

```
 Imagen construida: aws-ecs-dashboard:latest
 Tamaño optimizado: ~25 MB
 Contenedor corriendo en puerto 5000
 Health check: healthy
 Aplicación accesible en http://localhost:5000
 Logs limpios sin errores
 Uso de recursos mínimo
```

## =€ Próximos Pasos

Una vez verificado localmente:

1. **Push a ECR**: Ver [DOCKER-GUIDE.md](DOCKER-GUIDE.md) sección "Despliegue en AWS ECS"
2. **Deploy en ECS**: Crear Task Definition y Service
3. **Configurar ALB**: Para acceso público (opcional)
4. **Monitoreo**: CloudWatch Logs y métricas

---

**¡Todo listo para producción!** <‰
