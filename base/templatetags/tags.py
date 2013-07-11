from django import template
import logging

logger = logging.getLogger('vincis.console')

def tags(parser, token):
    tag_name, tags = token.split_contents()
    return TagNode(tags)


class TagNode(template.Node):
    def __init__(self, tags):
        self.tags = template.Variable(tags)

    def render(self, context):
        try:
            tags = self.tags.resolve(context)
            text = ""
            for tag in tags:
                text += '<li><a href="/etiqueta/{tag.item}">{tag.item}</a></li>'.format(tag=tag)
            return text
        except template.VariableDoesNotExist:
            return ''

register = template.Library()
register.tag("tags", tags)
