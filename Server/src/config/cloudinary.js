import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary with optimizations
export const uploadToCloudinary = async (localFilePath, folder = 'jansetu-feed') => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      // Generate multiple sizes for responsive images
      eager: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto:low' },
        { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }
      ],
      eager_async: true
    });

    // Delete local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: response.secure_url,
      publicId: response.public_id,
      width: response.width,
      height: response.height,
      format: response.format,
      bytes: response.bytes,
      thumbnails: response.eager || []
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Clean up local file even if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (publicId, width = 800, height = 600, quality = 'auto:good') => {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality,
    fetch_format: 'auto'
  });
};

export default cloudinary;
