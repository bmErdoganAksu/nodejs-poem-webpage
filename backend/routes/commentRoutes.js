const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Poem = require('../models/Poem'); // Poem modelini dahil et (gömülü yorumları içerir)
const User = require('../models/User'); // Kullanıcı modelini dahil et (yorum yazarını populate etmek için)

// @route   GET /api/comments/user/:userId
// @desc    Belirli bir kullanıcının tüm yorumlarını getir
// @access  Private (Kullanıcının kendi yorumları veya admin)
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        // Kullanıcının kendi profilini veya adminin tüm yorumları görmesini sağla
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu yorumları görüntüleme yetkiniz yok.' });
        }

        // Tüm şiirleri ve onların yorumlarını populate ederek getir
        const poems = await Poem.find({
            'comments.author': req.params.userId // Sadece belirli bir yazarın yorumlarını içeren şiirleri filtrele
        }).populate({
            path: 'comments.author', // Yorumların yazarını populate et
            select: '_id username'
        }).populate('author', '_id username'); // Şiir yazarını da populate et

        let userComments = [];
        poems.forEach(poem => {
            poem.comments.forEach(comment => {
                // Eğer yorum bu kullanıcıya aitse, listeye ekle
                if (comment.author && comment.author._id.toString() === req.params.userId) {
                    userComments.push({
                        _id: comment._id,
                        poemId: poem._id,
                        poemTitle: poem.title, // Yorumun ait olduğu şiirin başlığı
                        text: comment.text,
                        authorId: comment.author._id,
                        authorUsername: comment.authorUsername || comment.author.username,
                        createdAt: comment.createdAt,
                        // Eğer frontend'de şiir linki oluşturulacaksa, şiir yazar bilgisi de eklenebilir
                        poemAuthorId: poem.author ? poem.author._id : null,
                        poemAuthorUsername: poem.authorUsername || (poem.author ? poem.author.username : 'Bilinmeyen Yazar')
                    });
                }
            });
        });

        // Yorumları oluşturulma tarihine göre sırala (en yeniden en eskiye)
        userComments.sort((a, b) => b.createdAt - a.createdAt);

        res.json(userComments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
});


// Not: Yorum ekleme, güncelleme ve silme işlemleri artık doğrudan poemRoutes.js içinde
// /api/poems/:poemId/comments ve /api/poems/:poemId/comments/:commentId rotalarında yönetilmektedir.
// Bu yüzden burada ayrı bir ekleme/güncelleme/silme rotasına gerek yoktur.

module.exports = router;