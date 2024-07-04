build-and-deploy-staging:
	@make build-sandbox
	@make deploy-sandbox

build-sandbox:
	@echo "Building app [sandbox]"
	@cd laravel && composer install -q --no-ansi --no-interaction --no-scripts --no-suggest --no-progress --prefer-dist
	@rm -rf cdk/build/laravel && mkdir -p cdk/build/laravel
	@cp -R laravel/app laravel/bootstrap laravel/config laravel/public laravel/resources laravel/routes laravel/storage laravel/vendor laravel/artisan laravel/composer.json laravel/composer.lock cdk/build/laravel

deploy-sandbox:
	@echo "Deploying Stack[sandbox]"
	@cd cdk && npm ci && npm run deploy:sandbox -- --require-approval never

destroy-sandbox:
	@echo "Destroying Stack[sandbox]"
	@cd cdk && npm ci && npm run destroy:sandbox -- --require-approval never
