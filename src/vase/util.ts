import * as fs from 'fs';
import PatchedThrift from './patchedThrift';

const patchedFs = {
    ...fs,
    readFileSync(filename: string) {
        return fs.readFileSync(filename, 'utf8')
    }
};

/**
 * AST thrift
 */
export function parseFile(filename: string) {
    return new PatchedThrift({
        entryPoint: filename,
        fs: patchedFs,
        strict: false,
        allowOptionalArguments: true,
        defaultAsUndefined: false
    });
}
