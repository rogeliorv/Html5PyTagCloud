# -*- coding: utf-8 -*-
import re
from stopwords import StopWords
from itertools import chain

def get_tag_counts(text):
    """
    Search tags in a given text. The language detection is based on stop lists.
    This implementation is inspired by https://github.com/jdf/cue.language. Thanks Jonathan Feinberg.
    """
    words = map(lambda x:x.lower(), re.findall(r'\w+', text, re.UNICODE))
    
    s = StopWords()
    s.load_language(s.guess(words))
    
    counted = {}
    
    for word in words:
        if not s.is_stop_word(word) and len(word) > 1:
            if counted.has_key(word):
                counted[word] += 1
            else: 
                counted[word] = 1
      
    return counted

def sum_tag_counts(first, second):
    '''Given to dictionaries with tags and frequencies, sums both and
    returns the result.'''
    result = {}
    for tag in chain(first.keys(), second.keys()):
        if tag not in result: result[tag] = first.get(tag, 0) + second.get(tag, 0)
    return result
    
    