# Cтарт

1. Клонування репозиторію
   git clone https://github.com/IlyaOriekhov/telegram-viewer.git
   cd telegram-viewer
2. Налаштування Telegram API

Перейдіть на https://my.telegram.org
Увійдіть зі своїм номером телефону
Перейдіть в "API Development tools"
Створіть нову аплікацію
Скопіюйте API ID та API Hash

3. Налаштування бекенду
   #Перейти в папку бекенду
   cd backend

   #Створити віртуальне середовище
   python -m venv telegram_env

#Активувати віртуальне середовище

#Windows:
telegram_env\Scripts\activate

#macOS/Linux:
source telegram_env/bin/activate

#Встановити залежності
pip install -r requirements.txt

#Створити .env файл
cp .env.example .env

Заповніть .env файл:

#Telegram API креденшали (отримайте на https://my.telegram.org)
TELEGRAM_API_ID=ваш_api_id
TELEGRAM_API_HASH=ваш_api_hash

#JWT секретний ключ
JWT_SECRET=super-secret-key-for-development

#Налаштування розробки
DEBUG=True
HOST=0.0.0.0
PORT=8000

#База даних
DATABASE_URL=sqlite:///./telegram_viewer.db

4. Запуск бекенду
   #З активованим віртуальним середовищем
   python run.py
   Бекенд буде доступний за адресою: http://localhost:8000
   API документація: http://localhost:8000/docs 5. Налаштування фронтенду

Новий термінал на фронт:
#Перейти в папку фронтенду
cd frontend

#Встановити залежності

npm install

#Запустити сервер розробки

npm run dev
Фронтенд буде доступний за адресою: http://localhost:5173
