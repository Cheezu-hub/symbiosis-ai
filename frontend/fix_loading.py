import os
import glob
import re

target_dir = r'd:\projects\symbiotech\frontend\src'
pages_dir = os.path.join(target_dir, 'pages')

files = glob.glob(os.path.join(pages_dir, '*.jsx'))
files.append(os.path.join(target_dir, 'App.jsx'))

def replace_loading_block(content):
    # Match the block for `App.jsx`
    pattern1 = re.compile(
        r'const LoadingSpinner = \(\) => \{\s*return \(\s*<div[^>]*height:\s*\'100vh\'[^>]*>.*?</div>\s*\);\s*\};',
        re.DOTALL
    )
    res1 = '''const LoadingSpinner = () => {
  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  );
};'''
    content, c1 = re.subn(pattern1, res1, content)
    
    # Match the block for `pages/`
    pattern2 = re.compile(
        r'  if \(loading\) \{\s*return \(\s*<div[^>]*height:\s*\'100vh\'[^>]*>.*?</div>\s*\);\s*\}',
        re.DOTALL
    )
    res2 = '''  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }'''
    content, c2 = re.subn(pattern2, res2, content)
    
    return content, c1 + c2

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = replace_loading_block(content)
    if count > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {os.path.basename(fpath)}')
