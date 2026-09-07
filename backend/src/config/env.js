require('dotenv').config(); module.exports={port:Number(process.env.PORT||3000),databaseUrl:process.env.DATABASE_URL,jwtSecret:process.env.JWT_SECRET||'dev-only-secret',weatherKey:process.env.OPENWEATHER_API_KEY,notificationWebhookUrl:process.env.NOTIFICATION_WEBHOOK_URL,uploadDir:process.env.UPLOAD_DIR||'uploads'};

