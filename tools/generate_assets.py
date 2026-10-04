"""
Script tao anh mau trong assets/img bang Pillow:
- thumb-01.jpg -> thumb-16.jpg (16:9)
- thumb-placeholder.jpg
- avatar-admin.png
- avatar-user.png
- logo.svg
"""

import os
from PIL import Image, ImageDraw, ImageFont

IMG_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
os.makedirs(IMG_DIR, exist_ok=True)

# Bang mau gradient dep
PALETTES = [
    ((37, 99, 235), (30, 64, 175)),     # Blue
    ((220, 38, 38), (185, 28, 28)),     # Red
    ((5, 150, 105), (4, 120, 87)),      # Emerald
    ((217, 119, 6), (180, 83, 9)),      # Amber
    ((124, 58, 237), (109, 40, 217)),   # Purple
    ((13, 148, 136), (15, 118, 110)),   # Teal
    ((236, 72, 153), (219, 39, 119)),   # Pink
    ((79, 70, 229), (67, 56, 202))      # Indigo
]

# 1. Tạo thumbnails
width, height = 480, 270
for i in range(1, 17):
    c1, c2 = PALETTES[(i - 1) % len(PALETTES)]
    im = Image.new('RGB', (width, height), color=c1)
    draw = ImageDraw.Draw(im)
    
    # Gradient hieu ung
    for y in range(height):
        factor = y / height
        r = int(c1[0] * (1 - factor) + c2[0] * factor)
        g = int(c1[1] * (1 - factor) + c2[1] * factor)
        b = int(c1[2] * (1 - factor) + c2[2] * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
        
    # Ve bieu tuong Play o giua
    cx, cy = width // 2, height // 2
    # Vong tron trang mo
    draw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(255, 255, 255, 60), outline=(255, 255, 255))
    # Hinh tam giac Play
    draw.polygon([(cx - 10, cy - 20), (cx - 10, cy + 20), (cx + 20, cy)], fill=(255, 255, 255))
    
    filename = f"thumb-{i:02d}.jpg"
    im.save(os.path.join(IMG_DIR, filename), quality=85)

# Placeholder fallback image
placeholder = Image.new('RGB', (width, height), color=(226, 232, 240))
p_draw = ImageDraw.Draw(placeholder)
cx, cy = width // 2, height // 2
p_draw.rectangle([cx - 45, cy - 30, cx + 45, cy + 30], outline=(148, 163, 184), width=3)
p_draw.polygon([(cx - 10, cy - 15), (cx - 10, cy + 15), (cx + 15, cy)], fill=(148, 163, 184))
placeholder.save(os.path.join(IMG_DIR, "thumb-placeholder.jpg"), quality=80)

# Avatars
def create_avatar(filename, bg_color, text):
    size = 120
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    draw.ellipse([0, 0, size, size], fill=bg_color)
    # Don gian ve hinh nguoi
    cx, cy = size // 2, size // 2
    # Dau nguoi
    draw.ellipse([cx - 24, cy - 35, cx + 24, cy + 13], fill=(255, 255, 255))
    # Vai / than
    draw.chord([cx - 42, cy + 20, cx + 42, size + 30], 180, 360, fill=(255, 255, 255))
    im.save(os.path.join(IMG_DIR, filename))

create_avatar("avatar-admin.png", (37, 99, 235), "A")
create_avatar("avatar-user.png", (100, 116, 139), "U")

# Logo SVG
logo_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#2563EB"/>
  <path d="M16 12L28 20L16 28V12Z" fill="white"/>
</svg>"""

with open(os.path.join(IMG_DIR, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(logo_svg)

print("Generated all placeholder images & logo successfully!")
