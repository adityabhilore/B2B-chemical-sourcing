import os

base = r'e:\A\Chemical_Market\client\src'

admin_dash = open(r'e:\A\Chemical_Market\client\admin_dash_content.jsx', 'r', encoding='utf-8').read()
style_guide = open(r'e:\A\Chemical_Market\client\style_guide_content.jsx', 'r', encoding='utf-8').read()

for path, content in [
    (os.path.join(base, 'pages', 'admin', 'DashboardPage.jsx'), admin_dash),
    (os.path.join(base, 'pages', 'dev', 'StyleGuidePage.jsx'), style_guide),
]:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Written:', os.path.basename(path))
print('Done')
