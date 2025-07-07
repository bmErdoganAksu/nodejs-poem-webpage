const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User'); // Kullanıcı modelini dahil et
const Poem = require('../models/Poem'); // Poem modelini dahil et (gömülü yorumları içerir)

// Admin rolü kontrolü için middleware
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Yönetici yetkisi gereklidir.' });
    }
};

// --- Kullanıcı Yönetimi Rotaları ---

// @route   GET /api/admin/users
// @desc    Tüm kullanıcıları getir (Sadece admin)
// @access  Private (Admin)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Şifre hariç tüm kullanıcıları getir
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   GET /api/admin/users/:id
// @desc    Tek bir kullanıcıyı ID'ye göre getir (Sadece admin)
// @access  Private (Admin)
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Şifre hariç kullanıcıyı getir
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        // MongoDB'den gelen ObjectId format hatası gibi durumlar için 400 Bad Request dönebiliriz.
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Geçersiz kullanıcı ID formatı.' });
        }
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Kullanıcı bilgilerini güncelle (Sadece admin)
// @access  Private (Admin)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { username, email, role, canPostPoems } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;
        user.canPostPoems = (typeof canPostPoems === 'boolean') ? canPostPoems : user.canPostPoems;

        await user.save();
        res.json({ message: 'Kullanıcı başarıyla güncellendi.', user: user.toObject({ getters: true, virtuals: false, transform: (doc, ret) => { delete ret.password; return ret; } }) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Kullanıcı sil (Sadece admin)
// @access  Private (Admin)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Kullanıcının sildiği tüm şiirleri ve yorumları da silmek isteyebilirsiniz.
        // Bu, iş mantığınıza bağlı olarak eklemeyi düşünebileceğiniz karmaşık bir işlemdir.
        // Örneğin:
        // await Poem.deleteMany({ author: req.params.id });
        // await Poem.updateMany(
        //     { 'comments.author': req.params.id },
        //     { $pull: { comments: { author: req.params.id } } }
        // );


        await user.deleteOne(); // Mongoose 6+ için deleteOne()
        res.json({ message: 'Kullanıcı başarıyla silindi.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});


// --- Şiir Yönetimi Rotaları (Zaten poemRoutes.js'de var, burada admin yetkilendirmesiyle ekstra olabilir) ---
// Not: Şiir oluşturma, güncelleme ve silme işlemleri zaten poemRoutes.js'de admin yetkilendirmesiyle mevcut.
// Bu kısım, admin panelindeki şiir yönetimi için kullanılabilir, eğer poemRoutes.js'deki route'lar yeterli değilse.
// Genel olarak, aynı işlemi yapan birden fazla rota olması önerilmez.

// --- Yorum Yönetimi Rotaları ---

// @route   GET /api/admin/comments
// @desc    Tüm yorumları getir (Sadece admin) - Şiirlere gömülü yorumları toplayacak
// @access  Private (Admin)
router.get('/comments', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Tüm şiirleri ve onların yorumlarını populate ederek getir
        const poems = await Poem.find({})
            .populate({
                path: 'comments.author', // Yorumların yazarını populate et
                select: '_id username'
            });

        let allComments = [];
        poems.forEach(poem => {
            poem.comments.forEach(comment => {
                allComments.push({
                    _id: comment._id,
                    poemId: poem._id, // Yorumun ait olduğu şiirin ID'si
                    poemTitle: poem.title, // Yorumun ait olduğu şiirin başlığı
                    text: comment.text,
                    authorId: comment.author ? comment.author._id : null,
                    authorUsername: comment.authorUsername || (comment.author ? comment.author.username : 'Bilinmeyen Yazar'),
                    createdAt: comment.createdAt
                });
            });
        });

        // Yorumları oluşturulma tarihine göre sırala (en yeniden en eskiye)
        allComments.sort((a, b) => b.createdAt - a.createdAt);

        res.json(allComments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   DELETE /api/admin/comments/:commentId
// @desc    Yorumu sil (Sadece admin)
// @access  Private (Admin)
router.delete('/comments/:commentId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Yorumun ait olduğu şiiri bulmak için $pull kullanarak yorumu doğrudan silemeyiz,
        // çünkü $pull'da populate işlemi yapamayız. Bu yüzden şiiri getirip manuel olarak sileceğiz.
        const poem = await Poem.findOneAndUpdate(
            { 'comments._id': req.params.commentId }, // İlgili yorumu içeren şiiri bul
            { $pull: { comments: { _id: req.params.commentId } } }, // Yorumu diziden çıkar
            { new: true } // Güncellenmiş belgeyi döndür
        );

        if (!poem) {
            return res.status(404).json({ message: 'Yorumun ait olduğu şiir bulunamadı veya yorum zaten silinmiş.' });
        }

        res.json({ message: 'Yorum başarıyla silindi.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});


module.exports = router;