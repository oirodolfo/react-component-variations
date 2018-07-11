import validateProjects from '../../src/helpers/validateProjects';

describe('validateProjects', () => {
  it('throws when projectNames is not a non-empty array', () => {
    [undefined, null, true, false, () => {}, {}].forEach((nonArray) => {
      expect(() => validateProjects({}, nonArray)).toThrow(TypeError);
    });

    expect(() => validateProjects({}, [])).toThrow(TypeError);
  });

  it('has a proper error message when throwing', () => {
    const extraMsg = 'SOME EXTRA STUFF';
    let error;
    try {
      validateProjects({}, [], extraMsg);
    } catch (e) {
      error = e;
    }
    expect(error).toMatchObject({
      message: expect.stringContaining(extraMsg),
    });
  });
});
