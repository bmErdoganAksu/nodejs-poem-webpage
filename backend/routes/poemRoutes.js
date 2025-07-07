const express = require('express');
const router = express.Router(); // Router burada bir kez tanımlanıyor
const authMiddleware = require('../middleware/authMiddleware'); // Kimlik doğrulama middleware'i
const Poem = require('../models/Poem'); // Şiir modeli (gömülü yorumları içerir)

// @route   GET /api/poems
// @desc    Tüm şiirleri listele
// @access  Public
router.get('/', async (req, res) => {
    try {
        console.log("GET /api/poems isteği alındı.");
        const poems = await Poem.find({})
            .populate('author', '_id username')
            .populate({
                path: 'comments.author',
                select: '_id username'
            })
            .sort({ createdAt: -1 });

        const formattedPoems = poems.map(poem => {
            const comments = poem.comments.map(comment => ({
                _id: comment._id,
                text: comment.text,
                authorId: comment.author ? comment.author._id : null,
                authorUsername: comment.authorUsername || (comment.author ? comment.author.username : 'Bilinmeyen Yazar'),
                createdAt: comment.createdAt
            }));

            return {
                _id: poem._id,
                title: poem.title,
                content: poem.content,
                authorId: poem.author ? poem.author._id : null,
                authorUsername: poem.authorUsername || (poem.author ? poem.author.username : 'Bilinmeyen Yazar'),
                likes: poem.likes,
                likedBy: poem.likedBy || [],
                comments: comments,
                isApproved: poem.isApproved, // isApproved'u ekledik
                createdAt: poem.createdAt
            };
        });

        console.log("Toplam şiir sayısı (filtresiz):", formattedPoems.length);
        res.json(formattedPoems);
    } catch (err) {
        console.error("GET /api/poems hatası:", err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   GET /api/poems/approved
// @desc    Sadece onaylanmış şiirleri listele
// @access  Public
router.get('/approved', async (req, res) => {
    try {
        console.log("GET /api/poems/approved isteği alındı.");
        const poems = await Poem.find({ isApproved: true }) // Sadece onaylanmış olanları filtrele
            .populate('author', '_id username')
            .populate({
                path: 'comments.author',
                select: '_id username'
            })
            .sort({ createdAt: -1 });

        const formattedPoems = poems.map(poem => {
            const comments = poem.comments.map(comment => ({
                _id: comment._id,
                text: comment.text,
                authorId: comment.author ? comment.author._id : null,
                authorUsername: comment.authorUsername || (comment.author ? comment.author.username : 'Bilinmeyen Yazar'),
                createdAt: comment.createdAt
            }));

            return {
                _id: poem._id,
                title: poem.title,
                content: poem.content,
                authorId: poem.author ? poem.author._id : null,
                authorUsername: poem.authorUsername || (poem.author ? poem.author.username : 'Bilinmeyen Yazar'),
                likes: poem.likes,
                likedBy: poem.likedBy || [],
                comments: comments,
                isApproved: poem.isApproved,
                createdAt: poem.createdAt
            };
        });

        console.log("Toplam onaylanmış şiir sayısı:", formattedPoems.length);
        res.json(formattedPoems);
    } catch (err) {
        console.error("GET /api/poems/approved hatası:", err.message);
        res.status(500).send('Sunucu Hatası');
    }
});


// @route   GET /api/poems/:id
// @desc    Belirli bir şiiri ID'sine göre getir
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/poems/${req.params.id} isteği alındı.`);
        const poem = await Poem.findById(req.params.id)
            .populate('author', '_id username')
            .populate({
                path: 'comments.author',
                select: '_id username'
            });

        if (!poem) {
            console.log(`Şiir bulunamadı: ID ${req.params.id}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }

        const formattedComments = poem.comments.map(comment => ({
            _id: comment._id,
            text: comment.text,
            authorId: comment.author ? comment.author._id : null,
            authorUsername: comment.authorUsername || (comment.author ? comment.author.username : 'Bilinmeyen Yazar'),
            createdAt: comment.createdAt
        }));

        const formattedPoem = {
            _id: poem._id,
            title: poem.title,
            content: poem.content,
            authorId: poem.author ? poem.author._id : null,
            authorUsername: poem.authorUsername || (poem.author ? poem.author.username : 'Bilinmeyen Yazar'),
            likes: poem.likes,
            likedBy: poem.likedBy || [],
            comments: formattedComments,
            isApproved: poem.isApproved,
            createdAt: poem.createdAt
        };
        console.log(`Şiir ID ${req.params.id} başarıyla getirildi.`);
        res.json(formattedPoem);
    } catch (err) {
        console.error(`GET /api/poems/:id hatası (ID: ${req.params.id}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});


// @route   POST /api/poems
// @desc    Yeni şiir ekle
// @access  Private (Yetkili kullanıcılar veya admin)
router.post('/', authMiddleware, async (req, res) => {
    console.log("POST /api/poems isteği alındı.");
    console.log("Request Body:", req.body);

    try {
        if (!req.user || !req.user.id || !req.user.username) {
            console.log("Yetkilendirme Hatası: req.user bilgisi eksik. Token geçersiz olabilir veya middleware çalışmıyor.");
            return res.status(401).json({ message: 'Yetkilendirme gerekli. Lütfen giriş yapın veya geçerli bir token sağlayın.' });
        }

        if (req.user.role !== 'admin' && !req.user.canPostPoems) {
            console.log(`Yetki hatası: Kullanıcı ${req.user.username} (${req.user.id}) şiir ekleme yetkisine sahip değil.`);
            return res.status(403).json({ message: 'Şiir ekleme yetkiniz bulunmamaktadır.' });
        }

        const { title, content } = req.body;

        if (!title || !content) {
            console.log("Veri hatası: Başlık veya içerik eksik. Gelen body:", req.body);
            return res.status(400).json({ message: 'Başlık ve içerik alanları zorunludur.' });
        }

        const newPoem = new Poem({
            title,
            content,
            author: req.user.id,
            authorUsername: req.user.username,
            isApproved: false // Yeni eklenen şiir varsayılan olarak onaylanmamış
        });

        console.log("Yeni şiir objesi oluşturuldu (kayıt öncesi):", newPoem);

        const poem = await newPoem.save();
        console.log("Şiir başarıyla veritabanına kaydedildi:", poem);
        res.status(201).json(poem);
    } catch (err) {
        console.error("POST /api/poems - Şiir kaydederken bir hata oluştu:", err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            console.error("Doğrulama Hataları:", errors);
            return res.status(400).json({ message: 'Doğrulama hatası:', errors });
        }
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   PUT /api/poems/:id
// @desc    Şiiri güncelle (Sadece yazar veya admin)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
    console.log(`PUT /api/poems/${req.params.id} isteği alındı.`);
    console.log("Request Body:", req.body);

    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) {
            console.log(`Şiir bulunamadı: ID ${req.params.id}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }

        if (!req.user || (poem.author && poem.author.toString() !== req.user.id && req.user.role !== 'admin')) {
            console.log(`Yetki hatası: Kullanıcı ${req.user ? req.user.username : 'Bilinmiyor'} bu şiiri düzenleyemez.`);
            return res.status(403).json({ message: 'Bu şiiri düzenleme yetkiniz yok.' });
        }

        const { title, content, isApproved } = req.body;
        poem.title = title || poem.title;
        poem.content = content || poem.content;

        if (req.user.role === 'admin' && typeof isApproved === 'boolean') {
            poem.isApproved = isApproved;
            console.log(`Şiir ID ${req.params.id} için isApproved ${isApproved} olarak güncellendi.`);
        }

        await poem.save();
        console.log(`Şiir ID ${req.params.id} başarıyla güncellendi.`);
        res.json({ message: 'Şiir başarıyla güncellendi.', poem });
    } catch (err) {
        console.error(`PUT /api/poems/:id hatası (ID: ${req.params.id}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   DELETE /api/poems/:id
// @desc    Şiiri sil (Sadece yazar veya admin)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    console.log(`DELETE /api/poems/${req.params.id} isteği alındı.`);
    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) {
            console.log(`Şiir bulunamadı: ID ${req.params.id}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }

        if (!req.user || (poem.author && poem.author.toString() !== req.user.id && req.user.role !== 'admin')) {
            console.log(`Yetki hatası: Kullanıcı ${req.user ? req.user.username : 'Bilinmiyor'} bu şiiri silemez.`);
            return res.status(403).json({ message: 'Bu şiiri silme yetkiniz yok.' });
        }

        await poem.deleteOne();
        console.log(`Şiir ID ${req.params.id} başarıyla silindi.`);
        res.json({ message: 'Şiir başarıyla silindi.' });
    } catch (err) {
        console.error(`DELETE /api/poems/:id hatası (ID: ${req.params.id}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   POST /api/poems/:id/like
// @desc    Şiiri beğen/beğenmekten vazgeç
// @access  Private
router.post('/:id/like', authMiddleware, async (req, res) => {
    console.log(`POST /api/poems/${req.params.id}/like isteği alındı.`);
    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) {
            console.log(`Beğenilecek şiir bulunamadı: ID ${req.params.id}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }

        if (!req.user || !req.user.id) {
            console.log("Yetkilendirme Hatası: Beğeni için kullanıcı bilgisi eksik.");
            return res.status(401).json({ message: 'Yetkilendirme gerekli. Lütfen giriş yapın.' });
        }
        const userId = req.user.id;
        const isLiked = poem.likedBy.includes(userId);

        if (isLiked) {
            poem.likedBy = poem.likedBy.filter(id => id.toString() !== userId);
            poem.likes -= 1;
            console.log(`Kullanıcı ${req.user.username} şiir ID ${req.params.id} beğenmekten vazgeçti.`);
        } else {
            poem.likedBy.push(userId);
            poem.likes += 1;
            console.log(`Kullanıcı ${req.user.username} şiir ID ${req.params.id} beğendi.`);
        }

        await poem.save();
        res.json(poem);
    } catch (err) {
        console.error(`POST /api/poems/:id/like hatası (ID: ${req.params.id}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   POST /api/poems/:id/comments
// @desc    Şiire yorum ekle
// @access  Private
router.post('/:id/comments', authMiddleware, async (req, res) => {
    console.log(`POST /api/poems/${req.params.id}/comments isteği alındı.`);
    console.log("Request Body:", req.body);
    try {
        const { text } = req.body;
        const poem = await Poem.findById(req.params.id);
        if (!poem) {
            console.log(`Yorum yapılacak şiir bulunamadı: ID ${req.params.id}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }
        if (!req.user || !req.user.id || !req.user.username) {
            console.log("Yetkilendirme Hatası: Yorum için kullanıcı bilgisi eksik.");
            return res.status(401).json({ message: 'Yetkilendirme gerekli. Lütfen giriş yapın.' });
        }
        if (!text) {
            console.log("Yorum metni eksik.");
            return res.status(400).json({ message: 'Yorum metni boş olamaz.' });
        }

        const newComment = {
            text: text,
            author: req.user.id,
            authorUsername: req.user.username,
            createdAt: new Date()
        };

        poem.comments.push(newComment);
        await poem.save();

        const addedComment = poem.comments[poem.comments.length - 1];
        console.log(`Şiir ID ${req.params.id} için yorum başarıyla eklendi:`, addedComment);
        res.status(201).json({ message: 'Yorum başarıyla eklendi.', comment: addedComment });
    } catch (err) {
        console.error(`POST /api/poems/:id/comments hatası (ID: ${req.params.id}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   PUT /api/poems/:poemId/comments/:commentId
// @desc    Yorumu güncelle (Sadece yazar veya admin)
// @access  Private
router.put('/:poemId/comments/:commentId', authMiddleware, async (req, res) => {
    console.log(`PUT /api/poems/${req.params.poemId}/comments/${req.params.commentId} isteği alındı.`);
    console.log("Request Body:", req.body);
    try {
        const { text } = req.body;
        const poem = await Poem.findById(req.params.poemId);
        if (!poem) {
            console.log(`Şiir bulunamadı: ID ${req.params.poemId}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }
        const comment = poem.comments.id(req.params.commentId);
        if (!comment) {
            console.log(`Yorum bulunamadı: Yorum ID ${req.params.commentId}`);
            return res.status(404).json({ message: 'Yorum bulunamadı.' });
        }

        if (!req.user || (comment.author && comment.author.toString() !== req.user.id && req.user.role !== 'admin')) {
            console.log(`Yetki hatası: Kullanıcı ${req.user ? req.user.username : 'Bilinmiyor'} bu yorumu düzenleyemez.`);
            return res.status(403).json({ message: 'Bu yorumu düzenleme yetkiniz yok.' });
        }
        if (!text) {
            console.log("Yorum güncelleme metni eksik.");
            return res.status(400).json({ message: 'Yorum metni boş olamaz.' });
        }

        comment.text = text;
        await poem.save();
        console.log(`Yorum ID ${req.params.commentId} başarıyla güncellendi.`);
        res.json({ message: 'Yorum başarıyla güncellendi.', comment });
    } catch (err) {
        console.error(`PUT /api/poems/:poemId/comments/:commentId hatası (Poem ID: ${req.params.poemId}, Comment ID: ${req.params.commentId}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   DELETE /api/poems/:poemId/comments/:commentId
// @desc    Yorumu sil (Sadece yazar veya admin)
// @access  Private
router.delete('/:poemId/comments/:commentId', authMiddleware, async (req, res) => {
    console.log(`DELETE /api/poems/${req.params.poemId}/comments/${req.params.commentId} isteği alındı.`);
    try {
        const poem = await Poem.findById(req.params.poemId);
        if (!poem) {
            console.log(`Şiir bulunamadı: ID ${req.params.poemId}`);
            return res.status(404).json({ message: 'Şiir bulunamadı.' });
        }

        const comment = poem.comments.id(req.params.commentId);
        if (!comment) {
            console.log(`Yorum bulunamadı: Yorum ID ${req.params.commentId}`);
            return res.status(404).json({ message: 'Yorum bulunamadı.' });
        }

        if (!req.user || (comment.author && comment.author.toString() !== req.user.id && req.user.role !== 'admin')) {
            console.log(`Yetki hatası: Kullanıcı ${req.user ? req.user.username : 'Bilinmiyor'} bu yorumu silemez.`);
            return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok.' });
        }

        comment.deleteOne();
        await poem.save();
        console.log(`Yorum ID ${req.params.commentId} başarıyla silindi.`);
        res.json({ message: 'Yorum başarıyla silindi.' });
    } catch (err) {
        console.error(`DELETE /api/poems/:poemId/comments/:commentId hatası (Poem ID: ${req.params.poemId}, Comment ID: ${req.params.commentId}):`, err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// @route   PUT /api/poems/admin/approve-all-unapproved
// @desc    Tüm onaylanmamış şiirleri onayla (Sadece admin)
// @access  Private (Admin Only)
router.put('/admin/approve-all-unapproved', authMiddleware, async (req, res) => {
    console.log("PUT /api/poems/admin/approve-all-unapproved isteği alındı.");
    try {
        // Sadece admin yetkisi olanlar bu endpoint'i kullanabilir
        if (req.user.role !== 'admin') {
            console.log("Yetki hatası: Sadece adminler tüm şiirleri onaylayabilir.");
            return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz bulunmamaktadır. Sadece adminler kullanabilir.' });
        }

        // isApproved: false olanlar VEYA isApproved alanı hiç olmayanları hedefle
        const result = await Poem.updateMany(
            { $or: [{ isApproved: false }, { isApproved: { $exists: false } }] },
            { $set: { isApproved: true } }
        );

        console.log(`Toplam ${result.modifiedCount} şiir onaylandı.`);
        res.json({
            message: `${result.modifiedCount} adet şiir başarıyla onaylandı.`,
            modifiedCount: result.modifiedCount
        });

    } catch (err) {
        console.error("Tüm şiirleri onaylarken hata oluştu:", err.message);
        res.status(500).send('Sunucu Hatası');
    }
});


module.exports = router;