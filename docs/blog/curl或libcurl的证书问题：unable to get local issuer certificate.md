# curl或libcurl的证书问题：unable to get local issuer certificate

## 背景
curl或者依赖libcurl的类库或脚本语言，可能会出现在访问HTTPS请求时出现SSL证书问题，但通过浏览器访问相同域名或相同链接是没有问题的。CURL输出的典型的错误信息如下：

### Linux CURL报错信息
```shell
$ curl -v https://my-subdomain.mysecuresite.com

 Trying xxx.xxx.xxx.xxx:443…
 TCP_NODELAY set
 Connected to my-subdomain.mysecuresite.com (xxx.xxx.xxx.xxx) port 443 (#0)
 ALPN, offering h2
 ALPN, offering http/1.1
 successfully set certificate verify locations:
 CAfile: /etc/ssl/certs/ca-certificates.crt
 CApath: none
 TLSv1.3 (OUT), TLS handshake, Client hello (1):
 TLSv1.3 (IN), TLS handshake, Server hello (2):
 TLSv1.2 (IN), TLS handshake, Certificate (11):
 TLSv1.2 (OUT), TLS alert, unknown CA (560):
 SSL certificate problem: unable to get local issuer certificate
 Closing connection 0
 curl: (60) SSL certificate problem: unable to get local issuer certificate
 More details here: https://curl.haxx.se/docs/sslcerts.html 
 curl failed to verify the legitimacy of the server and therefore could not
 establish a secure connection to it. To learn more about this situation and
 how to fix it, please visit the web page mentioned above.
```

### Mac OS CURL报错信息
```shell
curl https://dchain-ae-inbound-s-bucket.aliexpress.com -O -v
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:--  0:00:01 --:--:--     0*   Trying xx.xxx.xxx.xx:443...
* Connected to dchain-ae-inbound-s-bucket.aliexpress.com (xx.xxx.xxx.xx) port 443 (#0)
* ALPN: offers h2
* ALPN: offers http/1.1
*  CAfile: /Users/ge/opt/anaconda3/ssl/cacert.pem
*  CApath: none
} [5 bytes data]
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
} [512 bytes data]
* TLSv1.3 (IN), TLS handshake, Server hello (2):
{ [112 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [1804 bytes data]
* TLSv1.2 (OUT), TLS alert, unknown CA (560):
} [2 bytes data]
* SSL certificate problem: unable to get local issuer certificate
  0     0    0     0    0     0      0      0 --:--:--  0:00:01 --:--:--     0
* Closing connection 0
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```

## 分析问题
1. 首先通过[SSLLABS](https://www.ssllabs.com/ssltest/)域名检查工具，来分析SSL问题；
2. 确定是否是某个特定颁发机构 (CA) 颁发的所有证书都会出现此错误，如果是，运行curl 的操作系统需要在其证书存储库中添加或更新该CA的根证书。这是一个相对罕见的问题，但如果运行 curl 的操作系统非常旧，则可能会出现这种情况。[Stack Overflow 上有一个关于此问题的解释说明](https://stackoverflow.com/questions/24611640/curl-60-ssl-certificate-unable-to-get-local-issuer-certificate)。
3. 如果该错误仅发生在一个特定站点上，则该站点可能缺少中间证书。诊断此问题的命令也可以在 Stack Overflow 线程中找到，命令如下：

```shell
-- 查看证书链是否完整
openssl s_client -connect dchain-ae-inbound-s-bucket.aliexpress.com:443 -servername dchain-ae-inbound-s-bucket.aliexpress.com -showcerts
```

输出的结果应显示一系列证书，从站点证书开始，到证书颁发机构的根证书结束。如果证书链仅显示站点证书，那就是问题所在。

## 为什么它可以在浏览器或 Mac 上运行？

如果站点未提供中间证书，浏览器可以下载中间证书。curl（至少在 Linux 系统上）没有。Linux 上的curl 不引用OpenSSL提供的CA证书。相反，curl引用NSS中自己的CA库。有趣的是，MacOS 附带的curl版本引用了MacOS提供的CA库，因此Mac上的curl比Linux系统上的curl遇到此错误的可能性更小。

## 使用 SSL 证书链创建 Kubernetes Ingress
随着越来越多的人迁移到 Kubernetes，curl 和 SSL 中间证书的这个问题只会更频繁地发生。使用 SSL 证书链创建 Kubernetes 入口有一个非常具体的过程，但没有详细记录。[创建包含私钥和完整证书链的 Kubernetes TLS 密钥](https://shocksolution.com/2018/12/14/creating-kubernetes-secrets-using-tls-ssl-as-an-example/)。证书链必须具有非常特定的格式：

```text
-----BEGIN CERTIFICATE-----
site certificate
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
intermediate certificate
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
CA root certificate
-----END CERTIFICATE-----
```

站点证书是您从 CA 获得的证书；中间证书和根证书作为“bundle”或“chain”文件的一部分提供，该文件应与站点证书一起提供。

## 参考
https://shocksolution.com/2020/03/10/curl-or-libcurl-ssl-unable-to-get-local-issuer-certificate/