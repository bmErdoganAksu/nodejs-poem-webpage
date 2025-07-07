const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
dotenv.config(); // BU SATIR .env'i okur

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// HATALAR
//console.log("Mongo URI:", process.env.MONGO_URI);


// Rotalar
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/poems', require('./routes/poemRoutes')); // daha sonra
app.use('/api/admin', require('./routes/adminRoutes')); // daha sonra
app.use('/api/comments', require('./routes/commentRoutes'));

const PORT = process.env.PORT || 5005;//HANGİ PORTTA ÇALIŞIYORSAN ONU YAZ"
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
