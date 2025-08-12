FROM nginx:latest

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./ssl_cert.crt /etc/nginx/ssl/ssl_cert.crt
COPY ./ssl_key.key /etc/nginx/ssl/ssl_key.key

EXPOSE 80
EXPOSE 443