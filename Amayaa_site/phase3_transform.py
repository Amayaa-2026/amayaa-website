#!/usr/bin/env python3
"""
Phase 3 Step 2 — Amayaa site modularisation transform.
Run once from your terminal:  python3 ~/Downloads/Amayaa_site/phase3_transform.py
"""
import re, os, sys

SITE = os.path.dirname(os.path.abspath(__file__))
FILES = ['index.html','amayaa_sarees.html','amayaa_blog.html','amayaa_about.html',
         'amayaa_contact.html','amayaa_offers.html','amayaa_product.html']
SEARCH_PAGES = {'amayaa_sarees.html','amayaa_blog.html','amayaa_about.html',
                'amayaa_contact.html','amayaa_offers.html'}

def net_divs(line):
    return len(re.findall(r'<div[\s>]', line)) - line.count('</div>')

def find_div_end(lines, start):
    depth = 0
    for i in range(start, len(lines)):
        depth += net_divs(lines[i])
        if depth <= 0:
            return i
    return len(lines) - 1

def skip_noise(lines, j):
    """Skip blank lines and HTML comments."""
    while j < len(lines):
        s = lines[j].strip()
        if not s or s.startswith('<!--'):
            j += 1
        else:
            break
    return j

def transform(fname, lines):
    out = []
    i = 0
    while i < len(lines):
        L = lines[i]

        # A1: insert public.css after Google Fonts link
        if 'fonts.googleapis.com' in L and '<link' in L:
            out.append(L)
            out.append('<link rel="stylesheet" href="/public.css">\n')
            i += 1
            continue

        # A2: replace nav-wrap + mob-topbar + mob-backdrop + mob-panel with placeholder
        if '<div class="nav-wrap">' in L:
            j = find_div_end(lines, i) + 1
            j = skip_noise(lines, j)
            if j < len(lines) and '<div class="mob-topbar">' in lines[j]:
                j = find_div_end(lines, j) + 1
            j = skip_noise(lines, j)
            if j < len(lines) and 'id="mobBackdrop"' in lines[j]:
                j = find_div_end(lines, j) + 1
            j = skip_noise(lines, j)
            if j < len(lines) and ('id="mobPanel"' in lines[j] or 'id="mobMenu"' in lines[j]):
                j = find_div_end(lines, j) + 1
            out.append('<div id="nav-wrap"></div>\n')
            out.append('<script src="/nav.js"></script>\n')
            i = j
            continue

        # Also catch any leftover mob-topbar / mob-backdrop / mob-panel not caught above
        if ('<div class="mob-topbar">' in L or
                'id="mobBackdrop"' in L or
                'id="mobPanel"' in L or
                'id="mobMenu"' in L):
            i = find_div_end(lines, i) + 1
            continue

        # A4: remove srchOverlay div (nav.js injects a fresh copy)
        if fname in SEARCH_PAGES and 'id="srchOverlay"' in L and '<div' in L:
            i = find_div_end(lines, i) + 1
            continue

        # A5: replace footer.ft + WAF link with footer placeholder
        if '<footer class="ft"' in L:
            j = i
            fd = 0
            while j < len(lines):
                fd += lines[j].count('<footer') - lines[j].count('</footer>')
                if '</footer>' in lines[j] and fd <= 0:
                    break
                j += 1
            j += 1  # past </footer>
            j = skip_noise(lines, j)
            if j < len(lines) and 'class="waf"' in lines[j]:
                while j < len(lines) and '</a>' not in lines[j]:
                    j += 1
                j += 1  # past </a>
            out.append('<div id="footer-wrap"></div>\n')
            out.append('<script src="/footer.js"></script>\n')
            i = j
            continue

        out.append(L)
        i += 1

    # B2: about.html — strip duplicate goatcounter (anything after first </html>)
    if fname == 'amayaa_about.html':
        for idx, line in enumerate(out):
            if '</html>' in line:
                out = out[:idx + 1]
                if not out[-1].endswith('\n'):
                    out[-1] += '\n'
                break

    return out


all_ok = True
for fname in FILES:
    fpath = os.path.join(SITE, fname)
    if not os.path.exists(fpath):
        print(f'SKIP {fname} — not found')
        continue

    lines = open(fpath, 'r', encoding='utf-8').readlines()
    result = transform(fname, lines)
    open(fpath, 'w', encoding='utf-8').writelines(result)

    c = ''.join(result)
    checks = {
        'public.css':         '/public.css' in c,
        'nav-wrap div':       'id="nav-wrap"' in c,
        'nav.js':             'src="/nav.js"' in c,
        'footer-wrap div':    'id="footer-wrap"' in c,
        'footer.js':          'src="/footer.js"' in c,
        'no inline nav-wrap': 'class="nav-wrap"' not in c,
        'no mob-topbar':      '<div class="mob-topbar">' not in c,
        'no mob-ham':         'class="mob-ham"' not in c,
        'no inline footer':   '<footer class="ft"' not in c,
        'goatcounter once':   c.count('<script data-goatcounter') == 1,
    }
    if fname in SEARCH_PAGES:
        checks['no srchOverlay'] = '<div class="srch-overlay"' not in c

    fails = [k for k, v in checks.items() if not v]
    status = 'OK  ' if not fails else 'FAIL'
    print(f'{status} {fname}' + (f': {", ".join(fails)}' if fails else ''))
    if fails:
        all_ok = False

print()
if all_ok:
    print('All 7 pages transformed successfully.')
    print()
    print('Next steps:')
    print('  1. Update visual snapshots:')
    print('     cd ~/Downloads/Amayaa_site/testing && npx playwright test tests/visual.spec.js --update-snapshots')
    print('  2. Run full regression:')
    print('     cd ~/Downloads/Amayaa_site && bash testing/run_regression.sh')
    print('  3. If 3/3 green, commit and deploy:')
    print('     git add -A && git commit -m "Phase 3 Step 2: modularise nav/footer/CSS across all 7 public pages"')
    print('     bash ~/Downloads/test_and_deploy.sh deploy')
else:
    print('Some files FAILED — check output above before proceeding.')
    sys.exit(1)
