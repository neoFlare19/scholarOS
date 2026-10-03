## backend setup 

1. navigate to the backend folder: 

```bash
cd backend
```

2. install depedencies:

```bash
composer install
```

3. copty the environemt file:

```bash
cp .env.example .env
```

4. generate the application key:

```bash
php artisan key:generate
```

5. start the development server:

```bash
php artisan serve
```