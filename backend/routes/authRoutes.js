const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // authMiddleware'i yine de dahil edin çünkü diğer rotalar kullanıyor

// Kayıt
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) return res.status(400).json({ message: 'Kullanıcı adı veya e-posta kullanımda.' });

        user = new User({ username, email, password, role: 'user', canPostPoems: false });
        await user.save();

        // DÜZELTME: payload.user objesine 'email' bilgisini ekleyin
        const payload = { user: { id: user.id, username: user.username, email: user.email, role: user.role, canPostPoems: user.canPostPoems } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ message: 'Kayıt başarılı!', user: payload.user, token });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

// Giriş
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // 'username' burada hem kullanıcı adı hem de e-posta için kullanılabilir.
    try {
        // Kullanıcıyı hem kullanıcı adına hem de e-postaya göre bulmaya çalışın
        const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
        if (!user) return res.status(400).json({ message: 'Geçersiz bilgiler.' }); // Kullanıcı bulunamazsa

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Geçersiz bilgiler.' }); // Şifre eşleşmezse

        // DÜZELTME: payload.user objesine 'email' bilgisini ekleyin
        const payload = { user: { id: user.id, username: user.username, email: user.email, role: user.role, canPostPoems: user.canPostPoems } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ message: 'Giriş başarılı!', user: payload.user, token });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

// Şifre değiştir (Bu rota authMiddleware'i kullanmaya devam etmeli)
router.put('/profile/password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mevcut şifre yanlış.' });

        user.password = newPassword; // Modeldeki pre-save hook'u şifreyi hashleyecektir
        await user.save();
        res.json({ message: 'Şifre güncellendi.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

// ✅ Kullanıcı Bilgisi Getir (Şifre hariç) - ARTIK HERKES ERİŞEBİLİR
router.get('/profile/:id', async (req, res) => { // <<< authMiddleware kaldırıldı
    try {
        // Düzeltme: Burada email zaten select('-password') ile döndürülüyordu.
        // Eğer User modelinizde email alanı varsa ve kaydedilmişse,
        // bu rota ile doğru bir şekilde döndürülecektir.
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;