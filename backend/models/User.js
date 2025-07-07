const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifre hash'leme için

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Kullanıcı rolü
    canPostPoems: { type: Boolean, default: false }, // Şiir ekleme yetkisi
    createdAt: { type: Date, default: Date.now }
});

// Şifreyi kaydetmeden önce hash'le (pre-save hook)
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Şifre değiştirilmediyse hash'leme
        next();
    }
    const salt = await bcrypt.genSalt(10); // Tuz oluştur
    this.password = await bcrypt.hash(this.password, salt); // Şifreyi hash'le
    next();
});

// Şifreleri karşılaştırmak için metod
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);