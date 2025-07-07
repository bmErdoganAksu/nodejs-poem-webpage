const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // `useNewUrlParser` ve `useUnifiedTopology` seçenekleri artık gerekli değil
    // Mongoose'un yeni sürümleri bunları otomatik olarak yönetiyor.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlantısı başarılı.");
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error);
    // Bağlantı hatasında uygulamanın kapanması genellikle iyi bir uygulamadır
    process.exit(1); // Uygulamayı sonlandır
  }
};

module.exports = connectDB;