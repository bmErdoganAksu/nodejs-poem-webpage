const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Kullanıcı modelini import et

module.exports = async (req, res, next) => {
    // Header'dan token'ı al
    const authHeader = req.header('Authorization');

    // Token yoksa yetkilendirme reddedildi
    if (!authHeader) {
        return res.status(401).json({ message: 'Yetkilendirme reddedildi, token yok.' });
    }

    // "Bearer " önekini kaldır
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme reddedildi, token formatı yanlış.' });
    }

    try {
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token'daki kullanıcı ID'si ile kullanıcıyı bul ve req.user'a ekle
        const user = await User.findById(decoded.user.id).select('-password'); // Şifreyi hariç tut
        if (!user) {
            return res.status(401).json({ message: 'Yetkilendirme reddedildi, kullanıcı bulunamadı.' });
        }

        req.user = user; // Tüm kullanıcı objesini req.user'a ekle
        next(); // Bir sonraki middleware'e veya rota işleyicisine geç
    } catch (err) {
        console.error('Token doğrulama hatası:', err.message);
        res.status(401).json({ message: 'Token geçersiz.' });
    }
};