"""Extract embedded pictures (with row anchors) from a BIFF8 .xls file."""
import struct
import olefile


def _records(data):
    i = 0
    n = len(data)
    while i + 4 <= n:
        rid, ln = struct.unpack_from('<HH', data, i)
        yield rid, data[i + 4:i + 4 + ln]
        i += 4 + ln


def _escher(buf, off=0, end=None):
    end = len(buf) if end is None else min(end, len(buf))
    while off + 8 <= end:
        verinst, typ, ln = struct.unpack_from('<HHI', buf, off)
        ver, inst = verinst & 0xF, verinst >> 4
        body = off + 8
        yield ver, inst, typ, body, ln
        off = body + ln


def _blips(group):
    """Return list of (ext, bytes) in BSE order (index 1-based via list+1)."""
    out = []

    def walk(off, end):
        for ver, inst, typ, body, ln in _escher(group, off, end):
            if typ == 0xF007:  # BSE
                out.append(_blip_from_bse(group, body, ln))
            elif ver == 0xF:
                walk(body, body + ln)
    walk(0, len(group))
    return out


def _blip_from_bse(buf, body, ln):
    # BSE fixed part is 36 bytes, then optional name, then embedded blip
    cbName = buf[body + 33]
    boff = body + 36 + cbName
    if boff + 8 > body + ln:
        return None
    verinst, typ, bl = struct.unpack_from('<HHI', buf, boff)
    inst = verinst >> 4
    d = boff + 8
    if typ in (0xF01D, 0xF02A):  # JPEG
        skip = 17 + (16 if inst in (0x46B, 0x6E3) else 0)
        return ('jpg', buf[d + skip:d + bl])
    if typ == 0xF01E:  # PNG
        skip = 17 + (16 if inst == 0x6E1 else 0)
        return ('png', buf[d + skip:d + bl])
    return None


def _anchors(drawing):
    res = []

    def walk(off, end):
        for ver, inst, typ, body, ln in _escher(drawing, off, end):
            if typ == 0xF004:  # SpContainer
                pib = None
                anchor = None
                for v2, i2, t2, b2, l2 in _escher(drawing, body, body + ln):
                    if t2 in (0xF00B, 0xF122):  # OPT
                        for k in range(i2):
                            pid, val = struct.unpack_from('<HI', drawing, b2 + k * 6)
                            if pid & 0x3FFF == 0x104:
                                pib = val
                    elif t2 == 0xF010 and l2 >= 18:
                        _, c1, _, r1, _, c2, _, r2, _ = struct.unpack_from('<9H', drawing, b2)
                        anchor = (r1, c1, r2, c2)
                if pib and anchor:
                    res.append((pib, anchor))
            elif ver == 0xF:
                walk(body, body + ln)
    walk(0, len(drawing))
    return res


def extract(path):
    ole = olefile.OleFileIO(path)
    wb = ole.openstream('Workbook').read()
    group = bytearray()
    sheets = []  # list of bytearray drawing streams per sheet
    cur = None
    last = None
    for rid, payload in _records(wb):
        if rid == 0x00EB:
            group += payload; last = 'g'
        elif rid == 0x003C and last == 'g':
            group += payload
        elif rid == 0x0809:  # BOF
            cur = bytearray(); last = None
        elif rid == 0x00EC:
            if cur is not None:
                cur += payload
            last = 'd'
        elif rid == 0x005D and cur is not None:
            last = 'd'  # after 8224 bytes Excel continues drawing data via CONTINUE after OBJ
        elif rid == 0x003C and last == 'd':
            cur += payload
        elif rid == 0x000A:  # EOF
            if cur:
                sheets.append(bytes(cur))
            cur = None; last = None
        else:
            last = None
    blips = _blips(bytes(group))
    result = []
    for sd in sheets:
        for pib, (r1, c1, r2, c2) in _anchors(sd):
            b = blips[pib - 1] if 0 < pib <= len(blips) else None
            if b:
                result.append({'row': r1, 'row2': r2, 'col': c1, 'ext': b[0], 'data': b[1]})
    return result, len(blips)
