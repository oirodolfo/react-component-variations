import getProjectExtras from './getProjectExtras';

export default function getDescriptorFromProvider(provider, {
  Components,
  projectConfig,
  projectRoot,
  getExtras = undefined,
  projectMetadata = undefined,
}) {
  const descriptor = provider(Components, getProjectExtras({
    projectConfig,
    projectRoot,
    getExtras,
  }));
  return {
    ...descriptor,
    ...(projectMetadata && {
      metadata: {
        ...projectMetadata,
        ...descriptor.metadata,
      },
    }),
  };
}
