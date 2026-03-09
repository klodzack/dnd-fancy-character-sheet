const yaml = require('yaml');
const fs = require('node:fs/promises');
const { type } = require('node:os');
const { get } = require('node:http');
const { Character } = require('./lib/character');

(async () => {

    const file = await fs.readFile('./characters/silas.yaml', 'utf-8');
    const data = yaml.parse(file);

    const char = Character.from(data);

    const abilityCategories = categorizeBy(data.abilities, 'category');

    await fs.mkdir('./tex', { recursive: true });
    const out = await fs.open('./tex/silas.tex', 'w')
    await out.write('\\documentclass[twocolumn]{article}\n');
    await out.write('\\raggedbottom\n');
    await out.write('\\usepackage[margin=0.6in]{geometry}\n');
    await out.write('\\begin{document}\n');
    for (const [category, abilities] of Object.entries(abilityCategories)) {
        const hasReference = abilities.some(a => !a.skipReference);
        await out.write(`\\section${hasReference ? '' : '*'}{${hasReference ? '' : '\\phantom{1}\\quad '}${category}}\n`);

        for (const ability of abilities) {
            await out.write(`${getAbilitySubsection(ability)}\n`);
            const type = getAbilityType(ability);
            if (type.type === 'weapon') {
                let bonus = char.getAbilityModifier(type.ability);
                if (type.proficiency === 'proficient') {
                    bonus += char.getProficiencyBonus();
                }
                if (type.proficiency === 'expertise') {
                    bonus += char.getProficiencyBonus() * 2;
                }
                if (type.extraAttackBonus) {
                    bonus += type.extraAttackBonus;
                }
                await out.write(`+${bonus} to hit; ${type.damage} damage`);
                if (ability.oneline) {
                    await  out.write('; ');
                }
            }
            await out.write(`${ability.oneline}\n\n`);
        }
    }

    await out.write('\\clearpage\n');

    const referenceCategories= Object.fromEntries(
        Array.from(Object.entries(abilityCategories))
            .map(([category, abilities]) => [
                category,
                abilities.filter(a => !a.skipReference)
            ])
            .filter(([category, abilities]) => abilities.length > 0)
    )

    for (const [category, abilities] of Object.entries(referenceCategories)) {
        await out.write(`\\section{${category}}\n`);

        for (const ability of abilities) {
            await out.write('\\noindent\\begin{minipage}{\\columnwidth}\n');
            const type = getAbilityType(ability);
            await out.write(getAbilitySubsection(ability));
            await out.write('\n');
            if (type.castingTime) {
                await out.write(`\\noindent\\textbf{Casting Time}: ${type.castingTime}\n\n`);
            }
            if (type.range) {
                await out.write(`\\noindent\\textbf{Range}: ${type.range} feet\n\n`);
            }
            if (type.duration) {
                await out.write(`\\noindent\\textbf{Duration}: ${type.duration}\n\n`);
            }
            await out.write(`${ability.description}\n\n`);
            await out.write('\\end{minipage}\n\n');
        }

        await out.write('\\newpage\n');
    }


    await out.write('\\end{document}\n');

    await out.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
})

function categorizeBy(items, key) {
    const ret = {};
    for (const item of items) {
        const cat = item[key];
        if (!ret[cat]) {
            ret[cat] = [];
        }
        ret[cat].push(item);
    }
    return ret;
}

function getAbilityType(ability) {
    if ('weapon' in ability) {
        return {
            type: 'weapon',
            ...ability.weapon,
        }
    }
    if ('ability' in ability) {
        return {
            type: 'ability',
            ...ability.ability,
        }
    }
    if ('cantrip' in ability) {
        return {
            type: 'cantrip',
            ...ability.cantrip,
        }
    }
    if ('spell' in ability) {
        return {
            type: 'spell',
            ...ability.spell,
        }
    }

    return { type: 'unknown' };
}

function getAbilitySubsection(ability) {
    const type = getAbilityType(ability);
    let ret = `\\subsection${!!ability.skipReference ? '*' : ''}{`;
    if (ability.skipReference) {
        ret += '\\phantom{1.1}\\quad ';
    }
    switch(type.type) {
        case 'weapon':
        case 'ability':
            break;
        case 'cantrip':
            ret += 'Cantrip - ';
            break;
        case 'spell':
            ret += `Level ${type.level} Spell - `;
            break;
    }
    ret += ability.name;
    ret += '}';

    return ret;
}
