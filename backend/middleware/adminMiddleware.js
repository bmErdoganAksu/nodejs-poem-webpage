module.exports = (req, res, next) => {
    // Bu middleware, authMiddleware'in zaten çalışmış ve req.user'ı eklemiş olduğunu varsayar.
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gereklidir.' });
    }
    next();
};