import os
import stat
import subprocess
from PIL import Image
import imageio_ffmpeg

images_dir = r"c:\Users\anshika singh\OneDrive\Desktop\Projects\Khushi\images"

# Videos belonging to the Content Creation section
content_creation_videos = {
    "content1.mp4", "content10.mp4", "content2.mp4", "content3.mp4", 
    "content4.mp4", "content5.mp4", "content6.mp4", "content7.mp4", 
    "content8.mp4", "content9.mp4", "postervideo1.mp4"
}

def clear_readonly(path):
    try:
        if os.path.exists(path):
            os.chmod(path, stat.S_IWRITE)
    except Exception as e:
        print(f"Failed to clear read-only on {path}: {e}")

def get_size(path):
    return os.path.getsize(path)

def format_size(bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024
    return f"{bytes:.2f} TB"

def compress_image_high_quality(file_path):
    orig_size = get_size(file_path)
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        clear_readonly(file_path)
        with Image.open(file_path) as img:
            # EXIF Rotation
            try:
                if hasattr(img, '_getexif'):
                    exif = img._getexif()
                    if exif is not None:
                        orientation = exif.get(0x0112)
                        if orientation == 3:
                            img = img.rotate(180, expand=True)
                        elif orientation == 6:
                            img = img.rotate(270, expand=True)
                        elif orientation == 8:
                            img = img.rotate(90, expand=True)
            except Exception as e:
                pass

            # Resize to max 1600px (very clear for web)
            max_size = 1600
            w, h = img.size
            if w > max_size or h > max_size:
                if w > h:
                    new_w = max_size
                    new_h = int(h * (max_size / w))
                else:
                    new_h = max_size
                    new_w = int(w * (max_size / h))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Handle RGBA JPEGs
            if ext in ['.jpg', '.jpeg']:
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
            
            temp_path = file_path + ".tmp"
            clear_readonly(temp_path)
            
            if ext in ['.jpg', '.jpeg']:
                img.save(temp_path, "JPEG", quality=85, optimize=True)
            elif ext == '.png':
                img.save(temp_path, "PNG", optimize=True)
                
            new_size = get_size(temp_path)
            if new_size < orig_size:
                clear_readonly(file_path)
                with open(temp_path, "rb") as f_src:
                    data = f_src.read()
                with open(file_path, "wb") as f_dst:
                    f_dst.write(data)
                os.remove(temp_path)
                return orig_size, new_size
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return orig_size, orig_size
    except Exception as e:
        print(f"Error compressing image {os.path.basename(file_path)}: {e}")
        return None, None

def compress_video_hybrid(file_path, ffmpeg_path):
    orig_size = get_size(file_path)
    filename = os.path.basename(file_path).lower()
    ext = os.path.splitext(file_path)[1].lower()
    temp_path = file_path + ".tmp.mp4" if ext == '.mp4' else file_path + ".tmp.mov"
    
    # Check if this video belongs to the Content Creation section
    is_content_video = filename in content_creation_videos
    
    try:
        clear_readonly(file_path)
        
        if is_content_video:
            # CONTENT CREATION: Premium quality (CRF 18, 1080p, slow preset)
            scale_filter = "scale=if(gt(iw\\,ih)\\,min(1920\\,iw)\\,-2):if(gt(ih\\,iw)\\,min(1080\\,ih)\\,-2)"
            crf = "18"
            preset = "slow"
            audio_bitrate = "192k"
            quality_name = "PREMIUM (CRF 18, 1080p)"
        else:
            # OTHER SECTIONS: Aggressive compression (CRF 32, 480p, fast preset)
            scale_filter = "scale=if(gt(iw\\,ih)\\,min(640\\,iw)\\,-2):if(gt(ih\\,iw)\\,min(480\\,ih)\\,-2)"
            crf = "32"
            preset = "fast"
            audio_bitrate = "64k"
            quality_name = "COMPRESSED (CRF 32, 480p)"
            
        cmd = [
            ffmpeg_path,
            "-y",
            "-i", file_path,
            "-vcodec", "libx264",
            "-crf", crf,
            "-preset", preset,
            "-vf", scale_filter,
            "-acodec", "aac",
            "-b:a", audio_bitrate,
            temp_path
        ]
        
        print(f"Compressing {os.path.basename(file_path)} with {quality_name}...")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode == 0 and os.path.exists(temp_path):
            new_size = get_size(temp_path)
            clear_readonly(file_path)
            with open(temp_path, "rb") as f_src:
                data = f_src.read()
            with open(file_path, "wb") as f_dst:
                f_dst.write(data)
            os.remove(temp_path)
            return orig_size, new_size
        else:
            print(f"FFmpeg failed for {os.path.basename(file_path)}: {result.stderr}")
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return None, None
    except Exception as e:
        print(f"Error compressing video {os.path.basename(file_path)}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return None, None

def main():
    print("Starting hybrid compression pass...")
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    
    all_files = [os.path.join(images_dir, f) for f in os.listdir(images_dir)]
    image_files = [f for f in all_files if os.path.splitext(f)[1].lower() in ['.jpg', '.jpeg', '.png']]
    video_files = [f for f in all_files if os.path.splitext(f)[1].lower() in ['.mp4', '.mov']]
    
    total_orig = 0
    total_new = 0
    
    for img_path in image_files:
        orig, new = compress_image_high_quality(img_path)
        if orig is not None:
            total_orig += orig
            total_new += new
            if new < orig:
                print(f"Compressed Image {os.path.basename(img_path)}: {format_size(orig)} -> {format_size(new)}")
                
    for vid_path in video_files:
        orig, new = compress_video_hybrid(vid_path, ffmpeg_path)
        if orig is not None:
            total_orig += orig
            total_new += new
            if new < orig:
                print(f"Compressed Video {os.path.basename(vid_path)}: {format_size(orig)} -> {format_size(new)}")
                
    print("\n--- Hybrid Compression Summary ---")
    print(f"Size: {format_size(total_orig)} -> {format_size(total_new)}")
    print(f"Space Saved: {format_size(total_orig - total_new)} ({((total_orig - total_new) / total_orig * 100):.1f}% reduction)" if total_orig > 0 else "No space saved")

if __name__ == "__main__":
    main()
