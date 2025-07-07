const mongoose = require('mongoose');

// Yorum şeması (alt doküman olarak)
const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorUsername: { type: String, required: true }, // Kullanıcı adını doğrudan yorumda tut
    createdAt: { type: Date, default: Date.now }
});

// Şiir şeması
const PoemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorUsername: { type: String, required: true }, // Kullanıcı adını doğrudan şiirde tut
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Beğenen kullanıcı ID'lerinin dizisi
    comments: [CommentSchema], // Yorumlar dizisi (alt dokümanlar)
    // Yeni eklenen alan: isApproved
    isApproved: {
        type: Boolean,
        default: false, // Yeni eklenen şiirler varsayılan olarak onaylanmamış başlar
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poem', PoemSchema);