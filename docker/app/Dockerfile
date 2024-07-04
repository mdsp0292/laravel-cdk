FROM php:8.2-fpm

ENV COMPOSER_VERSION 2.5.5

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        curl \
        libz-dev \
        libpq-dev \
        libjpeg-dev \
        libpng-dev \
        libssl-dev \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        unzip \
        zip \
        unzip \
        nodejs \
        npm \
        vim \
    && apt-get clean \
    && pecl install redis \
    && docker-php-ext-configure gd \
    && docker-php-ext-configure zip \
    && docker-php-ext-install \
        gd \
        exif \
        opcache \
        pdo_mysql \
        pdo_pgsql \
        pgsql \
        pcntl \
        zip \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*;

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=$COMPOSER_VERSION

# Install node
RUN touch ~/.bashrc && chmod +x ~/.bashrc


ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD start-fpm.sh /etc/
ADD ./nginx/config/app.conf /etc/nginx/sites-enabled/default


#copy ini config

# Redirect NGINX logs to docker console logs
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

RUN chmod +x /etc/start-fpm.sh

WORKDIR /var/www

ENTRYPOINT ["/etc/start-fpm.sh"]
