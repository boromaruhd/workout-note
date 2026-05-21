from PIL import Image, ImageDraw

def make_icon(size, path):
    # 黒背景
    img = Image.new('RGB', (size, size), '#0a0a0a')
    draw = ImageDraw.Draw(img)

    # アクセントカラーの角丸正方形 (内側に少し余白)
    pad = size // 8
    radius = size // 5
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        fill='#d4ff3a'
    )

    # ダンベルのシンボル (中央に黒で描画)
    cx, cy = size // 2, size // 2
    bar_w = size * 0.45
    bar_h = size * 0.07
    plate_w = size * 0.10
    plate_h = size * 0.28

    # 中央のバー
    draw.rectangle(
        [cx - bar_w/2, cy - bar_h/2, cx + bar_w/2, cy + bar_h/2],
        fill='#0a0a0a'
    )
    # 左のプレート (2枚)
    draw.rounded_rectangle(
        [cx - bar_w/2 - plate_w*0.8, cy - plate_h/2, cx - bar_w/2 + plate_w*0.2, cy + plate_h/2],
        radius=size//40, fill='#0a0a0a'
    )
    draw.rounded_rectangle(
        [cx - bar_w/2 - plate_w*1.7, cy - plate_h*0.4, cx - bar_w/2 - plate_w*0.7, cy + plate_h*0.4],
        radius=size//40, fill='#0a0a0a'
    )
    # 右のプレート (2枚)
    draw.rounded_rectangle(
        [cx + bar_w/2 - plate_w*0.2, cy - plate_h/2, cx + bar_w/2 + plate_w*0.8, cy + plate_h/2],
        radius=size//40, fill='#0a0a0a'
    )
    draw.rounded_rectangle(
        [cx + bar_w/2 + plate_w*0.7, cy - plate_h*0.4, cx + bar_w/2 + plate_w*1.7, cy + plate_h*0.4],
        radius=size//40, fill='#0a0a0a'
    )

    img.save(path)
    print(f'Generated: {path}')

make_icon(192, '/home/claude/workout-pwa/public/icon-192.png')
make_icon(512, '/home/claude/workout-pwa/public/icon-512.png')

# favicon用のシンプルなSVG
favicon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#0a0a0a"/>
  <rect x="12" y="12" width="76" height="76" rx="16" fill="#d4ff3a"/>
  <rect x="28" y="46" width="44" height="8" fill="#0a0a0a"/>
  <rect x="22" y="38" width="10" height="24" rx="2" fill="#0a0a0a"/>
  <rect x="68" y="38" width="10" height="24" rx="2" fill="#0a0a0a"/>
</svg>'''
with open('/home/claude/workout-pwa/public/favicon.svg', 'w') as f:
    f.write(favicon_svg)
print('Generated: favicon.svg')
