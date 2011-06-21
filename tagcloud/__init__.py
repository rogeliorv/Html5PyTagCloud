import os
import string

def html_links_from_tags(tags, data_weight = 'dataWeight', top = 0):
    '''Creates a bunch of html links with the given tags
    
    @tags     List of tuples of size three in which the elements are
    (tag, frequency, ref), example [(hola, 1, "http://hola.com")]
    @data_weight Is an extra property that will be added to the links from which
    javascript will gather the weights for the tags.
    '''
    
    links = []    
    link_template = '<a href="%s" %s="%d">%s</a>'
    
    tags = list(tags)
    tags.sort(lambda x,y: x[1] - y[1], reverse=True)
    
    for tag, frequency, ref in tags[0:(top or len(tags))]:
        links.append(link_template % (ref, data_weight, frequency, tag))
                
    return '<br />'.join(links)


def render_template_by_dicts(tags, links = None, outfile_name = 'sample_cloud.html',
                             render_conf = {}, top=50):
    
    if not links: links = {}
    
    tags_tuples = []
    for tag, frequency in tags.items():
        link = links.get(tag, '#')
        tags_tuples.append((tag, frequency, link))
    
    return render_template_by_tuples(tags_tuples, outfile_name = outfile_name, render_conf = render_conf)
    

def render_template_by_tuples(tags_tuples, outfile_name = 'sample_cloud.html', render_conf = {}, top = 50):
    
    render_conf.setdefault('canvas_id', 'canvasId')
    render_conf.setdefault('link_container', 'linkContainer')
    render_conf.setdefault('size', '800')
    
    # Prepare the template
    links = html_links_from_tags(tags_tuples, top = top)
    
    render_conf['links'] = links
    template_file = open(os.path.join(os.path.dirname(__file__),'docs', 'html5template.html'))
    html_template = string.Template(template_file.read())
    template_file.close()
    # Write the output file
    outfile = open(outfile_name, 'w')
    output = html_template.substitute(render_conf)
    outfile.write(output)
    outfile.close()
    
    
def sample_text():
    '''Load sample text from a file and return it as a string'''
    sample_file = open(os.path.join(os.path.dirname(__file__), 'docs', 'sample_text.txt'))
    text = sample_file.read()
    sample_file.close()
    return text
