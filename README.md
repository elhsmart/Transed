Transed
=======

Chrome app for translators

##Templating
So, Google Chrome packaged Apps does not allow any code evaluation. Sad but true. That's why i decide to move forward
with handlebars.js and precompilation with node and require.js.

To get ll stuff working just follow this simple steps

1. Install Node.js and npm. Several ways to get job done can be found on internets, but i willpost some links here.
    * For MacOS (i've used this on my laptop): http://shapeshed.com/setting-up-nodejs-and-npm-on-mac-osx/
    * For Gentoo: Node.js (net-libs/nodejs) exist in portage (npm installs with node as well), so it must be not a problem.
    * For other systems please lurk internets for help. I swear it exists.

2. Install handlebars with npm.

```bash
root@example npm install -g handlebars
```

3. Run bash-script for template compilation:

```bash
user@example<repo_path> /bin/tmpl_compile.sh
```

Now you ready to go and attach unpacked app to Chrome.