import * as assert from 'assert';
import { getAndUpdateModeHandler } from '../../extensionBase';

import { Mode } from '../../src/mode/mode';
import { commandParsers, getParser } from '../../src/vimscript/exCommandParser';
import { newTest } from '../testSimplifier';
import { setupWorkspace, cleanUpWorkspace } from '../testUtils';

suite('getParser', () => {
  setup(async () => {
    await setupWorkspace();
    await getAndUpdateModeHandler();
  });

  suiteTeardown(cleanUpWorkspace);

  test('empty', () => {
    assert.notStrictEqual(getParser(''), undefined);
  });

  test(':marks', () => {
    assert.notStrictEqual(getParser('marks'), undefined);
    assert.strictEqual(getParser('marksx'), undefined);
  });

  test(':ju', () => {
    const j = getParser('ju');
    assert.notStrictEqual(j, undefined);
    assert.strictEqual(getParser('jumps'), j);
    assert.strictEqual(getParser('jump'), j);
  });

  test(':sh', () => {
    const s = getParser('shell');
    assert.notStrictEqual(s, undefined);
    assert.strictEqual(getParser('sh'), s);
  });

  test(':write', () => {
    const w = getParser('w');
    assert.notStrictEqual(w, undefined);

    assert.strictEqual(getParser('wr'), w);
    assert.strictEqual(getParser('wri'), w);
    assert.strictEqual(getParser('writ'), w);
    assert.strictEqual(getParser('write'), w);

    assert.strictEqual(getParser('writex'), undefined);
  });

  test(':nohlsearch', () => {
    assert.strictEqual(getParser('no'), undefined);

    const noh = getParser('noh');
    assert.notStrictEqual(noh, undefined);

    assert.strictEqual(getParser('nohl'), noh);
    assert.strictEqual(getParser('nohls'), noh);
    assert.strictEqual(getParser('nohlse'), noh);
    assert.strictEqual(getParser('nohlsea'), noh);
    assert.strictEqual(getParser('nohlsear'), noh);
    assert.strictEqual(getParser('nohlsearc'), noh);
    assert.strictEqual(getParser('nohlsearch'), noh);

    assert.strictEqual(getParser('nohlsearchx'), undefined);
  });

  test(':quitall', () => {
    const qa = getParser('qa');
    assert.notStrictEqual(qa, undefined);

    assert.strictEqual(getParser('qal'), qa);
    assert.strictEqual(getParser('qall'), qa);

    assert.strictEqual(getParser('quita'), qa);
    assert.strictEqual(getParser('quital'), qa);
    assert.strictEqual(getParser('quitall'), qa);
  });

  suite(':write args parser', () => {
    test('can parse empty args', () => {
      // TODO: perhaps we don't need to export this func at all.
      // TODO: this func must return args only, not a command?
      // TODO: the range must be passed separately, not as arg.
      const args = commandParsers.write.parser('');
      assert.strictEqual(args.arguments.append, undefined);
      assert.strictEqual(args.arguments.bang, undefined);
      assert.strictEqual(args.arguments.cmd, undefined);
      assert.strictEqual(args.arguments.file, undefined);
      assert.strictEqual(args.arguments.opt, undefined);
      assert.strictEqual(args.arguments.optValue, undefined);
      assert.strictEqual(args.arguments.range, undefined);
    });

    test('can parse ++opt', () => {
      const args = commandParsers.write.parser('++enc=foo');
      assert.strictEqual(args.arguments.append, undefined);
      assert.strictEqual(args.arguments.bang, undefined);
      assert.strictEqual(args.arguments.cmd, undefined);
      assert.strictEqual(args.arguments.file, undefined);
      assert.strictEqual(args.arguments.opt, 'enc');
      assert.strictEqual(args.arguments.optValue, 'foo');
      assert.strictEqual(args.arguments.range, undefined);
    });

    test('throws if bad ++opt name', () => {
      assert.throws(() => commandParsers.write.parser('++foo=foo'));
    });

    test('can parse bang', () => {
      const args = commandParsers.write.parser('!');
      assert.strictEqual(args.arguments.append, undefined);
      assert.strictEqual(args.arguments.bang, true);
      assert.strictEqual(args.arguments.cmd, undefined);
      assert.strictEqual(args.arguments.file, undefined);
      assert.strictEqual(args.arguments.opt, undefined);
      assert.strictEqual(args.arguments.optValue, undefined);
      assert.strictEqual(args.arguments.range, undefined);
    });

    test("can parse ' !cmd'", () => {
      const args = commandParsers.write.parser(' !foo');
      assert.strictEqual(args.arguments.append, undefined);
      assert.strictEqual(args.arguments.bang, undefined);
      assert.strictEqual(args.arguments.cmd, 'foo');
      assert.strictEqual(args.arguments.file, undefined);
      assert.strictEqual(args.arguments.opt, undefined);
      assert.strictEqual(args.arguments.optValue, undefined);
      assert.strictEqual(args.arguments.range, undefined);
    });

    test("can parse ' !cmd' when cmd is empty", () => {
      const args = commandParsers.write.parser(' !');
      assert.strictEqual(args.arguments.append, undefined);
      assert.strictEqual(args.arguments.bang, undefined);
      assert.strictEqual(args.arguments.cmd, undefined);
      assert.strictEqual(args.arguments.file, undefined);
      assert.strictEqual(args.arguments.opt, undefined);
      assert.strictEqual(args.arguments.optValue, undefined);
      assert.strictEqual(args.arguments.range, undefined);
    });

    newTest({
      title: 'Unknown ex command throws E492',
      start: ['tes|t'],
      keysPressed: ':fakecmd\n',
      end: ['tes|t'],
      endMode: Mode.Normal,
      statusBar: 'E492: Not an editor command: fakecmd',
    });
  });
});
