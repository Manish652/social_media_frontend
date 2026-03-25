export const optimizeCloudinaryVideo = (url) => {
  if (!url || typeof url !== "string") return url;
  
  // Only optimize Cloudinary URLs that haven't already been optimized
  if (url.includes("cloudinary.com/video/upload/") && !url.includes("q_auto")) {
    return url.replace("/upload/", "/upload/q_auto,f_auto,vc_h264:main:3.1,w_720/");
  }
  
  // For images, we can also use q_auto,f_auto
  if (url.includes("cloudinary.com/image/upload/") && !url.includes("q_auto")) {
    return url.replace("/upload/", "/upload/q_auto,f_auto,w_1080/");
  }
  
  return url;
};
