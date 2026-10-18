# Nginx 配置

两个环境各一份完整 `nginx.conf`：

| 文件 | 环境 | 监听 | 前端目录 | 网关 | MinIO |
|---|---|---|---|---|---|
| `nginx.dev.conf` | 开发（Windows 本地） | 8088 | `<nginx安装目录>/html` | `127.0.0.1:8080` | `127.0.0.1:9000` |
| `nginx.prod.conf` | 生产（Linux） | 80 | `/usr/share/nginx/html`（Debian/Ubuntu 为 `/var/www/html`） | `127.0.0.1:8080` | `127.0.0.1:9000` |

## 开发环境（Windows 本地）

```bash
# 1. 构建前端
npm run build

# 2. 把 dist 里的内容放进 Nginx 的 html 目录
#    假设 Nginx 安装在 D:\nginx-1.24.0
cp -r dist/* /d/nginx-1.24.0/html/

# 3. 用开发配置覆盖 Nginx 配置
cp deploy/nginx/nginx.dev.conf /d/nginx-1.24.0/conf/nginx.conf

# 4. 检查并重载
cd /d/nginx-1.24.0
./nginx.exe -t
./nginx.exe -s reload   # 首次启动直接用 ./nginx.exe
```

浏览器访问 `http://localhost:8088`。

`nginx.dev.conf` 里的 `root html;`、`logs/...`、`include mime.types;` 都是相对 Nginx 安装目录的写法，适用于 Windows 本地。放到 Linux 上跑时，按文件里的注释改成绝对路径。

## 生产环境（Linux）

```bash
# 1. 构建前端
npm run build

# 2. 部署静态文件到 Nginx 的 html 目录
#    Docker 官方镜像 / CentOS：
sudo cp -r dist/* /usr/share/nginx/html/
#    Debian/Ubuntu 包安装用 /var/www/html/，并同步修改 nginx.prod.conf 的 root

# 3. 安装配置
sudo cp deploy/nginx/nginx.prod.conf /etc/nginx/nginx.conf

# 4. 检查并重载
sudo nginx -t
sudo nginx -s reload
```

## 生产部署前必须改

1. `server_name qi-suo.example.com;` 改成真实域名或 IP。
2. `root /usr/share/nginx/html;` 按实际 Nginx html 目录确认（Debian/Ubuntu 通常是 `/var/www/html`）。
3. 如果 Nginx 和后端在同一个 Docker 网络，把 `upstream` 里的地址改成服务名：

```nginx
upstream qi_suo_gateway {
    server qi-suo-gateway:8080;
    keepalive 32;
}

upstream qi_suo_minio {
    server minio:9000;
    keepalive 16;
}
```

如果 Nginx 在宿主机、后端端口只发布到 `127.0.0.1`，保持现状即可。

## 路径约定

- 前端请求 `/api/**` → Nginx 原样转给网关，网关路由本身就是 `/api/**`。
- MinIO 文件通过 `/files/**` 访问，Nginx 会剥掉 `/files` 前缀。
- 生产 Nacos 的 `minio.fileHost` 应配成 `https://你的域名/files`（同域方案），
  新建上传的文件 URL 才会走 Nginx 的 `/files/` 代理。

## 注意

- `location /api/` 的 `proxy_pass` 末尾**不能加 `/`**，否则 `/api` 会被剥掉。
- `location /files/` 的 `proxy_pass` 末尾**必须有 `/`**，用来剥掉 `/files` 前缀。
- 上传接口依赖 `client_max_body_size`，默认 1m 会返回 413。
- Vue Router 使用 history 模式，`try_files $uri $uri/ /index.html;` 不能删。
