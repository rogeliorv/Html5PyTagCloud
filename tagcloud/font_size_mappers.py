'''
Created on Jun 20, 2011

@author: rogelio
'''

'''This modules provies two ways to calculate the font size of a certain tag given its frequency.
Linear mapping and logarithmic mapping.

Linear usually gives good looking tagclouds, but if the frequency is very similar between tags there 
won't be anything to stand out.

Logarithmic can solve some of the problems of linear mapping but it can make tags without that much
frequency to stand out.

You should read: http://www.echochamberproject.com/node/247 and 
http://blogs.dekoh.com/dev/2007/10/29/choosing-a-good-font-size-variation-algorithm-for-your-tag-cloud/

for more info on this subject'''


import math

def linear_mapper(tags, min_font_size = 10, max_font_size = 60):
    '''Given a dict with tags and their frequency. Returns a map with tags and the suggested
    font size'''
    mapping = {}
    if tags:
        min_frequency, max_frequency = minmax(tags.values())
        
        for tag, frequency in tags.items():
            mapping[tag] = linear_mapping_size(frequency, min_frequency, max_frequency,
                                               min_font_size, max_font_size)
    return mapping
    
    
    
def linear_mapping_size(frequency, min_frequency, max_frequency, 
                        min_font_size = 10, max_font_size = 100):
    '''Linear formula'''
    
    
    weight = (frequency-min_frequency)/float((max_frequency-min_frequency))
    return min_font_size + int(round((max_font_size-min_font_size)*weight))

def logarithmic_mapper(tags, min_font_size = 12, max_font_size = 100):
    mapping = {}
    if tags:
        min_frequency, max_frequency = minmax(tags.values())
        
        for tag, frequency in tags.items():
            mapping[tag] = linear_mapping_size(frequency, min_frequency, max_frequency,
                                               min_font_size, max_font_size)
    return mapping


def logarithmic_mapping_size(frequency, min_frequency, max_frequency,
                        min_font_size = 12, max_font_size = 100):
    '''Logarithmic formula'''
    weight = (math.log(frequency)-math.log(min_frequency))/(math.log(max_frequency)-math.log(min_frequency))
    return min_font_size + int(round((max_font_size - min_font_size)*weight))


def minmax(iterable):
    '''A quick and dirty minmax implementation'''
    it = iter(iterable)
    min = max = it.next()
    for element in it:
        if element < min: min = element
        if element > max: max = element
        
    return min, max
