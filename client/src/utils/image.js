/**
 * Utility for image optimization, assuming images might be hosted on Cloudinary
 * or a local server. This adds necessary query parameters for responsive sizing and formatting.
 */

export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '/placeholder.jpg';
  
  // If the URL is a Cloudinary URL, we can inject transformations
  if (url.includes('res.cloudinary.com')) {
    const { width = 500, quality = 'auto', format = 'auto' } = options;
    
    // Cloudinary URLs typically look like:
    // https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/<folder>/<filename>
    
    // We want to insert transformations after '/upload/'
    const transformation = `w_${width},q_${quality},f_${format}`;
    
    return url.replace('/upload/', `/upload/${transformation}/`);
  }
  
  // If it's a local or relative URL, just return it as is or handle logic
  // (In production with Cloudinary, all uploaded image URLs should be Cloudinary URLs)
  return url;
};
