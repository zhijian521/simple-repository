import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// 加载环境变量
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#') && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key] = value;
    }
  });
  console.log('✅ Environment variables loaded from .env');
} else {
  console.log('⚠️  .env file not found');
}

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 路径重写规则
const REWRITE_RULES = {
  '/api/login': '/api/auth/login',
  '/api/images': '/api/images/index',
  '/api/upload': '/api/images/upload',
};

// 导入编译后的 API 路由
async function importAPI(pathname) {
  try {
    // 应用路径重写
    const resolvedPath = REWRITE_RULES[pathname] || pathname;

    // Vercel 的文件系统路由:
    // /api/auth/login -> api/auth/login.ts
    // /api/images/index -> api/images/index.ts
    // /api/images/upload -> api/images/upload.ts

    let jsPath;
    if (resolvedPath === '/api/login') {
      // 特殊处理：/api/login 映射到 api/auth/login.js
      jsPath = path.join(__dirname, 'dist/api/auth/login.js');
    } else {
      jsPath = path.join(__dirname, 'dist' + resolvedPath + '.js');
    }

    console.log(`  Importing: ${jsPath}`);

    const module = await import(jsPath);
    return module.default;
  } catch (error) {
    console.error(`  Failed to import API: ${pathname}`, error.message);
    return null;
  }
}

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`${req.method} ${pathname}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 路由
  if (pathname.startsWith('/api/')) {
    const apiHandler = await importAPI(pathname);

    if (apiHandler) {
      // 模拟 Vercel Request/Response
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
      };

      const vercelRes = {
        statusCode: 200,
        headers: {},
        body: '',
        json(data) {
          this.headers['Content-Type'] = 'application/json';
          this.body = JSON.stringify(data);
        },
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        end(data) {
          this.body = data || this.body;
        },
      };

      // 处理请求体
      if (req.method === 'POST') {
        const body = await getRequestBody(req);

        // 尝试解析 JSON
        if (req.headers['content-type']?.includes('application/json')) {
          try {
            vercelReq.body = JSON.parse(body.toString());
          } catch (e) {
            vercelReq.body = body;
          }
        } else {
          vercelReq.body = body;
          vercelReq.rawBody = body;
        }
      }

      try {
        await apiHandler(vercelReq, vercelRes);

        // 设置响应头
        Object.entries(vercelRes.headers).forEach(([name, value]) => {
          res.setHeader(name, value);
        });

        res.writeHead(vercelRes.statusCode);
        res.end(vercelRes.body);
      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API not found' }));
    return;
  }

  // 静态文件服务
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404 - Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => resolve(Buffer.concat(body)));
  });
}

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`\n🚀 Development server running on http://localhost:${PORT}\n`);
  console.log(`  Frontend: http://localhost:${PORT}`);
  console.log(`  API:      http://localhost:${PORT}/api/\n`);
});
