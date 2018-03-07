FROM combro2k/alpine-nginx-php5

# install dependencies and build the project
RUN apk --no-cache add php5 php5-fpm php5-mysqli php5-json php5-openssl php5-curl \
        php5-zlib php5-xml php5-phar php5-intl php5-dom php5-xmlreader php5-ctype \
        php5-gd php5-mcrypt php5-pdo php5-pdo_sqlite
#
# copy sources
WORKDIR /data/web
ADD . /data/web

# build the project
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=. --filename=composer && \
    ./composer install -o && \
    echo "DB_CONNECTION=sqlite" > .env && \
    echo "VIEW_CACHE=false" >> .env && \
    sed -i 's/^short_open_tag = Off/short_open_tag = On/' /etc/php5/php.ini
