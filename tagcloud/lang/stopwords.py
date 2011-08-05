# -*- coding: utf-8 -*-
import os
import codecs

ACTIVE_LISTS = ('german, french, italian, english, spanish')

class StopWords(object):
    
    def __init__(self):
        
        self.stop_words_lists = {}
        self.language = None
        
        stop_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stop')
        
        for root, dirs, files in os.walk(stop_dir):
            for file in files:
                if not file in ACTIVE_LISTS:
                    continue
                stop_file = codecs.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stop/', file), 'r', 'utf-8')                
                self.stop_words_lists[file] = []                
                for stop_word in stop_file:
                    self.stop_words_lists[file].append(stop_word.strip().lower())
                stop_file.close()

    def load_language(self, language):
        self.language = language
                    
    def is_stop_word(self, word):
        if not self.language:
            raise LookupError("No language loaded")
        return word in self.stop_words_lists[self.language]
    
    def guess(self, words, default='english'):
        currentWinner = None;
        currentMax = 0;
        
        for language, stop_word_list in self.stop_words_lists.items():
            count = 0
            for word in words:
                if word in stop_word_list:
                    count += 1
                    
            if count > currentMax:
                currentWinner = language
                currentMax = count
        
        return currentWinner or default
    
