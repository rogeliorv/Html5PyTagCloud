'''
Created on Jun 20, 2011

@author: rogelio
'''

from tagcloud.lang.counter import get_tag_counts
from tagcloud.font_size_mappers import linear_mapper, logarithmic_mapper
from tagcloud import render_template_by_dicts
from tagcloud import sample_text

import os

def sample_cloud(text = '', link_container ='linkContainer',
                 canvas_id = 'canvasId', size='800'):
    '''Given some text do the following:
    
    1) Calculate the frequency of the elements in some given text
    2) Calculate a font size for the elements based on the frequency
    3) Render the template with the tag-fontsize table'''
    
    text = text or sample_text()
    
    # get_tag_counts guesses the langauge of the input.
    # Ignores stop words defined in lang/stop/<language>
    tags_frequency_table = get_tag_counts(text)
    
    # Once we have the frequency we calculate the font size for each tag
    # we can use a linear_mapper or a logarithmic_mapper depending on our preferences
    tags_font_size_table = logarithmic_mapper(tags_frequency_table)
    # We can send a dictionary mapping keys to links that will be opened when 
    # the tagcloud is clicked
    links = {}
    # The render configuration has the following params
    # canvas_id  The id of the <canvas> tag
    # link_container Where the links will be held in the html
    # size Indicates the canvas size
    render_conf = {'canvas_id': 'canvasId', 'link_container': 'linkContainer', 'size': '800'}
    render_template_by_dicts(tags_font_size_table, links=links, outfile_name='sample_cloud.html', render_conf=render_conf,
                             top = 25)
    return tags_font_size_table


if __name__ == '__main__':
    sample_cloud()