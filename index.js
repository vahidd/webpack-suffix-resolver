const path = require('path');
const fs = require('fs');

function SuffixResolver(suffix, extensions = ['.js']) {
  if (!suffix) {
    throw new Error(`Expected nonempty value for suffix but got ${suffix}`);
  }
  this.suffix = suffix.apply ? suffix.apply(null) : suffix;
  this.extensions = extensions;
}

SuffixResolver.prototype.apply = function (resolver) {
  const { extensions, suffix } = this;
  resolver
    .getHook('resolve')
    .tapAsync('SuffixResolver', function (request, resolveContext, callback) {
      const { context } = request;
      if (
        context.issuer &&
        !context.issuer.includes('node_modules')
      ) {
        const absPath = path.resolve(request.path, request.request);
        const { ext, name } = path.parse(absPath);

        let fileName;
        if (extensions.includes(ext)) {
          fileName = `${name}.${suffix}`;
        } else {
          fileName = `${request.request}.${suffix}`;
        }

        for (let index = 0; extensions.length > index; index += 1) {
          const filePath = path.resolve(
            request.path,
            `${fileName}${extensions[index]}`,
          );
          const exists = fs.existsSync(filePath);

          if (exists) {
            const obj = Object.assign({}, request, {
              request: filePath,
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
        }
      }
      callback();
    });
};

module.exports = SuffixResolver;
