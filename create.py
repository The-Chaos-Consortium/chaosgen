import json

from flask import request, Response, redirect, render_template, url_for, Flask

import character
import characterclass
import dice

DEBUG = True

app = Flask(__name__)
app.config.from_object(__name__)

SYSTEMS = {
    'basic': character.BasicCharacter,
}

@app.template_filter()
def with_sign(number):
    return "+{0}".format(number) if number > 0 else str(number)

@app.route('/')
def index():
    return redirect('/basic/')

@app.route('/text/')
def index_text():
    return redirect('/basic/text/')

@app.route('/<system>/', defaults={'fmt': "html"})
@app.route('/<system>/<fmt>/')
def generate(system, fmt):
    if fmt == "text":
        template = "plaintext.txt"
        mimetype = "text/plain"
    elif fmt == "html":
        template = "index.html"
        mimetype = "text/html"
    elif fmt == "yaml":
        template = "yaml.txt"
        mimetype ="text/plain"
    elif fmt == "json":
        mimetype = "application/json"
    else:
        # default to HTML for unknown display formats
        return redirect(url_for('generate', system=system, fmt="html"))

    system = SYSTEMS.get(system, None)
    if not system:
        # default to basic for unknown systems
        return redirect(url_for('generate', system='basic', fmt=fmt))

    c = get_class(request.args.get('class'))
    context = system(classname=c)
    if fmt == "json":
        content = json.dumps(context.to_dict())
    else:
        content = render_template(template, c=context)
    response = Response(content, status=200, mimetype=mimetype)

    return response


def get_class(classname):
    """
    Verifies the supplied class paramter is a valid class name.
    """
    if classname not in characterclass.VALID_CLASS_NAMES:
        return None
    return classname


if __name__ == '__main__':
    app.run("0.0.0.0")