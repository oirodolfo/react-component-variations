import entries from 'object.entries';
import path from 'path';
import has from 'has';

import validateProject from '../helpers/validateProject';
import getComponents from '../helpers/getComponents';
import getVariationProviders from '../helpers/getVariationProviders';
import getDescriptorFromProvider from '../helpers/getDescriptorFromProvider';

function stripExtension(actualPath) {
  return path.join(path.dirname(actualPath), path.basename(actualPath, path.extname(actualPath)));
}

function stripMatchingPrefix(prefix, toStrip) {
  return stripExtension(toStrip.startsWith(prefix) ? toStrip.slice(prefix.length) : toStrip);
}

export default function forEachDescriptor(
  projectConfig,
  {
    getExtras = () => {},
    getDescriptor = getDescriptorFromProvider,
    projectRoot = process.cwd(),
  } = {},
) {
  validateProject(projectConfig);

  if (typeof getDescriptor !== 'function' || getDescriptor.length < 1 || getDescriptor.length > 2) {
    throw new TypeError('`getDescriptor` must be a function that accepts exactly 1 or 2 arguments');
  }

  const Components = getComponents(projectConfig, projectRoot);
  const variations = getVariationProviders(projectConfig, projectRoot, { fileMapOnly: true });

  if (Object.keys(Components).length === 0) {
    throw new RangeError('Zero components found');
  }
  if (Object.keys(variations).length === 0) {
    throw new RangeError('Zero variations found');
  }

  const {
    variationsRoot,
  } = projectConfig;
  const actualRoot = variationsRoot ? path.join(projectRoot, variationsRoot) : projectRoot;

  return function traverseVariationDescriptors(callback) {
    if (typeof callback !== 'function' || callback.length < 1 || callback.length > 2) {
      throw new TypeError('a callback that accepts exactly 1 or 2 arguments is required');
    }
    entries(variations).forEach(([filePath, { actualPath, Module }]) => {
      const provider = has(Module, 'default') ? Module.default : Module;
      if (typeof provider !== 'function') {
        throw new TypeError(`“${filePath}” does not export default a function; got ${typeof provider}`);
      }
      const hierarchy = stripMatchingPrefix(actualRoot, actualPath);
      const descriptor = getDescriptor(provider, {
        Components,
        variations,
        getExtras,
        projectConfig,
      });
      callback(descriptor, {
        variationProvider: {
          path: filePath,
          resolvedPath: actualPath,
          hierarchy,
        },
        get variationPath() {
          console.warn('this property is deprecated in favor of the `variationProvider` object’s `path` property');
          return filePath;
        },
      });
    });
  };
}
