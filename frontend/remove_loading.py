import os
import glob
import re

target_dir = r'd:\projects\symbiotech\frontend\src\pages'
files = glob.glob(os.path.join(target_dir, '*.jsx'))

pattern = re.compile(
    r'  if \(loading\) \{\s*return \(\s*<div className="loading">\s*<div className="spinner" />\s*</div>\s*\);\s*\}\s*',
    re.DOTALL
)

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = re.subn(pattern, '', content)
    
    if count > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {os.path.basename(fpath)}')
