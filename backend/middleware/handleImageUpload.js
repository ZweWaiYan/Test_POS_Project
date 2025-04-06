const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { unlink } = require('fs/promises');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const imagePath = path.join(__dirname, '../images');
        try {
            await fs.promises.mkdir(imagePath, { recursive: true });
            cb(null, imagePath);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMIMETypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedMIMETypes.includes(file.mimetype) && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid File type.'));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10000000 } });

const handleImageUpload = async (req, res, next) => {
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    const middleware = isMultipart ? upload.single('image') : upload.none();

    middleware(req, res, async (err) => {
        if (err) {
            console.log(err)
            return res.status(400).send({ message: `Upload Error: ${err.message}` });
        }
        if (req.file) {
            const fileType = await import('file-type');
            const fileBuffer = fs.readFileSync(req.file.path);
            const detectedType = await fileType.fileTypeFromBuffer(fileBuffer);
            if (!detectedType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(detectedType.mime)) {
                await unlink(req.file.path);
                return res.status(400).send({ message: 'Invalid File Content. Expected one of: image/jpeg, image/png, image/gif, image/webp.' });
            }
        }
        next();
    });
};

module.exports = handleImageUpload;
