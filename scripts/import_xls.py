"""Import Lendisk stock from warehouse .xls files.

Produces:
  data/products.json            -- catalogue rows consumed by prisma/seed.ts
  public/catalog/<hash>.webp    -- product photos (1200px) + <hash>-sm.webp (480px)

Usage:  python scripts/import_xls.py "<file1.xls>" "<file2.xls>" ...
Requires: xlrd, olefile, pillow
"""
import hashlib
import io
import json
import re
import sys
from pathlib import Path

import xlrd
from PIL import Image, ImageOps

sys.path.insert(0, str(Path(__file__).parent))
import xls_images  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT_IMG = ROOT / 'public' / 'catalog'
OUT_JSON = ROOT / 'data' / 'products.json'

ROW_RE = re.compile(
    r'^\s*(?P<d>\d{2})"\s*(?P<pcd>\d\*\d+(?:[.,]\d+)?)\s+(?P<w>\d+(?:[.,]\d+)?)\s+'
    r'[EЕ][TТ]\s*(?P<et>-?\d+(?:[.,]\d+)?)\s+(?P<dia>\d+(?:[.,]\d+)?)\s+(?P<rest>.+)$'
)
CODE_RE = re.compile(r'(?P<series>[A-Z]{2,3})[\s-]+(?P<num>\d{2,5})(?P<pos>\((?:F|R)\))?')

FINISHES = [
    (r'(?i)bronz', 'Бронзовый'),
    (r'(?i)titanium', 'Титан'),
    (r'(?i)candy\s*red', 'Красный'),
    (r'(?i)gun\s*metal|\bM?GM\b', 'Графитовый'),
    (r'\bG?BMF\b', 'Чёрный с полированной лицевой частью'),
    (r'\bBML\b|Black\s*Milling|B\s*Milling', 'Чёрный с фрезеровкой'),
    (r'\bMHB\b', 'Матовый гипер-чёрный'),
    (r'\bHB\b', 'Гипер-чёрный (Hyper Black)'),
    (r'\bGMF\b|G\d+/MF', 'Графит с полированной лицевой частью'),
    (r'Satin\s*Black', 'Сатиновый чёрный'),
    (r'Gloss\s*Black|GLOSS\s*BLACK|GlossB', 'Глянцевый чёрный'),
    (r'Matt?e?\s*B(lack)?\b|\bMB\b|\bBM\b|MattB', 'Матовый чёрный'),
    (r'\bBLACK\b|\bB\b|\bBlack\b|\bBLACK\s*BRUSH', 'Чёрный'),
    (r'\bMS\b|(?i:silver)|\bS\b|\bSMF\b|\bHS\b', 'Серебристый'),
    (r'Grey|Gray|GREY|\bGM\b', 'Серый'),
    (r'\bG\b|Gold|GOLD', 'Золотистый'),
]

MAKES_BY_PCD = {
    '4*98': ['Lada', 'Fiat'],
    '4*100': ['Lada', 'Kia', 'Hyundai', 'Renault', 'Toyota', 'Honda', 'Chevrolet', 'Volkswagen'],
    '4*108': ['Peugeot', 'Citroen', 'Ford'],
    '4*114,3': ['Nissan', 'Hyundai', 'Kia'],
    '5*100': ['Subaru', 'Volkswagen', 'Skoda', 'Toyota'],
    '5*105': ['Chevrolet', 'Opel'],
    '5*108': ['Volvo', 'Ford', 'Geely', 'Chery', 'Haval', 'Peugeot'],
    '5*110': ['Opel', 'Alfa Romeo'],
    '5*112': ['Mercedes-Benz', 'Audi', 'Volkswagen', 'Skoda', 'BMW'],
    '5*114,3': ['Toyota', 'Lexus', 'Kia', 'Hyundai', 'Nissan', 'Mazda', 'Mitsubishi', 'Haval', 'Chery', 'Geely'],
    '5*120': ['BMW', 'Land Rover', 'Volkswagen'],
    '5*130': ['Porsche', 'Mercedes-Benz'],
    '5*139,7': ['Lada Niva', 'Suzuki'],
    '5*150': ['Toyota Land Cruiser', 'Lexus'],
    '5*160': ['Ford Transit'],
    '6*114,3': ['Nissan', 'Mitsubishi'],
    '6*130': ['Mercedes-Benz G-Class', 'Mercedes-Benz Sprinter'],
    '6*139,7': ['Toyota', 'Lexus', 'Mitsubishi', 'Nissan', 'Chevrolet', 'Haval'],
}
NAMED_MAKES = ['BMW', 'MAYBACH', 'Mercedes', 'AMG', 'Audi', 'Porsche', 'Lexus', 'Toyota',
               'Range Rover', 'Land Rover', 'Volkswagen', 'VW', 'Tesla', 'Zeekr', 'Lixiang', 'LiXiang']

JUNK_RE = re.compile(r'ФОТО\s*В\s*ОБРАБОТКЕ.*$|ЦВЕТ\s*ЧЕРНЫЙ|\(\d{3}\)|\(IK\d+\)', re.I)


def num(s):
    return float(s.replace(',', '.'))


def fmt(x):
    return ('%g' % x).replace('.', ',')


def finish_of(rest):
    for pat, label in FINISHES:
        if re.search(pat, rest):
            return label
    return 'Фирменное покрытие'


def slugify(s):
    tr = str.maketrans({'*': 'x', ',': '-', '.': '-', '"': '', ' ': '-', '/': '-', '(': '', ')': ''})
    s = s.translate(tr).lower()
    s = re.sub(r'[^a-z0-9-]+', '', s)
    return re.sub(r'-+', '-', s).strip('-')


def save_image(data, cache):
    h = hashlib.sha1(data).hexdigest()[:16]
    if h in cache:
        return cache[h]
    try:
        im = Image.open(io.BytesIO(data))
        im = ImageOps.exif_transpose(im).convert('RGB')
    except Exception:
        cache[h] = None
        return None
    # square crop around centre (wheels are centred on a light backdrop)
    w, hgt = im.size
    side = min(w, hgt)
    im = im.crop(((w - side) // 2, (hgt - side) // 2, (w - side) // 2 + side, (hgt - side) // 2 + side))
    big = im.resize((min(side, 1200),) * 2, Image.LANCZOS)
    big.save(OUT_IMG / f'{h}.webp', 'WEBP', quality=80, method=6)
    im.resize((480, 480), Image.LANCZOS).save(OUT_IMG / f'{h}-sm.webp', 'WEBP', quality=76, method=6)
    cache[h] = f'/catalog/{h}.webp'
    return cache[h]


def main(paths):
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    products = {}
    cache = {}
    for p in paths:
        warehouse = 'Крым' if 'Крым' in p else ('Краснодар' if 'Краснодар' in p else Path(p).stem)
        sheet = xlrd.open_workbook(p).sheet_by_index(0)
        pics, _ = xls_images.extract(p)
        by_row = {}
        for pic in pics:
            by_row.setdefault(pic['row'], pic)
        for r in range(1, sheet.nrows):
            raw = str(sheet.cell_value(r, 1)).strip()
            qty = sheet.cell_value(r, 3)
            m = ROW_RE.match(raw)
            if not m or qty in ('', None):
                continue
            rest_raw = m['rest']
            photo_pending = bool(re.search(r'ФОТО\s*В\s*ОБРАБОТКЕ', rest_raw, re.I))
            rest = re.sub(r'\s+', ' ', JUNK_RE.sub('', rest_raw)).strip()
            # "(Voyah Free, AITO M5, ...)" -> explicit fitment list, kept out of the product name
            fit = []
            fm = re.search(r'\(([^()]*,[^()]*)(?:\)|$)', rest)
            if fm:
                fit = [x.strip() for x in fm.group(1).split(',') if x.strip()]
                rest = (rest[:fm.start()] + ' ' + rest[fm.end():]).strip()
            code = CODE_RE.search(rest)
            series = code['series'] if code else 'LD'
            model = f"{series}-{code['num']}" if code else rest.split(' ')[0]
            axle = {'(F)': 'передняя ось', '(R)': 'задняя ось'}.get(code['pos'] if code else None)
            forged = bool(re.search(r'ковка|forged', rest, re.I))
            flow = bool(re.search(r'flow\s*forming', rest, re.I))
            finish_code = rest[code.end():].strip() if code else ''
            finish_code = re.sub(r'(?i)ковка|\(flow forming\)|алюм\..*$', '', finish_code)
            finish_code = re.sub(r'[А-Яа-яЁё][А-Яа-яЁё\s.,\-]*', ' ', finish_code)  # Russian notes are not part of the code
            finish_code = re.sub(r'\s+', ' ', finish_code).strip(' ()-')
            d = int(m['d'])
            pcd = m['pcd'].replace('.', ',')
            width, et, dia = num(m['w']), num(m['et']), num(m['dia'])
            key = f'{d}|{pcd}|{width}|{et}|{dia}|{model}|{finish_code.upper()}'
            makes = list(MAKES_BY_PCD.get(pcd, []))
            for nm in NAMED_MAKES:
                if re.search(r'\b' + re.escape(nm) + r'\b', rest, re.I):
                    norm = {'MAYBACH': 'Mercedes-Benz', 'Mercedes': 'Mercedes-Benz', 'AMG': 'Mercedes-Benz',
                            'VW': 'Volkswagen', 'Range Rover': 'Land Rover', 'LiXiang': 'Lixiang'}.get(nm, nm)
                    if norm not in makes:
                        makes.insert(0, norm)
            for car in fit:
                mk = car.split(' ')[0]
                mk = {'Mercedes': 'Mercedes-Benz', 'VW': 'Volkswagen'}.get(mk, mk)
                if mk and mk not in makes:
                    makes.insert(0, mk)
            img = None
            pic = by_row.get(r)
            if pic and not photo_pending:
                img = save_image(pic['data'], cache)
            wholesale = sheet.cell_value(r, 4)
            wholesale = float(wholesale) if isinstance(wholesale, (int, float)) else 0.0
            if key in products:
                prod = products[key]
                prod['stockQty'] += int(qty)
                if warehouse not in prod['warehouse']:
                    prod['warehouse'] += f', {warehouse}'
                if not prod['images'] and img:
                    prod['images'] = [img]
                continue
            title = f'{model}{" " + finish_code if finish_code else ""}'
            products[key] = {
                'sku': f'{model}-{d}-{fmt(width)}-ET{fmt(et)}-{finish_code.upper()}'.replace(' ', ''),
                'name': title,
                'model': model,
                'brand': series,
                'diameter': d,
                'width': width,
                'pcd': pcd.replace('*', '×'),
                'et': et,
                'dia': dia,
                'finish': finish_of(rest),
                'finishCode': finish_code,
                'type': 'Кованый' if forged else ('Flow Forming' if flow else 'Литой'),
                'axle': axle,
                'compatibleMakes': makes,
                'stockQty': int(qty),
                'warehouse': warehouse,
                'wholesale': wholesale,
                'rawName': raw,
                'description': ('Подходит для: ' + ', '.join(fit) + '.') if fit else '',
                'images': [img] if img else [],
            }
    items = list(products.values())
    # Temporary retail price 9 000–12 000 ₽ following the wholesale rank (stored in DB, editable in admin)
    ranked = sorted(items, key=lambda x: (x['wholesale'], x['diameter']))
    n = max(len(ranked) - 1, 1)
    for i, it in enumerate(ranked):
        it['price'] = int(round((9000 + 3000 * i / n) / 100.0) * 100)
    used = set()
    skus = set()
    for it in items:
        sku, k = it['sku'], 2
        if sku in skus:
            sku = f"{it['sku']}-{it['pcd'].replace('×', 'X').replace(',', '.')}"
        while sku in skus:
            sku = f"{it['sku']}-{k}"; k += 1
        skus.add(sku)
        it['sku'] = sku
        base = slugify(f"{it['model']}-r{it['diameter']}-{fmt(it['width'])}j-{it['pcd']}-et{fmt(it['et'])}-{it['finishCode']}")
        s, k = base, 2
        while s in used:
            s = f'{base}-{k}'; k += 1
        used.add(s)
        it['slug'] = s
        del it['wholesale']
    items.sort(key=lambda x: (x['diameter'], x['brand'], x['model']))
    OUT_JSON.write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding='utf-8')
    with_img = sum(1 for x in items if x['images'])
    print(f'{len(items)} products, {with_img} with photos, {len([v for v in cache.values() if v])} images')


if __name__ == '__main__':
    main(sys.argv[1:])
