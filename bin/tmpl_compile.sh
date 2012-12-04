#!/usr/bin/env bash
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../js/tmpl/"
find $DIR -type f -name '*.html' -print0 | xargs -I{} -0 handlebars {} -f {}.js