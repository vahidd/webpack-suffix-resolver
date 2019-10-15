const path = require('path');
const fs = require('fs');

function SuffixResolver(suffix, extensions = ['.js']) {
  if (!suffix) {
    throw new Error(`Expected nonempty value for suffix but got ${suffix}`);
  }
  this.suffix = suffix.apply ? suffix.apply(null) : suffix;
  this.extensions = extensions;
}

const getResolveExtension = (file, suffix, extensions) => {
  const { name, dir } = path.parse(file);
  for (let index = 0; extensions.length > index; index += 1) {
    const currentExtension = extensions[index];
    const filePath = `${dir}/${name}${suffix}${currentExtension}`;
    if (fs.existsSync(filePath)) {
      return currentExtension;
    }
  }
  return false;
};

SuffixResolver.prototype.apply = function (resolver) {
  const { extensions, suffix } = this;
  resolver
    .getHook('resolve')
    .tapAsync('SuffixResolver', function (request, resolveContext, callback) {
      const { context } = request;
      if (
        context.issuer &&
        !context.issuer.includes('node_modules') &&
        !request.request.includes('node_modules') &&
        !request.path.includes('node_modules')
      ) {
        const [absPath] = path.resolve(request.path, request.request).split('?'); // also remove qs from path

        const resolveExtension = getResolveExtension(absPath, suffix, extensions);

        if (resolveExtension === false) {
          return callback();
        }

        const {request: req} = request;
        let insertPosition = req.length;
        const qsPos = req.indexOf(resolveExtension);
        if( qsPos !== -1 ){
          insertPosition = qsPos;
        }
        const obj = Object.assign({}, request, {
          request: req.slice(0, insertPosition) + suffix + req.slice(insertPosition),
        });

        const target = resolver.ensureHook('parsedResolve');
        return resolver.doResolve(
          target,
          obj,
          null,
          resolveContext,
          callback,
        );

      }

      callback();
    });
};

module.exports = SuffixResolver;
