const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const uploadUserAvatar = (id, tempAvatarInfo) => {
  const { path: tempUpload, originalname } = tempAvatarInfo;
  const filename = `${id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  Jimp.read(tempUpload, (err, lenna) => {
    if (err) throw err;
    lenna
      .resize(250, 250)
      .quality(75)
      .write(resultUpload, () => {
        fs.unlink(tempUpload, err => {
          if (err) throw new Error(err.message);
        });
      });
  });
  return `/avatars/${filename}`;
};

module.exports = uploadUserAvatar;
