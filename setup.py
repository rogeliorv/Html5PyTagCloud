'''
Created on Jun 21, 2011

@author: rogelio
'''

from setuptools import setup, find_packages
setup(
    name = "Html5PyTagCloud",
    version = "0.1",
    packages = find_packages(),
    
    package_data = {
            # If any package contains *.txt or *.rst files, include them:
            '': ['*.txt', '*.html', '*.js'],
            'tagcloud.lang': ['stop/*']
    },
      
      
    # metadata for upload to PyPI
    author = "rogeliorv",
    description = '''Html5PyTagcloud is aimed to provide an example on how to build a tag cloud using
the html + javascript tagcloud from goat1000 (http://www.goat1000.com/).

The tagcloud is created based on some given text, stop words are filtered using the lang package
in PyTagCloud (https://github.com/atizo/PyTagCloud/).''',

    license = 'Creative Commons Attribution 3.0 Unported License',
    keywords = "html5 javascript tagcloud PyTagCloud",
    url = "http://github.com/rogeliorv/Html5PyTagCloud/",      
)