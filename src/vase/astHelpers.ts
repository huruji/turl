import { Definitions, ProgramAst } from 'thriftrw';

export function resolveType(identifier: string, thriftDefinitions: Record<string, ProgramAst>) {
    if (identifier.indexOf('.') !== -1) {
        [, identifier] = identifier.split('.');
    }
    const definitions = Object
        .keys(thriftDefinitions)
        .reduce((prev, current) => {
            return [...prev, ...thriftDefinitions[current].definitions]
        }, [] as Definitions[]);

    return definitions.find(d => d.id.name === identifier)!;
}
