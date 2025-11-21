#!/bin/bash

# 生成本地HTTPS证书
# 运行: chmod +x generate-cert.sh && ./generate-cert.sh

echo "生成本地HTTPS证书..."

# 创建证书目录
mkdir -p ssl

# 生成私钥
openssl genrsa -out ssl/key.pem 2048

# 生成证书签名请求
openssl req -new -key ssl/key.pem -out ssl/csr.pem -subj "/C=CN/ST=Beijing/L=Beijing/O=LocalDev/CN=localhost"

# 生成自签名证书
openssl x509 -req -in ssl/csr.pem -signkey ssl/key.pem -out ssl/cert.pem -days 365

# 清理CSR文件
rm ssl/csr.pem

echo "证书生成完成！"
echo "证书文件: ssl/cert.pem"
echo "私钥文件: ssl/key.pem"
echo ""
echo "注意：浏览器会提示证书不安全，这是正常的，点击继续访问即可"